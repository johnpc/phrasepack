import type { PhraseRecord } from '../../lib/dataClient';
import { PhraseRow } from './PhraseRow';

/** One labelled section of phrase rows (a category, or the pinned Favorites).
 * Threads the favorite set + toggle down to each row. */
export function PhraseSection({
  label,
  phrases,
  favorites,
  onToggleFavorite,
}: {
  label: string;
  phrases: PhraseRecord[];
  favorites: Set<string>;
  onToggleFavorite: (slug: string) => void;
}) {
  return (
    <section className="pp-section">
      <h2 className="pp-kicker">{label}</h2>
      <ul className="pp-section__list">
        {phrases.map((phrase) => (
          <PhraseRow
            key={phrase.id}
            phrase={phrase}
            isFavorite={favorites.has(phrase.phraseKeySlug)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </ul>
    </section>
  );
}
