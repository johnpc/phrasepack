import { useCallback, useState } from 'react';
import { readFavorites, toggleFavorite } from './favoritesStore';

/** Favorite state for one pack: the set of favorited phrase slugs + a toggle.
 * Reads localStorage once on mount (lazy initial state) and keeps an in-memory
 * mirror so the UI updates instantly; the store is the source of truth on the
 * next mount. */
export function useFavorites(languageId: string) {
  const [favorites, setFavorites] = useState<Set<string>>(() => readFavorites(languageId));

  const toggle = useCallback(
    (slug: string) => setFavorites(toggleFavorite(languageId, slug)),
    [languageId],
  );

  return { favorites, toggle };
}
