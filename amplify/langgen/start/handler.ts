/**
 * langgen starter resolver — serves BOTH generateLanguage and
 * regenerateLanguage (event.info.fieldName distinguishes them). Thin: resolve
 * the target pack (find-or-create), write a DRAFT Language row if new + a
 * RUNNING GenerationRun, async-invoke the worker, return { runId, languageId }.
 * The long generation runs in the worker so this stays under the resolver
 * timeout.
 */
import { randomUUID } from 'node:crypto';
import { getItem, putItem } from '../shared/ddb';
import { KEY_VERSION, KEY_PHRASES } from '../shared/phraseKeys';
import { buildLanguageItem, buildRunItem } from '../shared/languageItem';
import {
  resolveGenerate,
  resolveRegenerate,
  type GenerateArgs,
  type Target,
} from './resolveTarget';
import { invokeWorker } from './invokeWorker';
import type { Schema } from '../../data/resource';

const env = (name: string): string => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  return v;
};

async function resolveFromEvent(fieldName: string, args: Record<string, unknown>): Promise<Target> {
  const deps = { getLanguage: (id: string) => getItem(env('LANGUAGE_TABLE'), id) };
  if (fieldName === 'regenerateLanguage') {
    return resolveRegenerate(deps, String(args.languageId));
  }
  return resolveGenerate(deps, args as unknown as GenerateArgs);
}

async function run(fieldName: string, args: Record<string, unknown>) {
  const target = await resolveFromEvent(fieldName, args);
  const runId = randomUUID();
  const now = new Date().toISOString();

  if (target.isNew) {
    await putItem(
      env('LANGUAGE_TABLE'),
      buildLanguageItem({
        id: target.languageId,
        now,
        locale: target.locale,
        name: target.languageName,
        nativeName: target.nativeName,
        flagEmoji: target.flagEmoji,
        keyVersion: KEY_VERSION,
      }),
    );
  }
  await putItem(
    env('GENERATION_RUN_TABLE'),
    buildRunItem({
      id: runId,
      now,
      kind: target.kind,
      locale: target.locale,
      languageId: target.languageId,
      keyVersion: KEY_VERSION,
      requestedCount: KEY_PHRASES.length,
    }),
  );
  await invokeWorker(env('WORKER_FUNCTION_NAME'), {
    runId,
    languageId: target.languageId,
    locale: target.locale,
    languageName: target.languageName,
    kind: target.kind,
  });
  return { runId, languageId: target.languageId };
}

export const handler: Schema['generateLanguage']['functionHandler'] = async (event) => {
  const fieldName =
    (event as { info?: { fieldName?: string } }).info?.fieldName ?? 'generateLanguage';
  return run(fieldName, event.arguments as Record<string, unknown>);
};
