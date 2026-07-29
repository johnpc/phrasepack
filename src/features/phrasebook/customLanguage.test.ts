import { describe, it, expect } from 'vitest';
import { normalizeName, localeForName, requestForName } from './customLanguage';

describe('normalizeName', () => {
  it('trims, collapses whitespace, and title-cases', () => {
    expect(normalizeName('  brazilian   portuguese ')).toBe('Brazilian Portuguese');
    expect(normalizeName('SWAHILI')).toBe('Swahili');
  });
});

describe('localeForName', () => {
  it('derives a hyphenated x- custom locale slug', () => {
    expect(localeForName('Swahili')).toBe('x-swahili');
    expect(localeForName('Brazilian Portuguese')).toBe('x-brazilian-portuguese');
  });
});

describe('requestForName', () => {
  it('returns null for blank or too-short input', () => {
    expect(requestForName('')).toBeNull();
    expect(requestForName('  ')).toBeNull();
    expect(requestForName('a')).toBeNull();
  });

  it('reuses a catalog entry when the name matches (case-insensitively)', () => {
    const req = requestForName('german');
    expect(req).toMatchObject({ locale: 'de-DE', name: 'German', flagEmoji: '🇩🇪' });
  });

  it('builds a custom request for a language not in the catalog', () => {
    const req = requestForName('Swahili');
    expect(req).toMatchObject({ locale: 'x-swahili', name: 'Swahili', flagEmoji: '🌐' });
  });
});
