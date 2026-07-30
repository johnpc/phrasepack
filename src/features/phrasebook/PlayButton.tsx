import { useState } from 'react';
import { IonIcon, IonSpinner } from '@ionic/react';
import { playCircle, pauseCircle, volumeHighOutline, volumeMuteOutline } from 'ionicons/icons';
import { useMediaUrl } from '../../lib/useMediaUrl';
import { useAudioPlayer } from './useAudioPlayer';
import { useSynthesizeAudio } from './useSynthesizeAudio';
import { showToast } from '../shell/toastBus';
import './PlayButton.css';

interface Props {
  phraseId: string;
  languageId: string;
  audioPath?: string | null;
  label: string;
}

/** The per-phrase audio control. If the phrase already has audio, it plays it.
 * If it doesn't (a seeded pack, or a voice added later), it shows a "generate"
 * button that synthesizes the audio on demand (Polly), then plays it — cached
 * from then on. */
export function PlayButton({ phraseId, languageId, audioPath, label }: Props) {
  const { synthesize, isSynthesizing } = useSynthesizeAudio(languageId);
  const [freshPath, setFreshPath] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [noVoice, setNoVoice] = useState(false);
  const path = audioPath ?? freshPath;
  const url = useMediaUrl(path);
  const { state, toggle, playSlow } = useAudioPlayer(url, undefined, autoPlay);

  // The language has no Amazon Polly voice (e.g. Greek) — synthesis returned an
  // empty path. Show a clear muted state so the button doesn't look broken.
  if (noVoice) {
    return (
      <span className="pp-play pp-play--muted" title="Audio isn’t available for this language">
        <IonIcon icon={volumeMuteOutline} aria-hidden="true" />
        <span className="pp-sr-only">Audio isn’t available for this language</span>
      </span>
    );
  }

  // No audio yet → a "generate & play" button (not a dead muted icon).
  if (!path) {
    return (
      <button
        className="pp-play pp-play--generate"
        data-testid="phrase-generate-audio"
        aria-label={`Generate and play audio for ${label}`}
        disabled={isSynthesizing}
        onClick={async () => {
          const p = await synthesize(phraseId);
          if (p) {
            setAutoPlay(true);
            setFreshPath(p);
          } else {
            // Empty path = no voice for this language; make that visible.
            setNoVoice(true);
            showToast('Audio isn’t available for this language yet.');
          }
        }}
      >
        {isSynthesizing ? (
          <IonSpinner name="crescent" aria-hidden="true" />
        ) : (
          <IonIcon icon={volumeHighOutline} aria-hidden="true" />
        )}
      </button>
    );
  }

  const playing = state === 'playing';
  return (
    <span className="pp-play-group">
      <button
        className="pp-play"
        data-testid="phrase-play"
        data-state={state}
        aria-label={playing ? `Stop ${label}` : `Play ${label}`}
        aria-pressed={playing}
        onClick={toggle}
      >
        <IonIcon icon={playing ? pauseCircle : playCircle} aria-hidden="true" />
      </button>
      <button
        className="pp-play-slow"
        data-testid="phrase-play-slow"
        aria-label={`Play ${label} slowly`}
        onClick={playSlow}
      >
        ½×
      </button>
    </span>
  );
}
