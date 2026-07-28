import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoadState } from './LoadState';

describe('LoadState', () => {
  it('renders the error state and Retry calls onRetry', () => {
    const onRetry = vi.fn();
    render(
      <LoadState isLoading={false} isError onRetry={onRetry}>
        <div>content</div>
      </LoadState>,
    );
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
    screen.getByTestId('load-retry').click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('error takes priority over empty', () => {
    render(
      <LoadState isLoading={false} isError isEmpty>
        <div>content</div>
      </LoadState>,
    );
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
    expect(screen.queryByTestId('load-empty')).not.toBeInTheDocument();
  });

  it('omits the Retry button when onRetry is not provided', () => {
    render(
      <LoadState isLoading={false} isError>
        <div>content</div>
      </LoadState>,
    );
    expect(screen.queryByTestId('load-retry')).not.toBeInTheDocument();
  });

  it('renders the loading spinner', () => {
    render(
      <LoadState isLoading>
        <div>content</div>
      </LoadState>,
    );
    expect(screen.getByTestId('load-spinner')).toBeInTheDocument();
  });

  it('renders a distinct empty state with the given title and message', () => {
    render(
      <LoadState isLoading={false} isEmpty emptyTitle="Nothing" emptyMessage="add one">
        <div>content</div>
      </LoadState>,
    );
    expect(screen.getByTestId('load-empty')).toBeInTheDocument();
    expect(screen.getByText('Nothing')).toBeInTheDocument();
    expect(screen.getByText('add one')).toBeInTheDocument();
  });

  it('renders children when ready', () => {
    render(
      <LoadState isLoading={false}>
        <div>content</div>
      </LoadState>,
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });
});
