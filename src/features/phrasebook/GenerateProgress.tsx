import { IonButton, IonSpinner } from '@ionic/react';
import type { GenPhase } from './useGenerate';
import './GenerateProgress.css';

interface Props {
  phase: GenPhase;
  languageName?: string;
  flagEmoji?: string;
  onRetry: () => void;
}

/** The full-screen state shown while a pack generates (and on failure). The
 * 'done' phase is handled by the caller (it navigates to the new pack), so this
 * only renders the working + failed states. Naming the language + showing its
 * flag makes the ~minute wait feel personal and confirms what's being built. */
export function GenerateProgress({ phase, languageName, flagEmoji, onRetry }: Props) {
  if (phase === 'failed') {
    return (
      <div className="pp-gen" role="alert" data-testid="generate-failed">
        <div className="pp-gen__emoji" aria-hidden="true">
          😕
        </div>
        <p className="pp-heading">Generation didn’t finish</p>
        <p className="pp-muted">
          Something went wrong while building the pack. Give it another go.
        </p>
        <IonButton onClick={onRetry}>Try again</IonButton>
      </div>
    );
  }
  const what = languageName ? `your ${languageName} phrasebook` : 'your phrasebook';
  return (
    <div className="pp-gen" data-testid="generate-progress" role="status">
      {/* Decorative — the heading announces the state; hide from AT so the
          spinners don't need their own name (axe aria-progressbar-name). */}
      {flagEmoji ? (
        <div className="pp-gen__flag" aria-hidden="true">
          {flagEmoji}
        </div>
      ) : (
        <IonSpinner name="crescent" aria-hidden="true" />
      )}
      <IonSpinner className="pp-gen__spinner" name="dots" aria-hidden="true" />
      <p className="pp-heading">Building {what}…</p>
      <p className="pp-muted">
        Translating the key phrases and recording the audio. This takes about a minute.
      </p>
    </div>
  );
}
