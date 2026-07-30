import { IonButton, IonIcon } from '@ionic/react';
import { eyeOutline } from 'ionicons/icons';
import type { PhraseRecord } from '../../lib/dataClient';
import { PlayButton } from '../phrasebook/PlayButton';
import './Practice.css';

/** One practice card: the English prompt, then (once revealed) the translation,
 * phonetic, and audio, with self-grade buttons. Controlled by the parent. */
export function PracticeCard({
  phrase,
  revealed,
  onReveal,
  onGrade,
}: {
  phrase: PhraseRecord;
  revealed: boolean;
  onReveal: () => void;
  onGrade: (gotIt: boolean) => void;
}) {
  return (
    <div className="pp-card" data-testid="practice-card">
      <p className="pp-card__prompt pp-muted">How do you say…</p>
      <p className="pp-card__english pp-heading">{phrase.sourceText}</p>

      {revealed ? (
        <div className="pp-card__answer" data-testid="practice-answer">
          <p className="pp-card__translation pp-phrase">{phrase.translation}</p>
          {phrase.phonetic && <p className="pp-card__phonetic">{phrase.phonetic}</p>}
          <PlayButton
            phraseId={phrase.id}
            languageId={phrase.languageId}
            audioPath={phrase.audioPath}
            label={phrase.sourceText}
          />
          <div className="pp-card__grades">
            <IonButton fill="outline" data-testid="grade-again" onClick={() => onGrade(false)}>
              Practice again
            </IonButton>
            <IonButton data-testid="grade-got-it" onClick={() => onGrade(true)}>
              Got it
            </IonButton>
          </div>
        </div>
      ) : (
        <IonButton className="pp-card__reveal" data-testid="practice-reveal" onClick={onReveal}>
          <IonIcon icon={eyeOutline} slot="start" aria-hidden="true" />
          Reveal
        </IonButton>
      )}
    </div>
  );
}
