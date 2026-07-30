import { describe, it, expect } from 'vitest';
import { chipsFor, filterByCategory, ALL_CATEGORIES } from './categoryFilter';
import type { PhraseRecord } from '../../lib/dataClient';
import type { PhraseCategoryMeta } from './groupPhrases';

const cats: PhraseCategoryMeta[] = [
  { slug: 'greetings', label: 'Greetings' },
  { slug: 'money', label: 'Money & Paying' },
  { slug: 'transport', label: 'Getting Around' },
];
const p = (categorySlug: string): PhraseRecord => ({ categorySlug }) as PhraseRecord;
const rows = [p('greetings'), p('greetings'), p('transport')];

describe('chipsFor', () => {
  it('returns All + only the categories present, in catalog order', () => {
    const chips = chipsFor(rows, cats);
    expect(chips.map((c) => c.slug)).toEqual([ALL_CATEGORIES, 'greetings', 'transport']);
    // money is absent from the phrases, so no money chip
    expect(chips.find((c) => c.slug === 'money')).toBeUndefined();
    expect(chips[0].label).toBe('All');
  });

  it('returns just All when there are no phrases', () => {
    expect(chipsFor([], cats).map((c) => c.slug)).toEqual([ALL_CATEGORIES]);
  });
});

describe('filterByCategory', () => {
  it('returns everything for the All slug', () => {
    expect(filterByCategory(rows, ALL_CATEGORIES)).toHaveLength(3);
  });

  it('narrows to a single category', () => {
    expect(filterByCategory(rows, 'greetings')).toHaveLength(2);
    expect(filterByCategory(rows, 'transport')).toHaveLength(1);
    expect(filterByCategory(rows, 'money')).toHaveLength(0);
  });
});
