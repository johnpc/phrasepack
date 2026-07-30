import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const media = vi.hoisted(() => ({ url: null as string | null }));
vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: () => media.url }));

const player = vi.hoisted(() => ({
  value: { state: 'idle' as string, toggle: vi.fn(), playSlow: vi.fn(), canPlay: true },
}));
vi.mock('./useAudioPlayer', () => ({ useAudioPlayer: () => player.value }));

const synth = vi.hoisted(() => ({ synthesize: vi.fn(), isSynthesizing: false }));
vi.mock('./useSynthesizeAudio', () => ({ useSynthesizeAudio: () => synth }));

vi.mock('../shell/toastBus', () => ({ showToast: vi.fn() }));

import { PlayButton } from './PlayButton';

const props = { phraseId: 'p1', languageId: 'lang-es-es', label: 'Hello' };

describe('PlayButton', () => {
  beforeEach(() => {
    media.url = null;
    player.value = { state: 'idle', toggle: vi.fn(), playSlow: vi.fn(), canPlay: true };
    synth.synthesize = vi.fn().mockResolvedValue('media/phrases/lang-es-es/p1.mp3');
    synth.isSynthesizing = false;
  });

  it('offers a generate-audio button (not a dead icon) when there is no audioPath', () => {
    render(<PlayButton {...props} audioPath={null} />);
    const btn = screen.getByTestId('phrase-generate-audio');
    expect(btn).toHaveAttribute('aria-label', expect.stringContaining('Generate'));
    expect(screen.queryByTestId('phrase-play')).not.toBeInTheDocument();
  });

  it('synthesizes on demand when the generate button is tapped', async () => {
    render(<PlayButton {...props} audioPath={null} />);
    screen.getByTestId('phrase-generate-audio').click();
    await waitFor(() => expect(synth.synthesize).toHaveBeenCalledWith('p1'));
  });

  it('shows a muted "no audio for this language" state when synth returns no voice', async () => {
    synth.synthesize = vi.fn().mockResolvedValue(''); // empty path = no Polly voice (e.g. Greek)
    render(<PlayButton {...props} audioPath={null} />);
    screen.getByTestId('phrase-generate-audio').click();
    await waitFor(() =>
      expect(screen.getByText(/Audio isn.t available for this language/)).toBeInTheDocument(),
    );
    expect(screen.queryByTestId('phrase-generate-audio')).not.toBeInTheDocument();
    expect(screen.queryByTestId('phrase-play')).not.toBeInTheDocument();
  });

  it('renders a play button and toggles on click when audioPath is present', () => {
    media.url = 'https://s3/audio.mp3';
    render(<PlayButton {...props} audioPath="media/phrases/x.mp3" />);
    const btn = screen.getByTestId('phrase-play');
    expect(btn).toHaveAttribute('aria-label', 'Play Hello');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    btn.click();
    expect(player.value.toggle).toHaveBeenCalledTimes(1);
  });

  it('offers a slow-playback button that calls playSlow', () => {
    media.url = 'https://s3/audio.mp3';
    render(<PlayButton {...props} audioPath="media/phrases/x.mp3" />);
    const slow = screen.getByTestId('phrase-play-slow');
    expect(slow).toHaveAttribute('aria-label', 'Play Hello slowly');
    slow.click();
    expect(player.value.playSlow).toHaveBeenCalledTimes(1);
  });

  it('reflects the playing state in aria-pressed and label', () => {
    media.url = 'https://s3/audio.mp3';
    player.value = { state: 'playing', toggle: vi.fn(), playSlow: vi.fn(), canPlay: true };
    render(<PlayButton {...props} audioPath="media/phrases/x.mp3" />);
    const btn = screen.getByTestId('phrase-play');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(btn).toHaveAttribute('aria-label', 'Stop Hello');
  });
});
