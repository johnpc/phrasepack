import { useMemo, useState } from 'react';
import type { PhraseRecord } from '../../lib/dataClient';
import { filterPhrases } from './filterPhrases';
import { groupPhrases } from './groupPhrases';
import { partitionFavorites } from './partitionFavorites';
import { PHRASE_CATEGORIES } from './phraseCategories';
import { ALL_CATEGORIES, chipsFor, filterByCategory } from './categoryFilter';
import { CategoryChips } from './CategoryChips';
import { PhraseSection } from './PhraseSection';
import { PhraseSearch } from './PhraseSearch';
import { ShowPhrase } from './ShowPhrase';
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
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [shown, setShown] = useState<PhraseRecord | null>(null);
  const { favorites, toggle } = useFavorites(languageId);

  const chips = useMemo(() => chipsFor(phrases, PHRASE_CATEGORIES), [phrases]);

  const { favSection, sections } = useMemo(() => {
    const filtered = filterByCategory(filterPhrases(phrases, query), category);
    const { favorites: favs, rest } = partitionFavorites(filtered, favorites);
    return {
      favSection: favs,
      sections: groupPhrases(rest, PHRASE_CATEGORIES),
    };
  }, [phrases, query, category, favorites]);

  const isEmpty = favSection.length === 0 && sections.length === 0;

  return (
    <>
      <PhraseSearch value={query} onChange={setQuery} />
      {chips.length > 1 && <CategoryChips chips={chips} active={category} onChange={setCategory} />}
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
              onShow={setShown}
            />
          )}
          {sections.map((s) => (
            <PhraseSection
              key={s.slug}
              label={s.label}
              phrases={s.phrases}
              favorites={favorites}
              onToggleFavorite={toggle}
              onShow={setShown}
            />
          ))}
        </div>
      )}
      {shown && <ShowPhrase phrase={shown} onClose={() => setShown(null)} />}
    </>
  );
}
