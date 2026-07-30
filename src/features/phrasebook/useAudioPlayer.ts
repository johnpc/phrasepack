import { useCallback, useEffect, useRef, useState } from 'react';

export type PlayState = 'idle' | 'playing' | 'error';

/** Plays a single audio URL through one reused <audio> element, tracking a
 * simple play state for the button UI. Toggling while playing stops it. Cleans
 * up on unmount so a row that scrolls away doesn't keep playing. Injectable
 * factory keeps it unit-testable without a real HTMLAudioElement.
 *
 * `autoPlay` plays once the moment a url first becomes available — used when a
 * phrase's audio was just synthesized on demand, so the tap that generated it
 * also plays it (no second tap). */
export function useAudioPlayer(
  url: string | null,
  makeAudio: (src: string) => HTMLAudioElement = defaultAudio,
  autoPlay = false,
) {
  const [state, setState] = useState<PlayState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPlayedFor = useRef<string | null>(null);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      audioRef.current = null;
    }
    setState('idle');
  }, []);

  useEffect(() => stop, [stop]);

  const play = useCallback(
    (rate = 1) => {
      if (!url) {
        setState('error');
        return;
      }
      const audio = makeAudio(url);
      audioRef.current = audio;
      audio.playbackRate = rate; // < 1 for a slow, learn-to-say-it playback
      audio.onended = () => setState('idle');
      audio.onerror = () => setState('error');
      setState('playing');
      void Promise.resolve(audio.play()).catch(() => setState('error'));
    },
    [url, makeAudio],
  );

  const toggle = useCallback(() => {
    if (state === 'playing') stop();
    else play(1);
  }, [state, stop, play]);

  // Play (or restart) slowly — always plays from the top at reduced rate, so a
  // learner can tap it mid-listen to hear the same phrase drawn out.
  const playSlow = useCallback(() => {
    stop();
    play(SLOW_RATE);
  }, [stop, play]);

  // Auto-play once per newly-arrived url (e.g. just-synthesized audio).
  useEffect(() => {
    if (autoPlay && url && autoPlayedFor.current !== url) {
      autoPlayedFor.current = url;
      play(1);
    }
  }, [autoPlay, url, play]);

  return { state, toggle, playSlow, canPlay: !!url };
}

/** Slow-playback rate — slow enough to distinguish syllables, not a distorted
 * drawl. 0.6 reads clearly on both HTML audio and Polly MP3s. */
export const SLOW_RATE = 0.6;

function defaultAudio(src: string): HTMLAudioElement {
  return new Audio(src);
}
