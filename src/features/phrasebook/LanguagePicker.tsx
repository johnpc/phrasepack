import { useState } from 'react';
import { usePublishedLanguages } from './languagesApi';
import { availableToGenerate, type CatalogLanguage } from './languageCatalog';
import { CustomLanguageInput } from './CustomLanguageInput';
import { DestinationPicker } from './DestinationPicker';
import { LoadState } from '../shell/LoadState';
import './AddLanguage.css';

type Mode = 'language' | 'destination';

/** The idle state of Add-a-language: a free-text "any language" request (the
 * original spec), a mode toggle, and either a grid of popular catalog languages
 * or a browse-by-destination grid. The custom input always shows. */
export function LanguagePicker({ onGenerate }: { onGenerate: (c: CatalogLanguage) => void }) {
  const [mode, setMode] = useState<Mode>('language');
  const existing = usePublishedLanguages();
  const choices = availableToGenerate((existing.data ?? []).map((l) => l.locale));

  return (
    <>
      <p className="pp-add-intro pp-muted">
        Generate a travel phrasebook for <strong>any</strong> language — spelling, phonetics, and
        (where available) spoken audio for every key phrase.
      </p>
      <CustomLanguageInput onGenerate={onGenerate} />

      <div className="pp-mode" role="tablist" aria-label="Browse by">
        <button
          role="tab"
          aria-selected={mode === 'language'}
          className="pp-mode__tab"
          data-active={mode === 'language'}
          data-testid="mode-language"
          onClick={() => setMode('language')}
        >
          By language
        </button>
        <button
          role="tab"
          aria-selected={mode === 'destination'}
          className="pp-mode__tab"
          data-active={mode === 'destination'}
          data-testid="mode-destination"
          onClick={() => setMode('destination')}
        >
          By destination
        </button>
      </div>

      {mode === 'destination' ? (
        <DestinationPicker onGenerate={onGenerate} />
      ) : (
        <LoadState
          isLoading={existing.isLoading}
          isError={existing.isError}
          isEmpty={choices.length === 0}
          onRetry={() => void existing.refetch()}
          emptyTitle="Every popular language is ready"
          emptyMessage="Type any other language above to generate it."
        >
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
      )}
    </>
  );
}
