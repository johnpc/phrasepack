import { describe, it, expect } from 'vitest';
import { buildPhraseItem } from './phraseItem';

const base = {
  id: 'lang-es-es-thank-you',
  languageId: 'lang-es-es',
  phraseKeySlug: 'thank-you',
  categorySlug: 'courtesy',
  ord: 11,
  now: '2026-06-01T00:00:00.000Z',
  sourceText: 'Thank you',
  translation: 'Gracias',
};

describe('buildPhraseItem', () => {
  it('builds the full Amplify-shaped Phrase item', () => {
    const item = buildPhraseItem({ ...base, phonetic: 'GRAH-see-as', audioPath: 'a.mp3' });
    expect(item).toEqual({
      id: 'lang-es-es-thank-you',
      __typename: 'Phrase',
      createdAt: base.now,
      updatedAt: base.now,
      languageId: 'lang-es-es',
      phraseKeySlug: 'thank-you',
      categorySlug: 'courtesy',
      ord: 11,
      sourceText: 'Thank you',
      translation: 'Gracias',
      phonetic: 'GRAH-see-as',
      audioPath: 'a.mp3',
    });
  });

  it('omits phonetic and audioPath when undefined', () => {
    const item = buildPhraseItem(base);
    expect(item.phonetic).toBeUndefined();
    expect(item.audioPath).toBeUndefined();
    expect(item).toMatchObject({ __typename: 'Phrase', translation: 'Gracias' });
  });
});
