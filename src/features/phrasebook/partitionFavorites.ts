/**
 * Pure split of a phrase list into favorited vs the rest, by phraseKeySlug.
 * Favorites keep their original relative order (so the pinned section reads
 * predictably). Kept pure so the pinning logic is unit-testable.
 */
import type { PhraseRecord } from '../../lib/dataClient';

export interface Partitioned {
  favorites: PhraseRecord[];
  rest: PhraseRecord[];
}

export function partitionFavorites(
  phrases: PhraseRecord[],
  favoriteSlugs: Set<string>,
): Partitioned {
  const favorites: PhraseRecord[] = [];
  const rest: PhraseRecord[] = [];
  for (const p of phrases) {
    if (favoriteSlugs.has(p.phraseKeySlug)) favorites.push(p);
    else rest.push(p);
  }
  return { favorites, rest };
}
