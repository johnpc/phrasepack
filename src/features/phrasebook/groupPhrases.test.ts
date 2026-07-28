import { describe, it, expect } from 'vitest';
import { groupPhrases, type PhraseCategoryMeta } from './groupPhrases';
import type { PhraseRecord } from '../../lib/dataClient';

const categories: PhraseCategoryMeta[] = [
  { slug: 'basics', label: 'The Basics' },
  { slug: 'dining', label: 'Eating & Drinking' },
];

/** Minimal PhraseRecord-shaped object for grouping (only the fields the helper reads). */
function phrase(categorySlug: string, ord: number, id = `${categorySlug}-${ord}`): PhraseRecord {
  return { id, categorySlug, ord } as unknown as PhraseRecord;
}

describe('groupPhrases', () => {
  it('returns [] when there are no phrases', () => {
    expect(groupPhrases([], categories)).toEqual([]);
  });

  it('groups by category in the given category order', () => {
    const sections = groupPhrases([phrase('dining', 0), phrase('basics', 0)], categories);
    expect(sections.map((s) => s.slug)).toEqual(['basics', 'dining']);
    expect(sections[0].label).toBe('The Basics');
  });

  it('drops empty sections', () => {
    const sections = groupPhrases([phrase('basics', 0)], categories);
    expect(sections).toHaveLength(1);
    expect(sections[0].slug).toBe('basics');
  });

  it('sorts phrases by ord within a section', () => {
    const sections = groupPhrases(
      [phrase('basics', 2, 'b2'), phrase('basics', 0, 'b0'), phrase('basics', 1, 'b1')],
      categories,
    );
    expect(sections[0].phrases.map((p) => p.id)).toEqual(['b0', 'b1', 'b2']);
  });

  it('puts unknown-category phrases into a trailing "More" section', () => {
    const sections = groupPhrases(
      [phrase('basics', 0), phrase('mystery', 1, 'm1'), phrase('mystery', 0, 'm0')],
      categories,
    );
    const more = sections[sections.length - 1];
    expect(more.slug).toBe('more');
    expect(more.label).toBe('More');
    // Leftovers are also sorted by ord.
    expect(more.phrases.map((p) => p.id)).toEqual(['m0', 'm1']);
  });
});
