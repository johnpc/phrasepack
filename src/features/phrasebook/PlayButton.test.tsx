import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const media = vi.hoisted(() => ({ url: null as string | null }));
vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: () => media.url }));

const player = vi.hoisted(() => ({
  value: { state: 'idle' as string, toggle: vi.fn(), canPlay: true },
}));
vi.mock('./useAudioPlayer', () => ({ useAudioPlayer: () => player.value }));

import { PlayButton } from './PlayButton';

describe('PlayButton', () => {
  beforeEach(() => {
    media.url = null;
    player.value = { state: 'idle', toggle: vi.fn(), canPlay: true };
  });

  it('renders a muted state when there is no audioPath', () => {
    render(<PlayButton audioPath={null} label="Hello" />);
    expect(screen.getByLabelText('No audio available')).toBeInTheDocument();
    expect(screen.queryByTestId('phrase-play')).not.toBeInTheDocument();
  });

  it('renders a play button and toggles on click when audioPath is present', () => {
    media.url = 'https://s3/audio.mp3';
    render(<PlayButton audioPath="media/phrases/x.mp3" label="Hello" />);
    const btn = screen.getByTestId('phrase-play');
    expect(btn).toHaveAttribute('aria-label', 'Play Hello');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    btn.click();
    expect(player.value.toggle).toHaveBeenCalledTimes(1);
  });

  it('reflects the playing state in aria-pressed and label', () => {
    media.url = 'https://s3/audio.mp3';
    player.value = { state: 'playing', toggle: vi.fn(), canPlay: true };
    render(<PlayButton audioPath="media/phrases/x.mp3" label="Hello" />);
    const btn = screen.getByTestId('phrase-play');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(btn).toHaveAttribute('aria-label', 'Stop Hello');
  });
});
