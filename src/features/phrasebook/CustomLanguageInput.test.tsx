import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomLanguageInput } from './CustomLanguageInput';

describe('CustomLanguageInput', () => {
  it('disables generate until a valid name is typed', () => {
    render(<CustomLanguageInput onGenerate={vi.fn()} />);
    const btn = screen.getByTestId('custom-language-generate');
    expect(btn).toBeDisabled();
    fireEvent.change(screen.getByTestId('custom-language-input'), { target: { value: 'Swahili' } });
    expect(btn).toBeEnabled();
  });

  it('submits a custom request built from the typed name', () => {
    const onGenerate = vi.fn();
    render(<CustomLanguageInput onGenerate={onGenerate} />);
    fireEvent.change(screen.getByTestId('custom-language-input'), { target: { value: 'Swahili' } });
    fireEvent.submit(screen.getByTestId('custom-language'));
    expect(onGenerate).toHaveBeenCalledWith(
      expect.objectContaining({ locale: 'x-swahili', name: 'Swahili' }),
    );
  });

  it('reuses the catalog entry when the name matches a known language', () => {
    const onGenerate = vi.fn();
    render(<CustomLanguageInput onGenerate={onGenerate} />);
    fireEvent.change(screen.getByTestId('custom-language-input'), { target: { value: 'french' } });
    fireEvent.submit(screen.getByTestId('custom-language'));
    expect(onGenerate).toHaveBeenCalledWith(expect.objectContaining({ locale: 'fr-FR' }));
  });
});
