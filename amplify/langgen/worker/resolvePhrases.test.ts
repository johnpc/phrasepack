import { describe, it, expect, vi } from 'vitest';
import { resolvePhrases } from './resolvePhrases';
import type { PhraseKey } from '../shared/phraseKeys';
import type { Translation } from '../shared/parseTranslations';

const toProduce: PhraseKey[] = [
  { slug: 'thank-you', categorySlug: 'courtesy', text: 'Thank you' },
  { slug: 'hello', categorySlug: 'greetings', text: 'Hello' },
  { slug: 'goodbye', categorySlug: 'greetings', text: 'Goodbye' },
];

describe('resolvePhrases', () => {
  it('joins catalog keys to translations by slug and pulls ord from the injected fn', () => {
    const translations: Translation[] = [
      { slug: 'thank-you', translation: 'Gracias', phonetic: 'GRAH-see-as' },
      { slug: 'hello', translation: 'Hola' },
      { slug: 'goodbye', translation: 'Adiós' },
    ];
    const ordForSlug = vi.fn(
      (slug: string) => ({ 'thank-you': 11, hello: 5, goodbye: 6 })[slug] ?? -1,
    );
    const out = resolvePhrases(toProduce, translations, ordForSlug);
    expect(out).toEqual([
      {
        phraseKeySlug: 'thank-you',
        categorySlug: 'courtesy',
        ord: 11,
        sourceText: 'Thank you',
        translation: 'Gracias',
        phonetic: 'GRAH-see-as',
      },
      {
        phraseKeySlug: 'hello',
        categorySlug: 'greetings',
        ord: 5,
        sourceText: 'Hello',
        translation: 'Hola',
        phonetic: undefined,
      },
      {
        phraseKeySlug: 'goodbye',
        categorySlug: 'greetings',
        ord: 6,
        sourceText: 'Goodbye',
        translation: 'Adiós',
        phonetic: undefined,
      },
    ]);
    expect(ordForSlug).toHaveBeenCalledWith('thank-you');
  });

  it('skips keys with no matching translation (Claude dropped them)', () => {
    const translations: Translation[] = [{ slug: 'hello', translation: 'Hola' }];
    const out = resolvePhrases(toProduce, translations, () => 0);
    expect(out.map((p) => p.phraseKeySlug)).toEqual(['hello']);
  });
});
