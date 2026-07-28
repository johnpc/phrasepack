import { describe, it, expect } from 'vitest';
import { missingKeys, ordForSlug } from './missingKeys';
import type { PhraseKey } from './phraseKeys';

const catalog: PhraseKey[] = [
  { slug: 'a', categorySlug: 'basics', text: 'A' },
  { slug: 'b', categorySlug: 'basics', text: 'B' },
  { slug: 'c', categorySlug: 'greetings', text: 'C' },
];

describe('missingKeys', () => {
  it('returns every key when nothing exists yet', () => {
    expect(missingKeys(catalog, []).map((k) => k.slug)).toEqual(['a', 'b', 'c']);
  });

  it('returns only the gaps and preserves catalog order', () => {
    expect(missingKeys(catalog, ['b']).map((k) => k.slug)).toEqual(['a', 'c']);
  });

  it('returns nothing when the catalog is fully covered', () => {
    expect(missingKeys(catalog, ['a', 'b', 'c'])).toEqual([]);
  });

  it('ignores existing slugs not in the catalog', () => {
    expect(missingKeys(catalog, ['zzz']).map((k) => k.slug)).toEqual(['a', 'b', 'c']);
  });
});

describe('ordForSlug', () => {
  it('returns the catalog index of a known slug', () => {
    expect(ordForSlug(catalog, 'a')).toBe(0);
    expect(ordForSlug(catalog, 'c')).toBe(2);
  });

  it('returns -1 for an unknown slug', () => {
    expect(ordForSlug(catalog, 'nope')).toBe(-1);
  });
});
