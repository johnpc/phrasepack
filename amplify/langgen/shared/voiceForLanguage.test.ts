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

  it('defaults null/undefined to en-US / Joanna', () => {
    expect(voiceForLanguage(null)).toEqual({
      voiceId: 'Joanna',
      languageCode: 'en-US',
      engine: 'neural',
    });
    expect(voiceForLanguage(undefined).voiceId).toBe('Joanna');
  });

  it('defaults an unknown language (no prefix match) to en-US / Joanna', () => {
    expect(voiceForLanguage('xx-XX')).toEqual({
      voiceId: 'Joanna',
      languageCode: 'en-US',
      engine: 'neural',
    });
  });
});
