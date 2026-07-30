import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { IonButton, IonIcon } from '@ionic/react';
import { schoolOutline } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { useLanguage } from './languagesApi';
import { usePhrases } from './phrasesApi';
import { PackHeader } from './PackHeader';
import { PhraseList } from './PhraseList';
import { RefreshBanner } from './RefreshBanner';
import { ShareButton } from './ShareButton';
import { LoadState } from '../shell/LoadState';
import './PackDetail.css';

/** A single language pack: a searchable list of phrases grouped into category
 * sections, each row showing the translation, English, phonetic, and a play
 * button. Shows a refresh banner when the pack predates the current catalog. */
export function PackDetail() {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const lang = useLanguage(id);
  const phrases = usePhrases(id);
  const rows = phrases.data ?? [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>
            {lang.data?.flagEmoji ? `${lang.data.flagEmoji} ` : ''}
            {lang.data?.name ?? 'Pack'}
          </IonTitle>
          {lang.data && (
            <IonButtons slot="end">
              <ShareButton language={lang.data} />
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="pp-container">
          {lang.data && <PackHeader language={lang.data} />}
          {lang.data && <RefreshBanner language={lang.data} />}
          {rows.length > 0 && (
            <IonButton
              expand="block"
              className="pp-practice-cta"
              data-testid="start-practice"
              onClick={() => history.push(`/pack/${id}/practice`)}
            >
              <IonIcon icon={schoolOutline} slot="start" aria-hidden="true" />
              Practice these phrases
            </IonButton>
          )}
          <LoadState
            isLoading={phrases.isLoading}
            isError={phrases.isError}
            isEmpty={rows.length === 0}
            onRetry={() => void phrases.refetch()}
            emptyTitle="No phrases yet"
            emptyMessage="This pack is still being generated — check back in a moment."
          >
            <PhraseList languageId={id} phrases={rows} />
          </LoadState>
        </div>
      </IonContent>
    </IonPage>
  );
}
