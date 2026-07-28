/**
 * Pure phrase filter for the pack search box. Matches a query against a
 * phrase's English source, its translation, AND its phonetic reading, so a
 * traveler can find a phrase by what they'd say in English ("taxi"), by the
 * foreign spelling, or by how it sounds. Case- and accent-insensitive so
 * "cafe" finds "café" and "GRACIAS" finds "Gracias". A blank query returns the
 * list unchanged. Kept pure so the matching is unit-testable.
 */
import type { PhraseRecord } from '../../lib/dataClient';

/** Lowercase + strip diacritics so accented spellings match plain-ASCII typing. */
export function normalizeQuery(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritical marks
    .toLowerCase()
    .trim();
}

function matches(phrase: PhraseRecord, needle: string): boolean {
  const haystack = normalizeQuery(
    `${phrase.sourceText} ${phrase.translation} ${phrase.phonetic ?? ''}`,
  );
  return haystack.includes(needle);
}

/** Phrases matching the query (blank query → all, order preserved). */
export function filterPhrases(phrases: PhraseRecord[], query: string): PhraseRecord[] {
  const needle = normalizeQuery(query);
  if (!needle) return phrases;
  return phrases.filter((p) => matches(p, needle));
}
