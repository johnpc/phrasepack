import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LanguageRecord } from '../../lib/dataClient';

const history = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock('react-router-dom', () => ({ useHistory: () => history }));

const existing = vi.hoisted(() => ({
  value: {
    data: [] as LanguageRecord[],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
}));
vi.mock('./languagesApi', () => ({ usePublishedLanguages: () => existing.value }));

const gen = vi.hoisted(() => ({
  value: { phase: 'idle' as string, languageId: null as string | null, generate: vi.fn() },
}));
vi.mock('./useGenerate', () => ({ useGenerate: () => gen.value }));

import { AddLanguage } from './AddLanguage';

describe('AddLanguage', () => {
  beforeEach(() => {
    history.replace.mockClear();
    existing.value = { data: [], isLoading: false, isError: false, refetch: vi.fn() };
    gen.value = { phase: 'idle', languageId: null, generate: vi.fn() };
  });

  it('offers the catalog choices and picking one starts generation', () => {
    render(<AddLanguage />);
    const list = screen.getByTestId('catalog-list');
    expect(list).toBeInTheDocument();
    const choices = screen.getAllByTestId('catalog-choice');
    expect(choices.length).toBeGreaterThan(0);
    choices[0].click();
    expect(gen.value.generate).toHaveBeenCalledTimes(1);
  });

  it('switches to browse-by-destination and picking a country starts generation', () => {
    render(<AddLanguage />);
    fireEvent.click(screen.getByTestId('mode-destination'));
    const destinations = screen.getAllByTestId('destination-choice');
    expect(destinations.length).toBeGreaterThan(0);
    expect(screen.queryByTestId('catalog-list')).not.toBeInTheDocument();
    destinations[0].click();
    expect(gen.value.generate).toHaveBeenCalledTimes(1);
  });

  it('shows the "all caught up" empty state when nothing is left to generate', () => {
    // Present every catalog locale so availableToGenerate returns [].
    existing.value = {
      data: [
        'es-ES',
        'es-MX',
        'fr-FR',
        'de-DE',
        'it-IT',
        'pt-BR',
        'pt-PT',
        'nl-NL',
        'pl-PL',
        'sv-SE',
        'da-DK',
        'nb-NO',
        'tr-TR',
        'ru-RU',
        'ja-JP',
        'ko-KR',
        'cmn-CN',
        'hi-IN',
        'ar-AE',
      ].map((locale) => ({ locale }) as unknown as LanguageRecord),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    render(<AddLanguage />);
    expect(screen.getByTestId('load-empty')).toBeInTheDocument();
  });

  it('shows generation progress while running', () => {
    gen.value = { phase: 'running', languageId: null, generate: vi.fn() };
    render(<AddLanguage />);
    expect(screen.getByTestId('generate-progress')).toBeInTheDocument();
  });

  it('shows the error state and Retry calls refetch', () => {
    const refetch = vi.fn();
    existing.value = { data: [], isLoading: false, isError: true, refetch };
    render(<AddLanguage />);
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
    screen.getByTestId('load-retry').click();
    expect(refetch).toHaveBeenCalled();
  });

  it('the failed phase offers a retry that routes back to /add', () => {
    gen.value = { phase: 'failed', languageId: null, generate: vi.fn() };
    render(<AddLanguage />);
    screen.getByText('Try again').click();
    expect(history.replace).toHaveBeenCalledWith('/add');
  });

  it('navigates to the new pack when generation is done', () => {
    gen.value = { phase: 'done', languageId: 'l9', generate: vi.fn() };
    render(<AddLanguage />);
    expect(history.replace).toHaveBeenCalledWith('/pack/l9');
  });
});
