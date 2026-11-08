#!/usr/bin/env node
/**
 * Ephemeral Amplify sandbox management for CI (pattern from johnpc/stoop).
 *
 * WHY: CI used to read ONE hardcoded developer sandbox stack. When that stack
 * was deleted (e.g. by a cost-cleanup sweep), every CI run failed with
 * StackDoesNotExistError. Now each CI run deploys its OWN sandbox
 * (`ci-<run_id>`), seeds it, tests against it and tears it down in a final
 * `if: always()` job — nothing standing, nothing shared, nothing to break.
 *
 * Stack names are DETERMINISTIC (see @aws-amplify/platform-core):
 *   amplify-<namespace>-<id>-sandbox-<sha512(namespace + id)[:10]>
 * where namespace = package.json "name". We always pass an already sanitized
 * identifier to `ampx`, so the id embedded in the stack name round-trips back to
 * the exact identifier — which lets `sweep` recover it from a stack it finds.
 *
 * Usage:
 *   node scripts/sandbox.mjs id            [--id X]  print the resolved identifier
 *   node scripts/sandbox.mjs name          [--id X]  print the derived stack name
 *   node scripts/sandbox.mjs deploy        [--id X]  ampx sandbox --once
 *   node scripts/sandbox.mjs config        [--id X]  ampx generate outputs --stack <name>
 *   node scripts/sandbox.mjs ensure-editor [--id X]  create TEST_USERNAME in the sandbox pool
 *   node scripts/sandbox.mjs delete        [--id X]  ampx sandbox delete --yes, then verify gone
 *   node scripts/sandbox.mjs sweep  [--hours 6] [--apply]  reap leaked ci-* sandboxes
 *
 * Identifier resolution (first hit wins): --id flag → SANDBOX_IDENTIFIER env →
 * system user (ampx's own default, so local `npm run e2e-config` still targets
 * your personal `<user>` sandbox). Always sanitized + length-capped.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { userInfo } from 'node:os';

const REGION = 'us-west-2';
const PROFILE = process.env.AWS_PROFILE ?? 'personal';
const NAMESPACE = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
).name;
const EDITOR_GROUP = 'editors';

const sanitize = (s) => (s ?? '').replace(/[^A-Za-z0-9]/g, '');

// ampx enforces `--identifier` matching /^[a-zA-Z0-9-]{1,15}$/. Keep ours purely
// alphanumeric (round-trips into the stack name unchanged) AND ≤15 chars; longer
// values keep a readable prefix plus a 6-char hash of the full value.
const IDENTIFIER_MAX = 15;
const cap = (s) =>
  s.length <= IDENTIFIER_MAX
    ? s
    : s.slice(0, IDENTIFIER_MAX - 6) + createHash('sha512').update(s).digest('hex').slice(0, 6);

const flag = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && i + 1 < process.argv.length ? process.argv[i + 1] : undefined;
};
const has = (name) => process.argv.includes(`--${name}`);

const resolveId = () => {
  const raw = flag('id') || process.env.SANDBOX_IDENTIFIER || userInfo().username;
  const id = cap(sanitize(raw));
  if (!id) throw new Error('Could not resolve a sandbox identifier.');
  return id;
};

const stackName = (id) => {
  const hash = createHash('sha512').update(NAMESPACE).update(id).digest('hex').slice(0, 10);
  return ['amplify', NAMESPACE, id.slice(0, 50), 'sandbox', hash].join('-');
};

// CI sandboxes are `ci-<github.run_id>` → sanitized `ci<digits>`. The sweep only
// ever touches this exact shape, so a personal sandbox (e.g. `xss`) or a branch
// deployment can never be reaped by it.
const isCiSandbox = (id) => /^ci\d+$/.test(id);

const npx = (args) => execFileSync('npx', args, { stdio: 'inherit' });
const aws = (args) =>
  execFileSync('aws', [...args, '--region', REGION, '--profile', PROFILE, '--output', 'json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'], // keep stderr on the error for inspection
  });

/** The sandbox root stack, or null when it doesn't exist. */
const describeStack = (name) => {
  try {
    return JSON.parse(aws(['cloudformation', 'describe-stacks', '--stack-name', name])).Stacks[0];
  } catch (e) {
    if (String(e.stderr ?? e.message).includes('does not exist')) return null;
    throw e;
  }
};
const isSandboxStack = (stack) =>
  (stack.Tags ?? []).some((t) => t.Key === 'amplify:deployment-type' && t.Value === 'sandbox');

const deploy = (id) => npx(['ampx', 'sandbox', '--once', '--identifier', id, '--profile', PROFILE]);
const config = (id) =>
  npx(['ampx', 'generate', 'outputs', '--stack', stackName(id), '--profile', PROFILE]);

/**
 * Delete the sandbox and VERIFY it is gone. A missing stack is success (a
 * re-run, or a run whose deploy never started). Fails loudly if the stack
 * survives, so a leak shows up as a red teardown job instead of a silent cost.
 */
const remove = (id) => {
  const name = stackName(id);
  if (!describeStack(name)) return console.log(`delete: ${name} does not exist — nothing to do.`);
  npx(['ampx', 'sandbox', 'delete', '--identifier', id, '--profile', PROFILE, '--yes']);
  const left = describeStack(name);
  if (left && left.StackStatus !== 'DELETE_COMPLETE')
    throw new Error(`delete: ${name} still exists (${left.StackStatus}).`);
  console.log(`delete: ${name} is gone.`);
};

/**
 * A fresh sandbox has a brand-new, EMPTY Cognito pool, so the editor account the
 * seed + acceptance tests sign in as doesn't exist yet. Create it (confirmed,
 * permanent password, in `editors`). The pool id comes from THIS sandbox's root
 * stack, and we refuse any stack not tagged as a sandbox — so this can never
 * write a user or password into a production pool.
 */
const ensureEditor = (id) => {
  const Username = process.env.TEST_USERNAME;
  const Password = process.env.TEST_PASSWORD;
  if (!Username || !Password) throw new Error('TEST_USERNAME / TEST_PASSWORD required.');
  const stack = describeStack(stackName(id));
  if (!stack) throw new Error(`ensure-editor: sandbox ${stackName(id)} does not exist.`);
  if (!isSandboxStack(stack))
    throw new Error(`ensure-editor: ${stack.StackName} is not a sandbox.`);
  const pool = stack.Outputs.find((o) => o.OutputKey === 'userPoolId')?.OutputValue;
  if (!pool) throw new Error(`ensure-editor: no userPoolId output on ${stack.StackName}.`);
  const idp = (op, ...args) =>
    aws(['cognito-idp', op, '--user-pool-id', pool, '--username', Username, ...args]);
  try {
    idp('admin-create-user', '--message-action', 'SUPPRESS');
  } catch (e) {
    if (!String(e.stderr ?? e.message).includes('UsernameExistsException')) throw e;
  }
  idp('admin-set-user-password', '--password', Password, '--permanent');
  idp('admin-add-user-to-group', '--group-name', EDITOR_GROUP);
  console.log(`ensure-editor: test user is CONFIRMED and in ${EDITOR_GROUP} (pool ${pool}).`);
};

/**
 * Reap LEAKED CI sandboxes: root stacks whose id is `ci<digits>`, tagged as an
 * Amplify sandbox, and created more than --hours ago (default 6 — far longer
 * than any CI run). Normal runs delete their own sandbox; this only catches the
 * rare one whose teardown job never ran. Dry-run unless --apply.
 */
const sweep = () => {
  const hours = Number(flag('hours') ?? 6);
  const cutoff = Date.now() - hours * 3_600_000;
  const rootRe = new RegExp(`^amplify-${NAMESPACE}-([A-Za-z0-9]+)-sandbox-[a-f0-9]{10}$`);
  // Root stacks only (nested stacks have a ParentId), slimmed to what we read.
  const query =
    'Stacks[?ParentId==null].{StackName:StackName,StackStatus:StackStatus,CreationTime:CreationTime,Tags:Tags}';
  const stacks = JSON.parse(aws(['cloudformation', 'describe-stacks', '--query', query]));
  const leaked = stacks
    .map((s) => ({ ...s, id: s.StackName.match(rootRe)?.[1] }))
    .filter((s) => s.id && isCiSandbox(s.id) && s.StackName === stackName(s.id))
    .filter((s) => isSandboxStack(s) && Date.parse(s.CreationTime) < cutoff);
  if (!leaked.length) return console.log(`sweep: no ci-* sandboxes older than ${hours}h.`);
  for (const s of leaked) {
    const verb = has('apply') ? 'DELETING' : 'would delete';
    console.log(`${verb} ${s.id} (${s.StackName}, ${s.StackStatus}, created ${s.CreationTime})`);
    if (has('apply')) remove(s.id);
  }
};

const cmd = process.argv[2];
const actions = {
  id: () => console.log(resolveId()),
  name: () => console.log(stackName(resolveId())),
  deploy: () => deploy(resolveId()),
  config: () => config(resolveId()),
  'ensure-editor': () => ensureEditor(resolveId()),
  delete: () => remove(resolveId()),
  sweep,
};
if (!actions[cmd]) {
  console.error(`Unknown command "${cmd ?? ''}". One of: ${Object.keys(actions).join(', ')}`);
  process.exit(1);
}
actions[cmd]();
