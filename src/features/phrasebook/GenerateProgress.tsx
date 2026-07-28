import { IonButton, IonSpinner } from '@ionic/react';
import type { GenPhase } from './useGenerate';
import './GenerateProgress.css';

/** The full-screen state shown while a pack generates (and on failure). The
 * 'done' phase is handled by the caller (it navigates to the new pack), so this
 * only renders the working + failed states. */
export function GenerateProgress({ phase, onRetry }: { phase: GenPhase; onRetry: () => void }) {
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
  return (
    <div className="pp-gen" data-testid="generate-progress">
      <IonSpinner name="crescent" />
      <p className="pp-heading">Building your phrasebook…</p>
      <p className="pp-muted">
        Translating the key phrases and recording the audio. This takes about a minute.
      </p>
    </div>
  );
}
