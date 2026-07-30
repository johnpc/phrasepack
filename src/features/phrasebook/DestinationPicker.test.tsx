import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const langs = vi.hoisted(() => ({
  value: { data: [], isLoading: false, isError: false } as unknown,
}));
vi.mock('./languagesApi', () => ({ usePublishedLanguages: () => langs.value }));

import { DestinationPicker } from './DestinationPicker';

describe('DestinationPicker', () => {
  beforeEach(() => {
    langs.value = { data: [], isLoading: false, isError: false, refetch: vi.fn() };
  });

  it('offers country cards labelled with their language, and generates that language', () => {
    const onGenerate = vi.fn();
    render(<DestinationPicker onGenerate={onGenerate} />);
    const card = screen
      .getAllByTestId('destination-choice')
      .find((el) => el.getAttribute('data-country') === 'Japan');
    expect(card).toBeDefined();
    expect(card).toHaveTextContent('Japan');
    expect(card).toHaveTextContent('Japanese');
    card!.click();
    expect(onGenerate).toHaveBeenCalledWith(expect.objectContaining({ locale: 'ja-JP' }));
  });

  it('shows the covered state when every destination language exists', () => {
    // Every catalog locale generated → no destinations to offer.
    langs.value = {
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
        'ja-JP',
        'ko-KR',
        'cmn-CN',
        'hi-IN',
        'ar-AE',
      ].map((locale) => ({ locale })),
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    render(<DestinationPicker onGenerate={vi.fn()} />);
    expect(screen.getByText(/You.re covered/)).toBeInTheDocument();
  });
});
