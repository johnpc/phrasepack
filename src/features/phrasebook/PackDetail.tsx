import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useLanguage } from './languagesApi';
import { usePhrases } from './phrasesApi';
import { groupPhrases } from './groupPhrases';
import { PHRASE_CATEGORIES } from './phraseCategories';
import { PhraseRow } from './PhraseRow';
import { PackHeader } from './PackHeader';
import { RefreshBanner } from './RefreshBanner';
import { LoadState } from '../shell/LoadState';
import './PackDetail.css';

/** A single language pack: its phrases grouped into category sections, each row
 * showing the translation, English, phonetic, and a play button. Shows a
 * refresh banner when the pack predates the current phrase catalog. */
export function PackDetail() {
  const { id } = useParams<{ id: string }>();
  const lang = useLanguage(id);
  const phrases = usePhrases(id);
  const sections = groupPhrases(phrases.data ?? [], PHRASE_CATEGORIES);

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
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="pp-container">
          {lang.data && <PackHeader language={lang.data} />}
          {lang.data && <RefreshBanner language={lang.data} />}
          <LoadState
            isLoading={phrases.isLoading}
            isError={phrases.isError}
            isEmpty={sections.length === 0}
            onRetry={() => void phrases.refetch()}
            emptyTitle="No phrases yet"
            emptyMessage="This pack is still being generated — check back in a moment."
          >
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
          </LoadState>
        </div>
      </IonContent>
    </IonPage>
  );
}
