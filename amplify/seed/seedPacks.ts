/**
 * Seed the fixture packs as an editor. Uses the SAME deterministic ids as the
 * generation pipeline (languageIdForLocale / phraseIdFor) so a seeded pack
 * behaves exactly like a generated one — including a later regenerate that
 * gap-fills against those ids. Kept split from the runner so the row-building
 * is unit-testable; the client/write edges are injected.
 */
import { languageIdForLocale, phraseIdFor } from '../langgen/shared/ids';
import { ordForSlug } from '../langgen/shared/missingKeys';
import { KEY_PHRASES, KEY_VERSION } from '../langgen/shared/phraseKeys';
import type { SeedPack } from './fixtures/packs';

/** The Language create input for a seed pack (PUBLISHED, current key version). */
export function languageInput(pack: SeedPack, now: string) {
  return {
    id: languageIdForLocale(pack.locale),
    locale: pack.locale,
    name: pack.name,
    nativeName: pack.nativeName,
    flagEmoji: pack.flagEmoji,
    status: 'PUBLISHED' as const,
    phraseCount: pack.phrases.length,
    keyVersion: KEY_VERSION,
    publishedAt: now,
  };
}

/** The Phrase create inputs for a seed pack (ord from the catalog position). */
export function phraseInputs(pack: SeedPack) {
  const languageId = languageIdForLocale(pack.locale);
  return pack.phrases.map((p) => ({
    id: phraseIdFor(languageId, p.slug),
    languageId,
    phraseKeySlug: p.slug,
    categorySlug: p.category,
    ord: ordForSlug(KEY_PHRASES, p.slug),
    sourceText: p.source,
    translation: p.translation,
    phonetic: p.phonetic,
  }));
}

export interface SeedWriters {
  createLanguage: (input: ReturnType<typeof languageInput>) => Promise<void>;
  createPhrase: (input: ReturnType<typeof phraseInputs>[number]) => Promise<void>;
}

/** Write every fixture pack (language row + its phrases) via the injected
 * writers. Returns the number of packs seeded. */
export async function seedPacks(
  packs: SeedPack[],
  writers: SeedWriters,
  now: string,
): Promise<number> {
  for (const pack of packs) {
    await writers.createLanguage(languageInput(pack, now));
    for (const phrase of phraseInputs(pack)) await writers.createPhrase(phrase);
  }
  return packs.length;
}
