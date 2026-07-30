import { describe, it, expect } from 'vitest';
import { destinationsToOffer, DESTINATIONS } from './destinations';
import { CATALOG_LANGUAGES } from './languageCatalog';

describe('destinations', () => {
  it('every destination maps to a real catalog language', () => {
    const locales = new Set(CATALOG_LANGUAGES.map((l) => l.locale));
    for (const d of DESTINATIONS) expect(locales.has(d.locale)).toBe(true);
  });

  it('joins each offered destination to its catalog language', () => {
    const japan = destinationsToOffer([]).find((d) => d.country === 'Japan');
    expect(japan?.language.name).toBe('Japanese');
    expect(japan?.language.locale).toBe('ja-JP');
  });

  it('drops destinations whose language is already generated', () => {
    const offered = destinationsToOffer(['ja-JP']);
    expect(offered.find((d) => d.country === 'Japan')).toBeUndefined();
    // Austria shares de-DE — generating German removes both Germany and Austria.
    const noGerman = destinationsToOffer(['de-DE']).map((d) => d.country);
    expect(noGerman).not.toContain('Germany');
    expect(noGerman).not.toContain('Austria');
  });
});
