import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PackHeader } from './PackHeader';
import type { LanguageRecord } from '../../lib/dataClient';

const lang = (over: Partial<LanguageRecord> = {}): LanguageRecord =>
  ({
    id: 'lang-es-es',
    name: 'Spanish (Spain)',
    nativeName: 'Español',
    flagEmoji: '🇪🇸',
    phraseCount: 12,
    ...over,
  }) as LanguageRecord;

describe('PackHeader', () => {
  it('renders the flag, name, native name, and phrase count', () => {
    render(<PackHeader language={lang()} />);
    expect(screen.getByTestId('pack-header')).toHaveTextContent('Spanish (Spain)');
    expect(screen.getByTestId('pack-header')).toHaveTextContent('Español · 12 phrases');
    expect(screen.getByText('🇪🇸')).toBeInTheDocument();
  });

  it('falls back to a globe and omits the native prefix when absent', () => {
    render(<PackHeader language={lang({ flagEmoji: null, nativeName: null, phraseCount: 0 })} />);
    expect(screen.getByText('🌐')).toBeInTheDocument();
    expect(screen.getByTestId('pack-header')).toHaveTextContent('0 phrases');
    expect(screen.getByTestId('pack-header')).not.toHaveTextContent('·');
  });
});
