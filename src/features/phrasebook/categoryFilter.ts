/**
 * Pure helpers for the pack's category filter chips. `chipsFor` returns the
 * catalog categories actually present in a pack (in catalog order) so we never
 * show a chip that filters to nothing; `filterByCategory` narrows the phrase
 * list to one category (or all). Kept pure for unit testing.
 */
import type { PhraseRecord } from '../../lib/dataClient';
import type { PhraseCategoryMeta } from './groupPhrases';

export const ALL_CATEGORIES = 'all';

export interface Chip {
  slug: string;
  label: string;
}

/** The chips to show: "All" + each catalog category present in the phrases. */
export function chipsFor(phrases: PhraseRecord[], categories: PhraseCategoryMeta[]): Chip[] {
  const present = new Set(phrases.map((p) => p.categorySlug));
  const found = categories
    .filter((c) => present.has(c.slug))
    .map((c) => ({ slug: c.slug, label: c.label }));
  return [{ slug: ALL_CATEGORIES, label: 'All' }, ...found];
}

/** Phrases in the active category (all when 'all' or unknown). */
export function filterByCategory(phrases: PhraseRecord[], category: string): PhraseRecord[] {
  if (category === ALL_CATEGORIES) return phrases;
  return phrases.filter((p) => p.categorySlug === category);
}
