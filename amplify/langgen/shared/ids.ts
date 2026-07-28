/**
 * Pure DETERMINISTIC id builders. The langgen Lambdas write straight to
 * DynamoDB (no resolver), and deterministic ids make every write idempotent —
 * a re-run OVERWRITES rather than duplicates, and existence is a cheap GetItem
 * by id (no GSI-name coupling, no Scan). Mirrors spork's `daily-<game>-<date>`
 * convention.
 *
 * A pack's id is derived from its locale, so "does this language exist?" is a
 * GetItem; a phrase's id is derived from (languageId, key slug), so a gap-fill
 * regeneration can check each catalog key's presence directly.
 */

/** Normalize a locale for use in an id (lowercase, only [a-z0-9-]). */
export function normalizeLocale(locale: string): string {
  return locale
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Deterministic Language id for a locale, e.g. "lang-es-es". */
export function languageIdForLocale(locale: string): string {
  return `lang-${normalizeLocale(locale)}`;
}

/** Deterministic Phrase id for a (language, catalog key) pair. */
export function phraseIdFor(languageId: string, slug: string): string {
  return `${languageId}-${slug}`;
}
