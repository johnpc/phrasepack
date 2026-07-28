/**
 * Pure helper: given the canonical catalog and the slugs a pack already has,
 * return the catalog keys still missing (in catalog order). This is the heart
 * of both generation modes — a fresh GENERATE passes an empty `existing` set
 * (so every key is "missing"), and a REGENERATE passes the pack's current slugs
 * (so only newly-added catalog keys are produced). Keeping it pure makes the
 * gap-fill logic unit-testable without AWS.
 */
import type { PhraseKey } from './phraseKeys';

export function missingKeys(catalog: PhraseKey[], existing: Iterable<string>): PhraseKey[] {
  const have = new Set(existing);
  return catalog.filter((key) => !have.has(key.slug));
}

/** The global `ord` of a catalog key = its index in the catalog, so phrases
 * keep a stable presentation order across gap-fills (a later regeneration
 * inserts new phrases at their catalog position, not appended at the end). */
export function ordForSlug(catalog: PhraseKey[], slug: string): number {
  return catalog.findIndex((k) => k.slug === slug);
}
