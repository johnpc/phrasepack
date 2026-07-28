import { useMemo, useState } from 'react';
import type { PhraseRecord } from '../../lib/dataClient';
import { filterPhrases } from './filterPhrases';
import { groupPhrases } from './groupPhrases';
import { partitionFavorites } from './partitionFavorites';
import { PHRASE_CATEGORIES } from './phraseCategories';
import { PhraseSection } from './PhraseSection';
import { PhraseSearch } from './PhraseSearch';
import { useFavorites } from './useFavorites';
import './PackDetail.css';

/** The searchable, favoritable phrase list: a search box, a pinned Favorites
 * section, then the matching phrases grouped into category sections, and a
 * no-results state distinct from an empty pack. Owns search + favorite state so
 * PackDetail stays a thin composition. */
export function PhraseList({
  languageId,
  phrases,
}: {
  languageId: string;
  phrases: PhraseRecord[];
}) {
  const [query, setQuery] = useState('');
  const { favorites, toggle } = useFavorites(languageId);

  const { favSection, sections } = useMemo(() => {
    const filtered = filterPhrases(phrases, query);
    const { favorites: favs, rest } = partitionFavorites(filtered, favorites);
    return {
      favSection: favs,
      sections: groupPhrases(rest, PHRASE_CATEGORIES),
    };
  }, [phrases, query, favorites]);

  const isEmpty = favSection.length === 0 && sections.length === 0;

  return (
    <>
      <PhraseSearch value={query} onChange={setQuery} />
      {isEmpty ? (
        <div className="pp-loadstate" data-testid="search-empty">
          <div className="pp-loadstate__emoji" aria-hidden="true">
            🔍
          </div>
          <p className="pp-loadstate__title pp-heading">No matches</p>
          <p className="pp-muted">No phrases match “{query}”.</p>
        </div>
      ) : (
        <div data-testid="phrase-sections">
          {favSection.length > 0 && (
            <PhraseSection
              label="★ Favorites"
              phrases={favSection}
              favorites={favorites}
              onToggleFavorite={toggle}
            />
          )}
          {sections.map((s) => (
            <PhraseSection
              key={s.slug}
              label={s.label}
              phrases={s.phrases}
              favorites={favorites}
              onToggleFavorite={toggle}
            />
          ))}
        </div>
      )}
    </>
  );
}
