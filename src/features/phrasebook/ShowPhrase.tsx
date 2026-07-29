import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { IonIcon } from '@ionic/react';
import { close } from 'ionicons/icons';
import type { PhraseRecord } from '../../lib/dataClient';
import { useDialogFocus } from '../../lib/useDialogFocus';
import { PlayButton } from './PlayButton';
import './ShowPhrase.css';

/** A full-screen overlay showing one phrase in huge type — hold your phone up
 * and let a local read it. The foreign translation is the hero; the English +
 * phonetic sit beneath, with a play button. Closes on the × , a backdrop tap,
 * or Escape. role=dialog + aria-modal for assistive tech; focus moves to the
 * close button on open and returns to the trigger on close. */
export function ShowPhrase({ phrase, onClose }: { phrase: PhraseRecord; onClose: () => void }) {
  const closeRef = useDialogFocus<HTMLButtonElement>();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Portal to <body> so position:fixed escapes Ionic's transformed IonContent
  // (a transformed ancestor makes `fixed` relative to it, trapping the overlay
  // under the toolbar). Rendered at the top level, it truly covers the screen.
  return createPortal(
    <div
      className="pp-show"
      data-testid="show-phrase"
      role="dialog"
      aria-modal="true"
      aria-label={`${phrase.sourceText} in this language`}
      onClick={onClose}
    >
      <button
        ref={closeRef}
        className="pp-show__close"
        aria-label="Close"
        data-testid="show-close"
        onClick={onClose}
      >
        <IonIcon icon={close} aria-hidden="true" />
      </button>
      {/* Stop propagation so tapping the content doesn't dismiss. */}
      <div className="pp-show__content" onClick={(e) => e.stopPropagation()}>
        <p className="pp-show__translation pp-phrase" data-testid="show-translation">
          {phrase.translation}
        </p>
        {phrase.phonetic && <p className="pp-show__phonetic">{phrase.phonetic}</p>}
        <p className="pp-show__source pp-muted">{phrase.sourceText}</p>
        <PlayButton audioPath={phrase.audioPath} label={phrase.sourceText} />
      </div>
    </div>,
    document.body,
  );
}
