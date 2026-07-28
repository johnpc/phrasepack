/**
 * Pure helper: group a pack's phrases into the catalog's category sections, in
 * category order, dropping empty sections. Keeps the PackDetail component a
 * simple render over a ready-made structure (and the grouping unit-testable).
 */
import type { PhraseRecord } from '../../lib/dataClient';

export interface PhraseCategoryMeta {
  slug: string;
  label: string;
}

export interface PhraseSection {
  slug: string;
  label: string;
  phrases: PhraseRecord[];
}

/** Build ordered, non-empty sections. `categories` supplies the order + labels
 * (the client mirror of the backend CATEGORIES); any phrase whose category
 * isn't listed falls into a trailing "More" section so nothing is dropped. */
export function groupPhrases(
  phrases: PhraseRecord[],
  categories: PhraseCategoryMeta[],
): PhraseSection[] {
  const byCat = new Map<string, PhraseRecord[]>();
  for (const p of phrases) {
    const list = byCat.get(p.categorySlug) ?? [];
    list.push(p);
    byCat.set(p.categorySlug, list);
  }
  const sortByOrd = (list: PhraseRecord[]) => [...list].sort((a, b) => a.ord - b.ord);

  const sections: PhraseSection[] = [];
  const known = new Set<string>();
  for (const cat of categories) {
    known.add(cat.slug);
    const list = byCat.get(cat.slug);
    if (list?.length) sections.push({ slug: cat.slug, label: cat.label, phrases: sortByOrd(list) });
  }
  const leftovers = phrases.filter((p) => !known.has(p.categorySlug));
  if (leftovers.length) {
    sections.push({ slug: 'more', label: 'More', phrases: sortByOrd(leftovers) });
  }
  return sections;
}
