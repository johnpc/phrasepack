import { describe, it, expect } from 'vitest';
import { partitionFavorites } from './partitionFavorites';
import type { PhraseRecord } from '../../lib/dataClient';

const p = (slug: string): PhraseRecord => ({ phraseKeySlug: slug }) as PhraseRecord;
const rows = [p('hello'), p('taxi'), p('thank-you'), p('check')];

describe('partitionFavorites', () => {
  it('splits favorites from the rest, preserving original order in each', () => {
    const { favorites, rest } = partitionFavorites(rows, new Set(['taxi', 'check']));
    expect(favorites.map((r) => r.phraseKeySlug)).toEqual(['taxi', 'check']);
    expect(rest.map((r) => r.phraseKeySlug)).toEqual(['hello', 'thank-you']);
  });

  it('puts everything in rest when there are no favorites', () => {
    const { favorites, rest } = partitionFavorites(rows, new Set());
    expect(favorites).toHaveLength(0);
    expect(rest).toHaveLength(4);
  });

  it('ignores favorite slugs not present in the list', () => {
    const { favorites } = partitionFavorites(rows, new Set(['nope']));
    expect(favorites).toHaveLength(0);
  });
});
