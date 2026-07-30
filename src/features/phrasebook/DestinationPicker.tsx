import { usePublishedLanguages } from './languagesApi';
import { destinationsToOffer } from './destinations';
import type { CatalogLanguage } from './languageCatalog';
import { LoadState } from '../shell/LoadState';
import './AddLanguage.css';

/** Browse by destination: "Going to Japan? → Japanese." Country cards mapped to
 * their catalog language; picking one generates that language's pack. Shows
 * only destinations whose language isn't already generated. */
export function DestinationPicker({ onGenerate }: { onGenerate: (c: CatalogLanguage) => void }) {
  const existing = usePublishedLanguages();
  const choices = destinationsToOffer((existing.data ?? []).map((l) => l.locale));

  return (
    <LoadState
      isLoading={existing.isLoading}
      isError={existing.isError}
      isEmpty={choices.length === 0}
      onRetry={() => void existing.refetch()}
      emptyTitle="You’re covered"
      emptyMessage="Every destination’s language is ready. Add any other language by name."
    >
      <p className="pp-add-intro pp-muted">
        Where are you headed? We’ll set up the local language.
      </p>
      <div className="pp-add-grid" data-testid="destination-list">
        {choices.map((d) => (
          <button
            key={d.country}
            className="pp-add-choice"
            data-testid="destination-choice"
            data-country={d.country}
            onClick={() => onGenerate(d.language)}
          >
            <span className="pp-add-choice__flag" aria-hidden="true">
              {d.flagEmoji}
            </span>
            <span className="pp-add-choice__name pp-heading">{d.country}</span>
            <span className="pp-add-choice__native pp-muted">{d.language.name}</span>
          </button>
        ))}
      </div>
    </LoadState>
  );
}
