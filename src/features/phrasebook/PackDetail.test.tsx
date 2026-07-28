import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LanguageRecord, PhraseRecord } from '../../lib/dataClient';

vi.mock('react-router-dom', () => ({ useParams: () => ({ id: 'l1' }) }));
vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: () => null }));
vi.mock('./RefreshBanner', () => ({ RefreshBanner: () => <div data-testid="refresh" /> }));

const lang = vi.hoisted(() => ({
  value: { data: undefined as LanguageRecord | null | undefined },
}));
const phrases = vi.hoisted(() => ({
  value: {
    data: [] as PhraseRecord[],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
}));
vi.mock('./languagesApi', () => ({ useLanguage: () => lang.value }));
vi.mock('./phrasesApi', () => ({ usePhrases: () => phrases.value }));

import { PackDetail } from './PackDetail';

describe('PackDetail', () => {
  beforeEach(() => {
    lang.value = {
      data: {
        id: 'l1',
        name: 'Spanish',
        flagEmoji: '🇪🇸',
        keyVersion: 1,
      } as unknown as LanguageRecord,
    };
    phrases.value = { data: [], isLoading: false, isError: false, refetch: vi.fn() };
  });

  it('shows the empty state when there are no phrases', () => {
    render(<PackDetail />);
    expect(screen.getByTestId('load-empty')).toBeInTheDocument();
  });

  it('renders grouped phrase sections and the header title', () => {
    phrases.value = {
      data: [
        {
          id: 'p1',
          categorySlug: 'basics',
          ord: 0,
          translation: 'Hola',
          sourceText: 'Hello',
          phonetic: null,
          audioPath: null,
        } as unknown as PhraseRecord,
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    render(<PackDetail />);
    expect(screen.getByTestId('phrase-sections')).toBeInTheDocument();
    expect(screen.getByTestId('phrase-translation')).toHaveTextContent('Hola');
  });

  it('shows the error state and Retry calls refetch', () => {
    const refetch = vi.fn();
    phrases.value = { data: [], isLoading: false, isError: true, refetch };
    render(<PackDetail />);
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
    screen.getByTestId('load-retry').click();
    expect(refetch).toHaveBeenCalled();
  });

  it('falls back to a default title when the language has not loaded', () => {
    lang.value = { data: null };
    render(<PackDetail />);
    expect(screen.getByText('Pack')).toBeInTheDocument();
  });
});
