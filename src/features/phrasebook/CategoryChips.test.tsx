import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryChips } from './CategoryChips';

const chips = [
  { slug: 'all', label: 'All' },
  { slug: 'greetings', label: 'Greetings' },
];

describe('CategoryChips', () => {
  it('marks the active chip selected and reports clicks', () => {
    const onChange = vi.fn();
    render(<CategoryChips chips={chips} active="all" onChange={onChange} />);
    expect(screen.getByTestId('category-chip-all')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('category-chip-greetings')).toHaveAttribute('aria-selected', 'false');
    screen.getByTestId('category-chip-greetings').click();
    expect(onChange).toHaveBeenCalledWith('greetings');
  });
});
