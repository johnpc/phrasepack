import { IonIcon } from '@ionic/react';
import { playCircle, pauseCircle, volumeMuteOutline } from 'ionicons/icons';
import { useMediaUrl } from '../../lib/useMediaUrl';
import { useAudioPlayer } from './useAudioPlayer';
import './PlayButton.css';

/** The per-phrase "play" button. Resolves the phrase's S3 audio key to a
 * presigned URL, then plays it through the shared audio hook. When a phrase has
 * no audio (synthesis failed at generation), it renders a muted, disabled state
 * rather than a broken control. */
export function PlayButton({ audioPath, label }: { audioPath?: string | null; label: string }) {
  const url = useMediaUrl(audioPath);
  const { state, toggle, canPlay } = useAudioPlayer(url);

  if (!audioPath) {
    // Non-interactive, so no aria-label (prohibited on a span with no role);
    // the meaning is conveyed by visually-hidden text + a hover title.
    return (
      <span className="pp-play pp-play--muted" title="No audio">
        <IonIcon icon={volumeMuteOutline} aria-hidden="true" />
        <span className="pp-sr-only">No audio available</span>
      </span>
    );
  }

  const playing = state === 'playing';
  return (
    <button
      className="pp-play"
      data-testid="phrase-play"
      data-state={state}
      aria-label={playing ? `Stop ${label}` : `Play ${label}`}
      aria-pressed={playing}
      disabled={!canPlay && state !== 'error'}
      onClick={toggle}
    >
      <IonIcon icon={playing ? pauseCircle : playCircle} aria-hidden="true" />
    </button>
  );
}
