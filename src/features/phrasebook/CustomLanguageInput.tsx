import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { sparkles } from 'ionicons/icons';
import { requestForName } from './customLanguage';
import type { CatalogLanguage } from './languageCatalog';
import './CustomLanguageInput.css';

/** Free-text "any language" request — the original spec: generate a pack for a
 * language beyond the fixed catalog. Resolves the typed name to a request
 * (reusing a catalog entry when it matches) and hands it up on submit. */
export function CustomLanguageInput({ onGenerate }: { onGenerate: (c: CatalogLanguage) => void }) {
  const [name, setName] = useState('');
  const request = requestForName(name);

  const submit = () => {
    if (request) onGenerate(request);
  };

  return (
    <form
      className="pp-custom"
      data-testid="custom-language"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        className="pp-custom__input"
        type="text"
        placeholder="Any language — e.g. Swahili, Greek…"
        aria-label="Language to generate"
        data-testid="custom-language-input"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="pp-custom__btn"
        type="submit"
        data-testid="custom-language-generate"
        disabled={!request}
      >
        <IonIcon icon={sparkles} aria-hidden="true" />
        Generate
      </button>
    </form>
  );
}
