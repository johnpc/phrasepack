import { describe, it, expect } from 'vitest';
import { voiceForLanguage } from './voiceForLanguage';

describe('voiceForLanguage', () => {
  it('maps a known locale to its exact neural voice', () => {
    expect(voiceForLanguage('es-ES')).toEqual({
      voiceId: 'Lucia',
      languageCode: 'es-ES',
      engine: 'neural',
    });
  });

  it('maps a standard-only locale to its standard voice', () => {
    expect(voiceForLanguage('tr-TR')).toEqual({
      voiceId: 'Filiz',
      languageCode: 'tr-TR',
      engine: 'standard',
    });
  });

  it('falls back to a language-prefix match for an unlisted regional variant', () => {
    // pt-XX is not a listed locale, but pt- has a voice (pt-BR is first).
    expect(voiceForLanguage('pt-XX')).toEqual({
      voiceId: 'Camila',
      languageCode: 'pt-BR',
      engine: 'neural',
    });
  });

  it('matches the prefix case-insensitively', () => {
    expect(voiceForLanguage('ES-mx')).toMatchObject({ languageCode: 'es-ES' });
  });

  it('returns null for null/undefined (no voice → skip audio)', () => {
    expect(voiceForLanguage(null)).toBeNull();
    expect(voiceForLanguage(undefined)).toBeNull();
  });

  it('returns null for an unknown language with no prefix match', () => {
    // A free-text "any language" request (x-swahili) or an unsupported locale
    // gets no voice — the phrase still ships with correct spelling + phonetics.
    expect(voiceForLanguage('xx-XX')).toBeNull();
    expect(voiceForLanguage('x-swahili')).toBeNull();
  });
});
