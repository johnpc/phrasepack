# PhrasePack

**PhrasePack is an AI-generated travel phrasebook.** Pick a language and the app generates the most
useful simple travel phrases for it — hello, thank you, "do you speak English?", "the check please",
"how much?", taxi, airport, bathroom — each shown with correct spelling, a phonetic pronunciation, and
a **play** button that speaks it (Polly audio). Any language can be generated **in-app** on demand, and
**regenerated** to fill in newly-added key phrases.

Architecture, quality bar, and toolchain descend from the **spork** app (`~/repo/spork`) — when a
pattern here is unclear, that's the reference implementation.

## How we work together (read this first)

The person directing you may be **non-technical** — an "idea guy" who owns the **product**. They define
**WHAT**: features, intent, Gherkin acceptance scenarios. **You own the HOW**: architecture, code
quality, testing, and every technical decision below.

- **Never ask them to make a technical call.** Don't surface coverage numbers, CRAP, lint, file-length,
  library choices, or schema design as questions. Decide them yourself, to the standards in this file.
- **Translate vague ideas into Gherkin.** When they describe a feature, propose concrete `.feature`
  scenarios and confirm those — that's the spec you build to.
- **Only escalate genuine _product_ questions** — ambiguous behavior, scope, copy, what a screen does.

## Workflow: specs-first vertical slices

Every feature ships as one **thin vertical slice** — UI + hook + API + backend model + tests, just
enough for the scenario, nothing speculative.

1. **Spec first.** Write/confirm Gherkin in `e2e/features/<slice>/*.feature`, steps in `e2e/steps/`.
2. **Scaffold backend only as the slice needs it** — add Amplify models + seed for exactly this
   slice's read patterns; don't model ahead of a UI.
3. **Implement to pass the spec** — follow the architecture + file conventions below.
4. **Run the full quality gate** (`npm run quality`) and get it green locally.
5. **Deploy + seed** the backend if it changed (`npx ampx sandbox`, `npm run seed`).
6. **Conventional commit, push, CI green.** Open a PR; CI blocks the merge.

### PR titles + demo artifacts

The **title** names the feature/fix/behavior plainly, from the reader's POV — a conventional-commit
line `type(scope): what changed`. No development narrative ("Phase 2a"), no issue-number soup;
reference issues in the body (`Closes #N`).

When a PR changes anything a user can **see or interact with**, the description MUST include a
screenshot or short video of it working, generated from the slice's own Gherkin test (Playwright
records `.webm` with `VIDEO=1`). Upload to `files.jpc.io` and paste the **permanent** `/d/` URL — it
renders inline. A `curl -I` returning a 307 is expected (it re-signs S3 each render); the link never
expires. All `aws` calls use `AWS_PROFILE=personal`.

```bash
FILE_PATH="test-results/<…>/video.webm"
FILENAME=$(basename "$FILE_PATH")
HASH=$(LC_ALL=C tr -dc 'A-Za-z0-9' < /dev/urandom | head -c 5)
AWS_PROFILE=personal aws s3 cp "$FILE_PATH" \
  "s3://amplify-d1wnjkkkrwiiql-mai-imagehostbucketaac3bfe7-aark0f5h8nw8/public/public/${HASH}-${FILENAME}" \
  --region us-west-2
echo "https://files.jpc.io/d/${HASH}-${FILENAME}"
```

## Stack

- **Client:** Ionic 8 + React 19 + TypeScript (strict), Vite, Capacitor (iOS + Android).
- **Backend:** AWS Amplify Gen2 — Cognito + AppSync (GraphQL) + DynamoDB + S3. Lives in `amplify/`.
- **AI:** Bedrock **Claude Haiku 4.5** (tool-forced structured output for translations + phonetics),
  **Amazon Polly** (neural) for audio.

## Domain model

One content type: a **language pack**.

- **`Language`** (published unit) — `locale` (BCP-47, drives the Polly voice), `name`, `flagEmoji`,
  `phraseCount`, `keyVersion` (the phrase-catalog version it was generated against), `status`.
- **`Phrase`** (item) — `phraseKeySlug` (ties back to the canonical catalog), `categorySlug`, `ord`,
  `sourceText` (English), `translation` (correct foreign spelling), `phonetic`, `audioPath` (S3 key).
  Read by `languageId` in `ord` order.
- **`GenerationRun`** — one AI generation (dashboard/telemetry); `kind` = GENERATE | REGENERATE.
- **Mutations** `generateLanguage` / `regenerateLanguage` — **guest-callable**; a thin starter creates/
  looks-up the pack + a RUNNING run and async-invokes the worker; the client polls the run.

### The phrase catalog is the source of truth

`amplify/langgen/shared/phraseKeys.ts` holds the canonical key phrases + `KEY_VERSION`. **Every pack
should contain exactly these.** Regeneration computes `missingKeys(catalog, pack's existing slugs)` and
generates only the gaps — so "we added new key phrases" is a one-line catalog edit + a `KEY_VERSION`
bump (mirror the bump in `src/features/phrasebook/staleness.ts` `CURRENT_KEY_VERSION` and the client
`PHRASE_CATEGORIES` list). Never reuse a slug for a different phrase.

### Generation pipeline (start → worker)

`amplify/langgen/start` (resolver, thin: find-or-create pack + RUNNING run + async-invoke) →
`amplify/langgen/worker` (the long job: Claude translates the missing phrases → Polly voices each →
write Phrase rows + audio → flip Language PUBLISHED + run DRAFT_READY). Lambdas write **straight to
DynamoDB** via their IAM roles (bypassing AppSync). **Ids are DETERMINISTIC** (`lang-<locale>`,
`<languageId>-<slug>`) so every write is idempotent — a regenerate overwrites/gap-fills, never
duplicates. Isolated AWS edges (`bedrock`/`polly`/`s3`/`ddb`) are mocked in tests; all prompt/parse/
join logic is pure + unit-tested.

### Guest-first (no account to use the app)

Browsing packs, viewing phrases, playing audio, and **generating a language** all work signed-out.
The `editors` Cognito group exists only for the seed (authoring writes). Read models grant
`allow.guest()` + `allow.authenticated(...)`; the generation mutations grant `allow.guest()`. The data
client (`src/lib/dataClient.ts`) defaults to **`identityPool`**; `readAuthMode()` upgrades a signed-in
user to `userPool`. A client/schema provider mismatch returns empty results, not an error — so a new
read model MUST keep its guest grant or guest reads silently go empty.

## Code organization (vertical slices)

Features live under `src/features/<feature>/`; tests colocated. File conventions:

- **`useX.ts`** — hooks hold all logic/orchestration; client state via Context + Hook + Provider.
- **`xApi.ts`** — all server state through react-query wrapping the Amplify client. No fetches in
  components.
- **`X.tsx`** — components only render.
- **`x.ts`** — pure, unit-testable helpers (keeps files short + logic out of views).
- **`X.css`** — consume the `--pp-*` design tokens / role classes from `src/theme/variables.css`,
  **never hardcoded hex/px**.

### Load / error / empty states

Every data screen uses the shared **`LoadState`** (`src/features/shell/LoadState.tsx`): loading →
spinner; error → friendly **retryable** message; empty → titled state **distinct from loading**; ready
→ children. Error beats empty. Every fetch hook exposes `isError` (+ `refetch`) alongside `isLoading` —
a hook that only exposes `isLoading` is a latent hang.

## Design

Style only via the `--pp-*` design tokens + role classes (`.pp-heading`, `.pp-kicker`, `.pp-muted`,
`.pp-phrase`) in `src/theme/variables.css`. Warm coral accent + teal secondary. **Dark mode** ships as
both a `prefers-color-scheme` palette AND an explicit Settings override (`data-theme` on `<html>`,
persisted). Safe-area insets are hardened for the notch/home-bar (`viewport-fit=cover` in index.html).

## Quality gates (non-negotiable — CI + husky pre-commit enforce them)

Run `npm run quality`. **Enforce them yourself; when one fails, fix the code, never the gate.** Scope
covers `src/` + `amplify/` LOGIC; only declarative files are exempt (`amplify/**/resource.ts`,
`amplify/backend.ts`, the phrase catalog + seed fixtures as DATA).

- **No `any`, ever.** ESLint `@typescript-eslint/no-explicit-any: error`.
- **Every `.ts`/`.tsx` logic file ≤ 100 lines** (`npm run check:lines`). Over → extract a helper.
- **≥ 80% coverage** on every logic file. Fix by writing tests — never exclusions.
- **CRAP ≤ 15 per function** (`npm run crap`).
- **Acceptance tests are Gherkin** (`.feature` + steps), run via Playwright + playwright-bdd; every
  `.feature` must map to a CI matrix area (`npm run check:features`).
- **Build passes** (`npm run build`). **Format clean** (Prettier).
- **Determinism:** pure helpers take injected randomness/time — no bare `Math.random()`/`Date.now()`
  in logic under test.

### Honest e2e

Every data-reading flow asserts on **rendered real (seeded) data** — e.g. the seeded Spanish "Gracias"

- its phonetic — not just a URL or element visibility. The seed (`amplify/seed/`) writes a couple of
  fully-formed packs (text + phonetics; no audio, since Polly isn't run at seed) so e2e is deterministic
  without invoking Bedrock. The generation flow is exercised with the mutation stubbed at the network
  layer.

## Definition of done

A slice is done only when **all** hold:

1. `npm run quality` green locally (pre-commit enforces it on commit).
2. Gherkin acceptance scenarios + colocated unit tests added and passing.
3. Backend deployed + seeded if any Amplify model changed.
4. Conventional commit, branch pushed, PR open, **CI green**.
5. PR description includes a demo artifact for any user-visible change.

## Commands

```bash
npm run dev            # Vite dev server (port 5175 for e2e via --strictPort)
npm run quality        # full local gate
npm run format         # Prettier write
npm run test:e2e       # Gherkin acceptance (bddgen + Playwright)
npm run seed           # seed starter packs (needs editor creds in .env.local)
npm run gen:icons      # regenerate app icons from assets/icon{,-dark}.png
npm run e2e-config     # pull amplify_outputs.json from the sandbox stack
npx ampx sandbox       # personal cloud backend sandbox
```

## Key facts

- **Repo:** `johnpc/phrasepack`. **Bundle id:** `com.johncorser.phrasepack`. Region `us-west-2`,
  profile `personal`. iOS signing team `JW5SC3NYUV`.
- **Sandbox stack:** `amplify-phrasepack-xss-sandbox-a94eed9284` (wired into `package.json` e2e-config).
- **Prod Amplify app id:** not yet provisioned — set it in `scripts/prod-config.mjs` before running the
  iOS/Android deploy jobs (they pull the prod backend).
- **CI:** `.github/workflows/ci.yml` (quality + Gherkin acceptance matrix, one area per feature) blocks
  PRs. `ios-deploy.yml` / `android-deploy.yml` publish after CI on `main`. Secrets: `AWS_ACCESS_KEY_ID`,
  `AWS_SECRET_ACCESS_KEY`, `TEST_USERNAME`, `TEST_PASSWORD`, `ASC_KEY_ID`, `ASC_ISSUER_ID`,
  `ASC_KEY_CONTENT`, `TEAM_ID`.

## Decisions

Significant, hard-to-reverse choices (read before re-opening a settled question):

- **Guest-only app.** No account to browse, play audio, or generate a language. The `editors` group is
  seed-only. Revisit only if per-user saved packs/favorites are wanted (add owner models then).
- **Phrase catalog is the source of truth; regeneration is gap-fill.** Packs record a `KEY_VERSION`;
  the "new phrases available" prompt is `keyVersion < CURRENT`. Regenerate produces only missing keys.
- **Deterministic ids** (`lang-<locale>`, `<languageId>-<slug>`) so generation + seed + regeneration
  are idempotent (overwrite, never duplicate) — no GSI-name coupling in the Lambdas.
- **Claude Haiku for translation.** Small tool-forced, validated outputs; ~10x cheaper than Opus with
  no meaningful quality risk here. Single text-gen entry point (`langgen/shared/bedrock.ts`).
- **Audio failure is non-fatal.** A phrase still renders (and reads) with text + phonetics; the
  PlayButton shows a muted state when there's no audio.
- **Favorites are per-device (localStorage), keyed by phraseKeySlug.** No account (guest-first), and
  keying by slug (not row id) means a pack regeneration keeps your stars. See
  `favoritesStore.ts` + `useFavorites.ts`.
