/**
 * Per-device favorite phrases — guest-first, so they live in localStorage (no
 * account, mirroring the theme store). Favorites are scoped per language pack
 * and keyed by the phrase's stable `phraseKeySlug` (not its row id), so a pack
 * regeneration that reissues rows keeps your stars. Pure over localStorage —
 * every function reads/writes fresh, so there's no in-memory state to sync.
 */
const KEY_PREFIX = 'pp-favorites:';

const storeKey = (languageId: string): string => `${KEY_PREFIX}${languageId}`;

/** The set of favorited phrase slugs for a pack (empty on any read failure). */
export function readFavorites(languageId: string): Set<string> {
  try {
    const raw = window.localStorage.getItem(storeKey(languageId));
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? new Set(parsed.filter((s): s is string => typeof s === 'string'))
      : new Set();
  } catch {
    return new Set();
  }
}

/** Persist a set of favorited slugs for a pack (no-op if storage is unavailable). */
export function writeFavorites(languageId: string, slugs: Set<string>): void {
  try {
    window.localStorage.setItem(storeKey(languageId), JSON.stringify([...slugs]));
  } catch {
    /* private mode / no storage — the in-memory set still applies this session */
  }
}

/** Toggle one slug's favorite state and persist; returns the new set. */
export function toggleFavorite(languageId: string, slug: string): Set<string> {
  const next = readFavorites(languageId);
  if (next.has(slug)) next.delete(slug);
  else next.add(slug);
  writeFavorites(languageId, next);
  return next;
}
