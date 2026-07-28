import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { PhraseRecord } from '../../lib/dataClient';

vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: () => null }));

import { PhraseRow } from './PhraseRow';

function phrase(overrides: Partial<PhraseRecord> = {}): PhraseRecord {
  return {
    id: 'p1',
    translation: 'Hola',
    sourceText: 'Hello',
    phonetic: 'OH-lah',
    audioPath: null,
    ...overrides,
  } as unknown as PhraseRecord;
}

describe('PhraseRow', () => {
  it('renders the translation, source, and phonetic chip', () => {
    render(<PhraseRow phrase={phrase()} />);
    expect(screen.getByTestId('phrase-translation')).toHaveTextContent('Hola');
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByTestId('phrase-phonetic')).toHaveTextContent('OH-lah');
  });

  it('hides the phonetic chip when it is absent', () => {
    render(<PhraseRow phrase={phrase({ phonetic: null })} />);
    expect(screen.queryByTestId('phrase-phonetic')).not.toBeInTheDocument();
  });
});
