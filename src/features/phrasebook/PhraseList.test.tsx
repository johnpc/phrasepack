import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PhraseList } from './PhraseList';
import type { PhraseRecord } from '../../lib/dataClient';

// PhraseRow → PlayButton → useMediaUrl uses react-query, so wrap in a client.
const renderList = (phrases: PhraseRecord[]) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <PhraseList languageId="lang-es-es" phrases={phrases} />
    </QueryClientProvider>,
  );

const p = (over: Partial<PhraseRecord>): PhraseRecord =>
  ({
    id: over.sourceText,
    phraseKeySlug: over.sourceText,
    ord: 0,
    categorySlug: 'transport',
    phonetic: '',
    ...over,
  }) as PhraseRecord;

const rows = [
  p({
    sourceText: 'I need a taxi',
    translation: 'Necesito un taxi',
    categorySlug: 'transport',
    ord: 0,
  }),
  p({ sourceText: 'Thank you', translation: 'Gracias', categorySlug: 'courtesy', ord: 1 }),
];

describe('PhraseList', () => {
  it('renders all phrases grouped into sections by default', () => {
    renderList(rows);
    expect(screen.getByTestId('phrase-sections')).toBeInTheDocument();
    expect(screen.getByText('Necesito un taxi')).toBeInTheDocument();
    expect(screen.getByText('Gracias')).toBeInTheDocument();
  });

  it('filters to matching phrases as you type', () => {
    renderList(rows);
    fireEvent.change(screen.getByTestId('phrase-search'), { target: { value: 'taxi' } });
    expect(screen.getByText('Necesito un taxi')).toBeInTheDocument();
    expect(screen.queryByText('Gracias')).not.toBeInTheDocument();
  });

  it('shows a distinct no-match state when nothing matches', () => {
    renderList(rows);
    fireEvent.change(screen.getByTestId('phrase-search'), { target: { value: 'zzz' } });
    expect(screen.getByTestId('search-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('phrase-sections')).not.toBeInTheDocument();
  });
});
