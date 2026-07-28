import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAudioPlayer } from './useAudioPlayer';

interface FakeAudio {
  play: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  onended: (() => void) | null;
  onerror: (() => void) | null;
}

function fakeAudio(play: () => Promise<void> = () => Promise.resolve()): FakeAudio {
  return { play: vi.fn(play), pause: vi.fn(), onended: null, onerror: null };
}

/** Cast a FakeAudio to the HTMLAudioElement the factory must return. */
const asAudio = (a: FakeAudio) => a as unknown as HTMLAudioElement;

describe('useAudioPlayer', () => {
  it('starts idle and reports canPlay from the url', () => {
    const { result } = renderHook(() => useAudioPlayer('u', () => asAudio(fakeAudio())));
    expect(result.current.state).toBe('idle');
    expect(result.current.canPlay).toBe(true);
  });

  it('toggle plays: state becomes playing and play() is called', () => {
    const audio = fakeAudio();
    const { result } = renderHook(() => useAudioPlayer('u', () => asAudio(audio)));
    act(() => result.current.toggle());
    expect(result.current.state).toBe('playing');
    expect(audio.play).toHaveBeenCalled();
  });

  it('toggle again stops: pause() is called and state returns to idle', () => {
    const audio = fakeAudio();
    const { result } = renderHook(() => useAudioPlayer('u', () => asAudio(audio)));
    act(() => result.current.toggle());
    act(() => result.current.toggle());
    expect(audio.pause).toHaveBeenCalled();
    expect(result.current.state).toBe('idle');
  });

  it('a null url toggles to error and reports canPlay false', () => {
    const { result } = renderHook(() => useAudioPlayer(null, () => asAudio(fakeAudio())));
    expect(result.current.canPlay).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.state).toBe('error');
  });

  it('a play() rejection sets error', async () => {
    const audio = fakeAudio(() => Promise.reject(new Error('boom')));
    const { result } = renderHook(() => useAudioPlayer('u', () => asAudio(audio)));
    await act(async () => {
      result.current.toggle();
      await Promise.resolve();
    });
    expect(result.current.state).toBe('error');
  });

  it('onended returns the state to idle', () => {
    const audio = fakeAudio();
    const { result } = renderHook(() => useAudioPlayer('u', () => asAudio(audio)));
    act(() => result.current.toggle());
    expect(result.current.state).toBe('playing');
    act(() => audio.onended?.());
    expect(result.current.state).toBe('idle');
  });

  it('onerror sets error', () => {
    const audio = fakeAudio();
    const { result } = renderHook(() => useAudioPlayer('u', () => asAudio(audio)));
    act(() => result.current.toggle());
    act(() => audio.onerror?.());
    expect(result.current.state).toBe('error');
  });

  it('uses the default Audio factory when none is injected', () => {
    // jsdom doesn't implement media playback, so stub play/pause to exercise the
    // default `new Audio(src)` factory branch without the "Not implemented" noise.
    const playSpy = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const pauseSpy = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const { result, unmount } = renderHook(() => useAudioPlayer('u'));
    act(() => result.current.toggle());
    expect(result.current.state).toBe('playing');
    expect(playSpy).toHaveBeenCalled();
    unmount();
    playSpy.mockRestore();
    pauseSpy.mockRestore();
  });

  it('pauses the audio on unmount', () => {
    const audio = fakeAudio();
    const { result, unmount } = renderHook(() => useAudioPlayer('u', () => asAudio(audio)));
    act(() => result.current.toggle());
    unmount();
    expect(audio.pause).toHaveBeenCalled();
  });
});
