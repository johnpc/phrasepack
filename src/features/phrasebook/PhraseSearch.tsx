import { IonIcon } from '@ionic/react';
import { searchOutline, closeCircle } from 'ionicons/icons';
import './PhraseSearch.css';

/** The pack search box — filters phrases by English, translation, or phonetic.
 * A controlled input; the parent owns the query. Shows a clear button when
 * there's text. type=search so mobile keyboards offer a Search key. */
export function PhraseSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="pp-search">
      <IonIcon className="pp-search__icon" icon={searchOutline} aria-hidden="true" />
      <input
        className="pp-search__input"
        type="search"
        inputMode="search"
        placeholder="Search phrases…"
        aria-label="Search phrases"
        data-testid="phrase-search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className="pp-search__clear"
          aria-label="Clear search"
          data-testid="phrase-search-clear"
          onClick={() => onChange('')}
        >
          <IonIcon icon={closeCircle} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
