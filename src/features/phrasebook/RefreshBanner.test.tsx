import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LanguageRecord } from '../../lib/dataClient';

const gen = vi.hoisted(() => ({
  value: { phase: 'idle' as string, regenerate: vi.fn() },
}));
vi.mock('./useGenerate', () => ({ useGenerate: () => gen.value }));

import { RefreshBanner } from './RefreshBanner';

function language(keyVersion: number): LanguageRecord {
  return { id: 'l1', name: 'Spanish', keyVersion } as unknown as LanguageRecord;
}

describe('RefreshBanner', () => {
  beforeEach(() => {
    gen.value = { phase: 'idle', regenerate: vi.fn() };
  });

  it('shows the banner for a stale pack and Refresh calls regenerate(id)', () => {
    render(<RefreshBanner language={language(0)} />);
    expect(screen.getByTestId('refresh-banner')).toBeInTheDocument();
    screen.getByTestId('refresh-button').click();
    expect(gen.value.regenerate).toHaveBeenCalledWith('l1');
  });

  it('renders nothing when the pack is current and idle', () => {
    const { container } = render(<RefreshBanner language={language(1)} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows the done message when the phase is done', () => {
    gen.value = { phase: 'done', regenerate: vi.fn() };
    render(<RefreshBanner language={language(1)} />);
    expect(screen.getByTestId('refresh-done')).toBeInTheDocument();
  });

  it('disables the button while busy', () => {
    gen.value = { phase: 'running', regenerate: vi.fn() };
    render(<RefreshBanner language={language(0)} />);
    expect(screen.getByTestId('refresh-button')).toBeDisabled();
  });
});
