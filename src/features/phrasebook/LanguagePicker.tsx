import { usePublishedLanguages } from './languagesApi';
import { availableToGenerate, type CatalogLanguage } from './languageCatalog';
import { CustomLanguageInput } from './CustomLanguageInput';
import { LoadState } from '../shell/LoadState';
import './AddLanguage.css';

/** The idle state of Add-a-language: a free-text "any language" request (the
 * original spec) plus a grid of popular catalog picks not yet generated. The
 * custom input always shows — even once every catalog language exists. */
export function LanguagePicker({ onGenerate }: { onGenerate: (c: CatalogLanguage) => void }) {
  const existing = usePublishedLanguages();
  const choices = availableToGenerate((existing.data ?? []).map((l) => l.locale));

  return (
    <>
      <p className="pp-add-intro pp-muted">
        Generate a travel phrasebook for <strong>any</strong> language — spelling, phonetics, and
        (where available) spoken audio for every key phrase.
      </p>
      <CustomLanguageInput onGenerate={onGenerate} />
      <LoadState
        isLoading={existing.isLoading}
        isError={existing.isError}
        isEmpty={choices.length === 0}
        onRetry={() => void existing.refetch()}
        emptyTitle="Every popular language is ready"
        emptyMessage="Type any other language above to generate it."
      >
        <h2 className="pp-kicker pp-add-heading">Popular</h2>
        <div className="pp-add-grid" data-testid="catalog-list">
          {choices.map((c) => (
            <button
              key={c.locale}
              className="pp-add-choice"
              data-testid="catalog-choice"
              data-locale={c.locale}
              onClick={() => onGenerate(c)}
            >
              <span className="pp-add-choice__flag" aria-hidden="true">
                {c.flagEmoji}
              </span>
              <span className="pp-add-choice__name pp-heading">{c.name}</span>
              <span className="pp-add-choice__native pp-muted">{c.nativeName}</span>
            </button>
          ))}
        </div>
      </LoadState>
    </>
  );
}
