import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { usePublishedLanguages } from './languagesApi';
import { availableToGenerate } from './languageCatalog';
import { useGenerate } from './useGenerate';
import { GenerateProgress } from './GenerateProgress';
import { LoadState } from '../shell/LoadState';
import './AddLanguage.css';

/** Pick a language to generate a pack for (AI). Offers the catalog minus the
 * packs already generated; on completion routes to the fresh pack. Guest-first
 * — no account needed to generate. */
export function AddLanguage() {
  const history = useHistory();
  const existing = usePublishedLanguages();
  const { phase, languageId, generate } = useGenerate();
  const choices = availableToGenerate((existing.data ?? []).map((l) => l.locale));

  useEffect(() => {
    if (phase === 'done' && languageId) history.replace(`/pack/${languageId}`);
  }, [phase, languageId, history]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Add a language</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="pp-container pp-container--wide">
          {phase === 'idle' ? (
            <LoadState
              isLoading={existing.isLoading}
              isError={existing.isError}
              isEmpty={choices.length === 0}
              onRetry={() => void existing.refetch()}
              emptyTitle="All caught up"
              emptyMessage="You’ve generated every language in the catalog."
            >
              <p className="pp-add-intro pp-muted">
                Pick a language and we’ll generate a travel phrasebook for it — spelling, phonetics,
                and spoken audio for every key phrase.
              </p>
              <div className="pp-add-grid" data-testid="catalog-list">
                {choices.map((c) => (
                  <button
                    key={c.locale}
                    className="pp-add-choice"
                    data-testid="catalog-choice"
                    data-locale={c.locale}
                    onClick={() => generate(c)}
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
          ) : (
            <GenerateProgress phase={phase} onRetry={() => history.replace('/add')} />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
