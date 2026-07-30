import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../phrasebook/languagesApi';
import { usePhrases } from '../phrasebook/phrasesApi';
import { LoadState } from '../shell/LoadState';
import { usePractice } from './usePractice';
import { PracticeCard } from './PracticeCard';
import './Practice.css';

/** Practice mode: a flashcard drill over a pack's phrases — English prompt →
 * reveal translation + phonetic + audio → self-grade. Turns the phrasebook into
 * something you learn from. Guest-first, no progress persisted server-side. */
export function Practice() {
  const { id } = useParams<{ id: string }>();
  const lang = useLanguage(id);
  const phrases = usePhrases(id);
  const rows = phrases.data ?? [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/pack/${id}`} />
          </IonButtons>
          <IonTitle>Practice{lang.data?.name ? ` · ${lang.data.name}` : ''}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="pp-container">
          <LoadState
            isLoading={phrases.isLoading}
            isError={phrases.isError}
            isEmpty={rows.length === 0}
            onRetry={() => void phrases.refetch()}
            emptyTitle="Nothing to practice yet"
            emptyMessage="This pack has no phrases yet."
          >
            <PracticeRunner phrases={rows} />
          </LoadState>
        </div>
      </IonContent>
    </IonPage>
  );
}

/** The session itself, split out so it only mounts once phrases are loaded. */
function PracticeRunner({ phrases }: { phrases: ReturnType<typeof usePhrases>['data'] & object }) {
  const { current, revealed, mastered, total, complete, reveal, grade, restart } =
    usePractice(phrases);

  if (complete) {
    return (
      <div className="pp-practice-done" data-testid="practice-complete">
        <div className="pp-practice-done__emoji" aria-hidden="true">
          🎉
        </div>
        <p className="pp-heading">All {total} phrases practiced!</p>
        <IonButton data-testid="practice-restart" onClick={restart}>
          Practice again
        </IonButton>
      </div>
    );
  }

  return (
    <>
      <div className="pp-progress" data-testid="practice-progress">
        <div className="pp-progress__bar" style={{ width: `${(mastered / total) * 100}%` }} />
      </div>
      <p className="pp-progress__label pp-muted">
        {mastered} / {total} mastered
      </p>
      {current && (
        <PracticeCard phrase={current} revealed={revealed} onReveal={reveal} onGrade={grade} />
      )}
    </>
  );
}
