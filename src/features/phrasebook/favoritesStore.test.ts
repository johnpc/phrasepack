import { describe, it, expect, beforeEach } from 'vitest';
import { readFavorites, writeFavorites, toggleFavorite } from './favoritesStore';

// setupTests clears localStorage before each test, so each starts empty.
describe('favoritesStore', () => {
  beforeEach(() => window.localStorage.clear());

  it('reads an empty set when nothing is stored', () => {
    expect(readFavorites('lang-es-es').size).toBe(0);
  });

  it('round-trips a set of slugs, scoped per language', () => {
    writeFavorites('lang-es-es', new Set(['taxi', 'hello']));
    expect([...readFavorites('lang-es-es')].sort()).toEqual(['hello', 'taxi']);
    // A different pack is unaffected.
    expect(readFavorites('lang-fr-fr').size).toBe(0);
  });

  it('toggles a slug on then off', () => {
    expect(toggleFavorite('lang-es-es', 'taxi').has('taxi')).toBe(true);
    expect(readFavorites('lang-es-es').has('taxi')).toBe(true);
    expect(toggleFavorite('lang-es-es', 'taxi').has('taxi')).toBe(false);
    expect(readFavorites('lang-es-es').has('taxi')).toBe(false);
  });

  it('ignores malformed stored data', () => {
    window.localStorage.setItem('pp-favorites:lang-es-es', 'not json');
    expect(readFavorites('lang-es-es').size).toBe(0);
    window.localStorage.setItem('pp-favorites:lang-es-es', '{"not":"an array"}');
    expect(readFavorites('lang-es-es').size).toBe(0);
    window.localStorage.setItem('pp-favorites:lang-es-es', '["ok", 5, null]');
    expect([...readFavorites('lang-es-es')]).toEqual(['ok']);
  });
});
