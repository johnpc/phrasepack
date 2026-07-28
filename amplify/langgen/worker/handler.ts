/**
 * langgen worker (async-invoked by the starter). Computes which catalog phrases
 * to produce (all of them for a GENERATE; only the missing ones for a
 * REGENERATE gap-fill), translates them with Claude, synthesizes audio +
 * writes each Phrase row (bounded concurrency), then flips the Language to
 * PUBLISHED and the GenerationRun to DRAFT_READY. Any failure marks the run
 * FAILED so the dashboard shows it. Thin: logic is in pure helpers, I/O in
 * isolated edges (bedrock/polly/s3/ddb).
 */
import { invokeText } from '../shared/bedrock';
import { buildTranslateRequest } from '../shared/phrasesPrompt';
import { parseTranslations } from '../shared/parseTranslations';
import { KEY_PHRASES, KEY_VERSION } from '../shared/phraseKeys';
import { missingKeys, ordForSlug } from '../shared/missingKeys';
import { voiceForLanguage } from '../shared/voiceForLanguage';
import { updateItem, existingIds } from '../shared/ddb';
import { phraseIdFor } from '../shared/ids';
import { resolvePhrases } from './resolvePhrases';
import { producePhrase, type ProducePhraseCtx } from './producePhrase';
import { mapLimit } from './mapLimit';
import type { WorkerEvent } from '../start/invokeWorker';

const AUDIO_CONCURRENCY = 4;

const env = (name: string): string => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  return v;
};

/** The catalog slugs a REGENERATE has already produced (empty for GENERATE).
 * Phrase ids are deterministic, so this is a keys-only batch lookup. */
async function existingSlugs(kind: WorkerEvent['kind'], languageId: string): Promise<string[]> {
  if (kind === 'GENERATE') return [];
  const idToSlug = new Map(KEY_PHRASES.map((k) => [phraseIdFor(languageId, k.slug), k.slug]));
  const present = await existingIds(env('PHRASE_TABLE'), [...idToSlug.keys()]);
  return [...present].map((id) => idToSlug.get(id)).filter((s): s is string => s !== undefined);
}

export async function handler(event: WorkerEvent): Promise<void> {
  const runTable = env('GENERATION_RUN_TABLE');
  try {
    const toProduce = missingKeys(KEY_PHRASES, await existingSlugs(event.kind, event.languageId));
    const now = new Date().toISOString();
    if (toProduce.length > 0) {
      const body = await invokeText(
        buildTranslateRequest({
          languageName: event.languageName,
          locale: event.locale,
          phrases: toProduce.map((k) => ({ slug: k.slug, text: k.text })),
        }),
      );
      const translations = parseTranslations(body as Parameters<typeof parseTranslations>[0]);
      const resolved = resolvePhrases(toProduce, translations, (slug) =>
        ordForSlug(KEY_PHRASES, slug),
      );
      const ctx: ProducePhraseCtx = {
        bucket: env('MEDIA_BUCKET'),
        phraseTable: env('PHRASE_TABLE'),
        languageId: event.languageId,
        voice: voiceForLanguage(event.locale),
        now,
      };
      await mapLimit(resolved, AUDIO_CONCURRENCY, (p) =>
        producePhrase(ctx, phraseIdFor(event.languageId, p.phraseKeySlug), p),
      );
    }

    await updateItem(env('LANGUAGE_TABLE'), event.languageId, {
      status: 'PUBLISHED',
      phraseCount: KEY_PHRASES.length,
      keyVersion: KEY_VERSION,
      publishedAt: now,
      updatedAt: now,
    });
    await updateItem(runTable, event.runId, {
      status: 'DRAFT_READY',
      generatedCount: toProduce.length,
      updatedAt: now,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'generation failed';
    await updateItem(runTable, event.runId, {
      status: 'FAILED',
      statusReason: reason,
      updatedAt: new Date().toISOString(),
    }).catch(() => {});
    throw err;
  }
}
