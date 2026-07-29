import { IonIcon } from '@ionic/react';
import { shareOutline } from 'ionicons/icons';
import type { LanguageRecord } from '../../lib/dataClient';
import { buildSharePayload } from './sharePayload';
import { sharePack, type ShareOutcome } from './shareEdge';
import { showToast } from '../shell/toastBus';
import './ShareButton.css';

const TOASTS: Partial<Record<ShareOutcome, string>> = {
  copied: 'Link copied — paste it to a travel companion.',
  failed: 'Couldn’t share the link. Try again.',
};

/** Share this pack. Uses the native share sheet where available, otherwise
 * copies the deep link to the clipboard; a toast confirms the copy/failure
 * (the native sheet gives its own feedback, and a cancel is silent). Packs are
 * guest-readable at a stable URL, so the link works for anyone. */
export function ShareButton({ language }: { language: LanguageRecord }) {
  const onShare = async () => {
    const outcome = await sharePack(buildSharePayload(language, window.location.origin));
    const msg = TOASTS[outcome];
    if (msg) showToast(msg);
  };
  return (
    <button
      className="pp-share"
      data-testid="share-pack"
      aria-label={`Share the ${language.name} pack`}
      onClick={onShare}
    >
      <IonIcon icon={shareOutline} aria-hidden="true" />
    </button>
  );
}
