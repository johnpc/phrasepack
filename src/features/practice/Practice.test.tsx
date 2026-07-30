import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { PhraseRecord } from '../../lib/dataClient';

vi.mock('react-router-dom', () => ({ useParams: () => ({ id: 'lang-es-es' }) }));
vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: () => null }));
vi.mock('../phrasebook/useSynthesizeAudio', () => ({
  useSynthesizeAudio: () => ({ synthesize: vi.fn(), isSynthesizing: false }),
}));
vi.mock('../phrasebook/languagesApi', () => ({
  useLanguage: () => ({ data: { id: 'lang-es-es', name: 'Spanish (Spain)' } }),
}));

const phrases = vi.hoisted(() => ({
  value: { data: [], isLoading: false, isError: false } as unknown,
}));
vi.mock('../phrasebook/phrasesApi', () => ({ usePhrases: () => phrases.value }));

import { Practice } from './Practice';

const rows = [
  {
    id: 'a',
    languageId: 'lang-es-es',
    sourceText: 'Hello',
    translation: 'Hola',
    phonetic: 'OH-lah',
  },
  {
    id: 'b',
    languageId: 'lang-es-es',
    sourceText: 'Bye',
    translation: 'Adiós',
    phonetic: 'ah-DYOHS',
  },
] as unknown as PhraseRecord[];

describe('Practice', () => {
  beforeEach(() => {
    phrases.value = { data: rows, isLoading: false, isError: false, refetch: vi.fn() };
  });

  it('runs a full session: reveal → grade both → completion', () => {
    render(<Practice />);
    expect(screen.getByTestId('practice-progress')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('practice-reveal'));
    fireEvent.click(screen.getByTestId('grade-got-it')); // a
    expect(screen.getByText('Bye')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('practice-reveal'));
    fireEvent.click(screen.getByTestId('grade-got-it')); // b

    expect(screen.getByTestId('practice-complete')).toBeInTheDocument();
    expect(screen.getByText(/All 2 phrases practiced/)).toBeInTheDocument();
  });

  it('shows an empty state when the pack has no phrases', () => {
    phrases.value = { data: [], isLoading: false, isError: false, refetch: vi.fn() };
    render(<Practice />);
    expect(screen.getByTestId('load-empty')).toBeInTheDocument();
  });
});
