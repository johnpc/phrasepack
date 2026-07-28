import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { generateLanguageStarter } from '../langgen/start/resource';

/**
 * PHRASEPACK data schema.
 *
 * PhrasePack is a travel phrasebook: for any language, the most useful simple
 * phrases a traveler needs (hello, thank you, "check please", "how much?",
 * taxi, airport…), each shown with correct spelling, a phonetic pronunciation,
 * and a "play" button that speaks it (Polly audio). Any language can be
 * generated IN-APP on demand with AI, and re-generated to fill in newly-added
 * key phrases.
 *
 * The canonical set of key phrases lives in a bundled catalog
 * (amplify/langgen/shared/phraseKeys.ts) with a KEY_VERSION. A Language is
 * generated against a version; when the catalog gains new keys, the app detects
 * the gap (catalog slugs minus the language's existing Phrase slugs) and offers
 * to regenerate — filling only the missing phrases.
 *
 * Auth (guest-first, mirrors the spork/stoop contract): read models grant guest
 * + authenticated (identityPool + userPool) reads; the 'editors' group writes.
 * The seed runs as an editor; the generation Lambdas write straight to DynamoDB
 * via their IAM roles (bypassing AppSync). Generation mutations are
 * GUEST-callable so a traveler can add a language without an account.
 */
const schema = a.schema({
  // A language pack — the published unit (Deck analogue). PUBLISHED packs
  // surface on Home. `locale` is BCP-47 (drives Polly voice + phonetics),
  // `keyVersion` is the phrase-catalog version this pack was generated against
  // (a cheap staleness signal for the "new phrases available" prompt). The
  // per-pack fields Home needs (name, flag, phraseCount) live here so the list
  // renders from a single query with no per-pack phrase fetch.
  Language: a
    .model({
      name: a.string().required(), // English display name, e.g. "Spanish (Spain)"
      nativeName: a.string(), // endonym, e.g. "Español"
      locale: a.string().required(), // BCP-47, e.g. "es-ES"
      flagEmoji: a.string(), // e.g. "🇪🇸"
      status: a.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
      phraseCount: a.integer().default(0),
      keyVersion: a.integer().default(0),
      publishedAt: a.datetime(),
      phrases: a.hasMany('Phrase', 'languageId'),
    })
    // Look up a pack by its stable locale (dedupe / "does this language exist").
    .secondaryIndexes((index) => [index('locale')])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // One phrase in a pack. `phraseKeySlug` ties it back to the canonical catalog
  // key (so regeneration can compute which keys are missing); `categorySlug`
  // groups phrases on the detail screen (greetings/dining/transport…).
  // `sourceText` is the English key phrase, `translation` the correct foreign
  // spelling, `phonetic` a readable pronunciation, `audioPath` the S3 key of the
  // spoken MP3 (resolved via getUrl()). Read path: phrases by languageId in ord.
  Phrase: a
    .model({
      languageId: a.id().required(),
      language: a.belongsTo('Language', 'languageId'),
      phraseKeySlug: a.string().required(),
      categorySlug: a.string().required(),
      ord: a.integer().required(),
      sourceText: a.string().required(), // English, e.g. "Where is the taxi?"
      translation: a.string().required(), // foreign, correct spelling
      phonetic: a.string(), // readable pronunciation, e.g. "DOHN-deh es-TAH el TAHK-see"
      audioPath: a.string(), // S3 key under media/phrases/
    })
    // Read all phrases for a pack, ordered — the pack-detail read path.
    .secondaryIndexes((index) => [index('languageId').sortKeys(['ord'])])
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // One generation run — the admin dashboard reads these (stoop's SyncRun
  // analogue). `kind` distinguishes a fresh pack (GENERATE) from a gap-fill
  // (REGENERATE); `requestedCount`/`generatedCount` track progress. The starter
  // creates a RUNNING row; the worker flips it to DRAFT_READY or FAILED.
  GenerationRun: a
    .model({
      kind: a.enum(['GENERATE', 'REGENERATE']),
      locale: a.string().required(),
      languageId: a.id(),
      keyVersion: a.integer().default(0),
      requestedCount: a.integer().default(0),
      generatedCount: a.integer().default(0),
      status: a.enum(['RUNNING', 'DRAFT_READY', 'FAILED']),
      statusReason: a.string(),
      startedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.guest().to(['read']),
      allow.authenticated('identityPool').to(['read']),
      allow.authenticated().to(['read']),
      allow.group('editors').to(['create', 'update', 'delete']),
    ]),

  // Generate a NEW language pack from AI — GUEST-callable so a traveler can add
  // a language with no account. The starter creates a DRAFT Language + RUNNING
  // GenerationRun and async-invokes the worker (Claude translates every catalog
  // phrase + Polly speaks each), returning { runId, languageId } immediately.
  // If a pack for the locale already exists it returns that pack's id and the
  // worker fills only the missing phrases (idempotent).
  generateLanguage: a
    .mutation()
    .arguments({
      locale: a.string().required(),
      name: a.string().required(),
      nativeName: a.string(),
      flagEmoji: a.string(),
    })
    .returns(a.customType({ runId: a.string().required(), languageId: a.string().required() }))
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(generateLanguageStarter)),

  // Regenerate an EXISTING pack to fill in phrases for catalog keys added since
  // it was generated (the "we added new key phrases" case). GUEST-callable;
  // generates ONLY the missing keys (a cheap no-op if the pack is already
  // current). Returns { runId, languageId }.
  regenerateLanguage: a
    .mutation()
    .arguments({ languageId: a.string().required() })
    .returns(a.customType({ runId: a.string().required(), languageId: a.string().required() }))
    .authorization((allow) => [allow.guest(), allow.authenticated()])
    .handler(a.handler.function(generateLanguageStarter)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'identityPool',
  },
});
