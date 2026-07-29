import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { PhraseRecord } from '../../lib/dataClient';

vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: () => null }));

import { ShowPhrase } from './ShowPhrase';

const phrase = (over: Partial<PhraseRecord> = {}): PhraseRecord =>
  ({
    id: 'p1',
    translation: 'La cuenta, por favor',
    sourceText: 'The check, please',
    phonetic: 'lah KWEN-tah',
    audioPath: null,
    ...over,
  }) as PhraseRecord;

describe('ShowPhrase', () => {
  it('renders the translation big, plus phonetic and source', () => {
    render(<ShowPhrase phrase={phrase()} onClose={vi.fn()} />);
    expect(screen.getByTestId('show-translation')).toHaveTextContent('La cuenta, por favor');
    expect(screen.getByText('lah KWEN-tah')).toBeInTheDocument();
    expect(screen.getByText('The check, please')).toBeInTheDocument();
  });

  it('omits the phonetic line when absent', () => {
    render(<ShowPhrase phrase={phrase({ phonetic: null })} onClose={vi.fn()} />);
    expect(screen.queryByText('lah KWEN-tah')).not.toBeInTheDocument();
  });

  it('closes on backdrop click but not on content click', () => {
    const onClose = vi.fn();
    render(<ShowPhrase phrase={phrase()} onClose={onClose} />);
    fireEvent.click(screen.getByTestId('show-translation'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId('show-phrase'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<ShowPhrase phrase={phrase()} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
