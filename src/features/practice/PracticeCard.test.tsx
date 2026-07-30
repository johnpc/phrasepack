import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { PhraseRecord } from '../../lib/dataClient';

vi.mock('../../lib/useMediaUrl', () => ({ useMediaUrl: () => null }));
vi.mock('../phrasebook/useSynthesizeAudio', () => ({
  useSynthesizeAudio: () => ({ synthesize: vi.fn(), isSynthesizing: false }),
}));

import { PracticeCard } from './PracticeCard';

const phrase = {
  id: 'a',
  languageId: 'lang-es-es',
  sourceText: 'Thank you',
  translation: 'Gracias',
  phonetic: 'GRAH-syahs',
  audioPath: null,
} as unknown as PhraseRecord;

describe('PracticeCard', () => {
  it('shows the English prompt and hides the answer until revealed', () => {
    render(<PracticeCard phrase={phrase} revealed={false} onReveal={vi.fn()} onGrade={vi.fn()} />);
    expect(screen.getByText('Thank you')).toBeInTheDocument();
    expect(screen.queryByTestId('practice-answer')).not.toBeInTheDocument();
    expect(screen.getByTestId('practice-reveal')).toBeInTheDocument();
  });

  it('reveal button calls onReveal', () => {
    const onReveal = vi.fn();
    render(<PracticeCard phrase={phrase} revealed={false} onReveal={onReveal} onGrade={vi.fn()} />);
    fireEvent.click(screen.getByTestId('practice-reveal'));
    expect(onReveal).toHaveBeenCalledTimes(1);
  });

  it('when revealed, shows the answer and grade buttons call onGrade', () => {
    const onGrade = vi.fn();
    render(<PracticeCard phrase={phrase} revealed onReveal={vi.fn()} onGrade={onGrade} />);
    expect(screen.getByTestId('practice-answer')).toHaveTextContent('Gracias');
    expect(screen.getByText('GRAH-syahs')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('grade-got-it'));
    expect(onGrade).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByTestId('grade-again'));
    expect(onGrade).toHaveBeenCalledWith(false);
  });
});
