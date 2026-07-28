import { describe, it, expect } from 'vitest';
import { parseTranslations } from './parseTranslations';

const toolBlock = (translations: unknown) => ({
  content: [{ type: 'tool_use', name: 'translate_phrases', input: { translations } }],
});

describe('parseTranslations', () => {
  it('extracts valid rows from the forced tool block', () => {
    const out = parseTranslations(
      toolBlock([
        { slug: 'thank-you', translation: 'Gracias', phonetic: 'GRAH-see-as' },
        { slug: 'hello', translation: 'Hola' },
      ]),
    );
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({ slug: 'thank-you', translation: 'Gracias', phonetic: 'GRAH-see-as' });
    expect(out[1].phonetic).toBeUndefined();
  });

  it('drops rows with a non-string slug or translation but keeps valid ones', () => {
    const out = parseTranslations(
      toolBlock([
        { slug: 'ok', translation: 'fine' },
        { slug: 42, translation: 'nope' },
        { slug: 'no-translation', translation: 99 },
      ]),
    );
    expect(out.map((t) => t.slug)).toEqual(['ok']);
  });

  it('drops rows with empty/whitespace slug or translation and null rows', () => {
    const out = parseTranslations(
      toolBlock([
        { slug: '  ', translation: 'x' },
        { slug: 'y', translation: '   ' },
        null,
        { slug: 'good', translation: 'Bien', phonetic: 42 },
      ]),
    );
    expect(out).toEqual([{ slug: 'good', translation: 'Bien', phonetic: undefined }]);
  });

  it('throws when there is no translate_phrases tool_use block', () => {
    expect(() => parseTranslations({ content: [{ type: 'text' }] })).toThrow(
      /no translate_phrases/,
    );
  });

  it('throws when translations is not an array', () => {
    expect(() => parseTranslations(toolBlock('nope'))).toThrow(/missing a translations array/);
  });

  it('throws when input is missing entirely', () => {
    expect(() =>
      parseTranslations({ content: [{ type: 'tool_use', name: 'translate_phrases' }] }),
    ).toThrow(/missing a translations array/);
  });

  it('throws when every row is invalid', () => {
    expect(() => parseTranslations(toolBlock([{ slug: 1 }, null]))).toThrow(
      /no valid translations/,
    );
  });
});
