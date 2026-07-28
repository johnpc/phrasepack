import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { LanguageRecord } from '../../lib/dataClient';
import { LanguageCard } from './LanguageCard';

function language(overrides: Partial<LanguageRecord> = {}): LanguageRecord {
  return {
    id: 'l1',
    name: 'Spanish',
    nativeName: 'Español',
    flagEmoji: '🇪🇸',
    phraseCount: 12,
    keyVersion: 1,
    ...overrides,
  } as unknown as LanguageRecord;
}

describe('LanguageCard', () => {
  it('renders the name, flag, native name and count', () => {
    render(<LanguageCard language={language()} onOpen={vi.fn()} />);
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    expect(screen.getByText('🇪🇸')).toBeInTheDocument();
    expect(screen.getByText(/Español · 12 phrases/)).toBeInTheDocument();
  });

  it('falls back to a globe flag, no native prefix, and 0 phrases when those are absent', () => {
    render(
      <LanguageCard
        language={language({ flagEmoji: null, nativeName: null, phraseCount: null })}
        onOpen={vi.fn()}
      />,
    );
    expect(screen.getByText('🌐')).toBeInTheDocument();
    expect(screen.getByText(/0 phrases/)).toBeInTheDocument();
  });

  it('shows the new-phrases badge when the pack is stale', () => {
    render(<LanguageCard language={language({ keyVersion: 0 })} onOpen={vi.fn()} />);
    expect(screen.getByTestId('new-phrases-badge')).toBeInTheDocument();
  });

  it('hides the badge when the pack is current', () => {
    render(<LanguageCard language={language({ keyVersion: 1 })} onOpen={vi.fn()} />);
    expect(screen.queryByTestId('new-phrases-badge')).not.toBeInTheDocument();
  });

  it('calls onOpen with the id when clicked', () => {
    const onOpen = vi.fn();
    render(<LanguageCard language={language()} onOpen={onOpen} />);
    screen.getByTestId('language-card').click();
    expect(onOpen).toHaveBeenCalledWith('l1');
  });
});
