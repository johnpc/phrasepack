import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GenerateProgress } from './GenerateProgress';

describe('GenerateProgress', () => {
  it('shows progress while running', () => {
    render(<GenerateProgress phase="running" onRetry={vi.fn()} />);
    expect(screen.getByTestId('generate-progress')).toBeInTheDocument();
  });

  it('shows progress while starting', () => {
    render(<GenerateProgress phase="starting" onRetry={vi.fn()} />);
    expect(screen.getByTestId('generate-progress')).toBeInTheDocument();
  });

  it('names the language and shows its flag when provided', () => {
    render(
      <GenerateProgress phase="running" languageName="German" flagEmoji="🇩🇪" onRetry={vi.fn()} />,
    );
    expect(screen.getByTestId('generate-progress')).toHaveTextContent(
      'Building your German phrasebook',
    );
    expect(screen.getByText('🇩🇪')).toBeInTheDocument();
  });

  it('shows a failure alert and Try again calls onRetry', () => {
    const onRetry = vi.fn();
    render(<GenerateProgress phase="failed" onRetry={onRetry} />);
    expect(screen.getByTestId('generate-failed')).toBeInTheDocument();
    screen.getByText('Try again').click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
