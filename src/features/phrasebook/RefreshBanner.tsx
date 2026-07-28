import { IonIcon, IonSpinner } from '@ionic/react';
import { sparkles } from 'ionicons/icons';
import type { LanguageRecord } from '../../lib/dataClient';
import { isStale } from './staleness';
import { useGenerate } from './useGenerate';
import './RefreshBanner.css';

/** When a pack predates the current phrase catalog (new key phrases were added
 * since it was generated), offer a one-tap refresh that fills only the missing
 * phrases. Hidden entirely for up-to-date packs. Guest-callable. */
export function RefreshBanner({ language }: { language: LanguageRecord }) {
  const { phase, regenerate } = useGenerate();
  const busy = phase === 'starting' || phase === 'running';

  if (phase === 'done') {
    return (
      <div className="pp-refresh pp-refresh--done" role="status" data-testid="refresh-done">
        Updated with the latest phrases.
      </div>
    );
  }
  if (!isStale(language.keyVersion)) return null;

  return (
    <div className="pp-refresh" data-testid="refresh-banner">
      <div className="pp-refresh__text">
        <IonIcon icon={sparkles} aria-hidden="true" />
        <span>New key phrases were added. Refresh this pack to fill them in.</span>
      </div>
      <button
        className="pp-refresh__btn"
        data-testid="refresh-button"
        disabled={busy}
        aria-label={busy ? 'Refreshing' : 'Refresh'}
        onClick={() => regenerate(language.id)}
      >
        {busy ? <IonSpinner name="crescent" aria-hidden="true" /> : 'Refresh'}
      </button>
    </div>
  );
}
