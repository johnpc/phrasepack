import { useCallback, useEffect, useRef, useState } from 'react';

export type PlayState = 'idle' | 'playing' | 'error';

/** Plays a single audio URL through one reused <audio> element, tracking a
 * simple play state for the button UI. Toggling while playing stops it. Cleans
 * up on unmount so a row that scrolls away doesn't keep playing. Injectable
 * factory keeps it unit-testable without a real HTMLAudioElement. */
export function useAudioPlayer(
  url: string | null,
  makeAudio: (src: string) => HTMLAudioElement = defaultAudio,
) {
  const [state, setState] = useState<PlayState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      audioRef.current = null;
    }
    setState('idle');
  }, []);

  useEffect(() => stop, [stop]);

  const toggle = useCallback(() => {
    if (state === 'playing') {
      stop();
      return;
    }
    if (!url) {
      setState('error');
      return;
    }
    const audio = makeAudio(url);
    audioRef.current = audio;
    audio.onended = () => setState('idle');
    audio.onerror = () => setState('error');
    setState('playing');
    void Promise.resolve(audio.play()).catch(() => setState('error'));
  }, [state, url, makeAudio, stop]);

  return { state, toggle, canPlay: !!url };
}

function defaultAudio(src: string): HTMLAudioElement {
  return new Audio(src);
}
