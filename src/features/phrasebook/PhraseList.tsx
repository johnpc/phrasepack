import { useMemo, useState } from 'react';
import type { PhraseRecord } from '../../lib/dataClient';
import { filterPhrases } from './filterPhrases';
import { groupPhrases } from './groupPhrases';
import { PHRASE_CATEGORIES } from './phraseCategories';
import { PhraseRow } from './PhraseRow';
import { PhraseSearch } from './PhraseSearch';
import './PackDetail.css';

/** The searchable phrase list: a search box, the matching phrases grouped into
 * category sections, and a no-results state distinct from an empty pack. Owns
 * the search query so PackDetail stays a thin composition. */
export function PhraseList({ phrases }: { phrases: PhraseRecord[] }) {
  const [query, setQuery] = useState('');
  const sections = useMemo(
    () => groupPhrases(filterPhrases(phrases, query), PHRASE_CATEGORIES),
    [phrases, query],
  );

  return (
    <>
      <PhraseSearch value={query} onChange={setQuery} />
      {sections.length === 0 ? (
        <div className="pp-loadstate" data-testid="search-empty">
          <div className="pp-loadstate__emoji" aria-hidden="true">
            🔍
          </div>
          <p className="pp-loadstate__title pp-heading">No matches</p>
          <p className="pp-muted">No phrases match “{query}”.</p>
        </div>
      ) : (
        <div data-testid="phrase-sections">
          {sections.map((section) => (
            <section key={section.slug} className="pp-section">
              <h2 className="pp-kicker">{section.label}</h2>
              <ul className="pp-section__list">
                {section.phrases.map((phrase) => (
                  <PhraseRow key={phrase.id} phrase={phrase} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
