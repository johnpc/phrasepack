import { describe, it, expect } from 'vitest';
import { normalizeLocale, languageIdForLocale, phraseIdFor } from './ids';

describe('normalizeLocale', () => {
  it('lowercases and preserves a clean locale', () => {
    expect(normalizeLocale('es-ES')).toBe('es-es');
  });

  it('replaces disallowed characters with dashes', () => {
    expect(normalizeLocale('es_ES')).toBe('es-es');
  });

  it('collapses runs of dashes into one', () => {
    expect(normalizeLocale('es__ES')).toBe('es-es');
  });

  it('trims leading and trailing dashes and whitespace', () => {
    expect(normalizeLocale('  !es-ES!  ')).toBe('es-es');
  });
});

describe('languageIdForLocale', () => {
  it('builds a deterministic lang- id', () => {
    expect(languageIdForLocale('pt-BR')).toBe('lang-pt-br');
  });
});

describe('phraseIdFor', () => {
  it('joins the language id and slug', () => {
    expect(phraseIdFor('lang-es-es', 'thank-you')).toBe('lang-es-es-thank-you');
  });
});
