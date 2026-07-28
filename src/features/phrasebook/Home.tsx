import {
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { add, settingsOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { usePublishedLanguages } from './languagesApi';
import { LanguageCard } from './LanguageCard';
import { LoadState } from '../shell/LoadState';
import './Home.css';

/** Home — the traveler's shelf of language packs. Guest-first: no sign-in to
 * browse or open a pack. A prominent "Add a language" button routes to the
 * AI-generation picker. */
export function Home() {
  const history = useHistory();
  const { data, isLoading, isError, refetch } = usePublishedLanguages();
  const languages = data ?? [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>PhrasePack</IonTitle>
          <IonButtons slot="end">
            <button
              className="pp-iconbtn"
              aria-label="Settings"
              onClick={() => history.push('/settings')}
            >
              <IonIcon icon={settingsOutline} aria-hidden="true" />
            </button>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="pp-container">
          <button
            className="pp-add"
            data-testid="add-language"
            onClick={() => history.push('/add')}
          >
            <IonIcon icon={add} aria-hidden="true" />
            Add a language
          </button>
          <LoadState
            isLoading={isLoading}
            isError={isError}
            isEmpty={languages.length === 0}
            onRetry={() => void refetch()}
            emptyTitle="No packs yet"
            emptyMessage="Tap “Add a language” to generate your first travel phrasebook."
          >
            <div className="pp-home__grid" data-testid="language-list">
              {languages.map((lang) => (
                <LanguageCard
                  key={lang.id}
                  language={lang}
                  onOpen={(id) => history.push(`/pack/${id}`)}
                />
              ))}
            </div>
          </LoadState>
        </div>
      </IonContent>
    </IonPage>
  );
}
