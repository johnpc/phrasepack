import { describe, it, expect } from 'vitest';
import { availableToGenerate, CATALOG_LANGUAGES } from './languageCatalog';

describe('availableToGenerate', () => {
  it('returns the whole catalog when none are present', () => {
    expect(availableToGenerate([])).toEqual(CATALOG_LANGUAGES);
  });

  it('filters out locales already present', () => {
    const result = availableToGenerate(['es-ES', 'fr-FR']);
    expect(result.some((l) => l.locale === 'es-ES')).toBe(false);
    expect(result.some((l) => l.locale === 'fr-FR')).toBe(false);
    expect(result).toHaveLength(CATALOG_LANGUAGES.length - 2);
  });

  it('accepts any iterable of existing locales', () => {
    const result = availableToGenerate(new Set(['de-DE']));
    expect(result.some((l) => l.locale === 'de-DE')).toBe(false);
  });
});
