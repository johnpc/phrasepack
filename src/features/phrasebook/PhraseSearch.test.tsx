import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhraseSearch } from './PhraseSearch';

describe('PhraseSearch', () => {
  it('reports typed input via onChange', () => {
    const onChange = vi.fn();
    render(<PhraseSearch value="" onChange={onChange} />);
    fireEvent.change(screen.getByTestId('phrase-search'), { target: { value: 'taxi' } });
    expect(onChange).toHaveBeenCalledWith('taxi');
  });

  it('shows a clear button only when there is text, and clears on click', () => {
    const onChange = vi.fn();
    const { rerender } = render(<PhraseSearch value="" onChange={onChange} />);
    expect(screen.queryByTestId('phrase-search-clear')).not.toBeInTheDocument();

    rerender(<PhraseSearch value="taxi" onChange={onChange} />);
    fireEvent.click(screen.getByTestId('phrase-search-clear'));
    expect(onChange).toHaveBeenCalledWith('');
  });
});
