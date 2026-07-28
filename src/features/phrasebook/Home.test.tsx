import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LanguageRecord } from '../../lib/dataClient';

const history = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('react-router-dom', () => ({ useHistory: () => history }));

const langs = vi.hoisted(() => ({
  value: {
    data: undefined as LanguageRecord[] | undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  },
}));
vi.mock('./languagesApi', () => ({ usePublishedLanguages: () => langs.value }));

import { Home } from './Home';

describe('Home', () => {
  beforeEach(() => {
    history.push.mockClear();
    langs.value = { data: [], isLoading: false, isError: false, refetch: vi.fn() };
  });

  it('renders the empty state when there are no packs', () => {
    render(<Home />);
    expect(screen.getByTestId('load-empty')).toBeInTheDocument();
  });

  it('lists a card per pack and Add routes to /add', () => {
    langs.value = {
      data: [{ id: 'l1', name: 'Spanish', keyVersion: 1 } as unknown as LanguageRecord],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    render(<Home />);
    expect(screen.getByTestId('language-list')).toBeInTheDocument();
    expect(screen.getByText('Spanish')).toBeInTheDocument();
    screen.getByTestId('add-language').click();
    expect(history.push).toHaveBeenCalledWith('/add');
  });

  it('opening a card routes to that pack', () => {
    langs.value = {
      data: [{ id: 'l1', name: 'Spanish', keyVersion: 1 } as unknown as LanguageRecord],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    };
    render(<Home />);
    screen.getByTestId('language-card').click();
    expect(history.push).toHaveBeenCalledWith('/pack/l1');
  });

  it('shows the error state and Retry calls refetch', () => {
    const refetch = vi.fn();
    langs.value = { data: undefined, isLoading: false, isError: true, refetch };
    render(<Home />);
    expect(screen.getByTestId('load-error')).toBeInTheDocument();
    screen.getByTestId('load-retry').click();
    expect(refetch).toHaveBeenCalled();
  });

  it('the settings button routes to /settings', () => {
    render(<Home />);
    screen.getByLabelText('Settings').click();
    expect(history.push).toHaveBeenCalledWith('/settings');
  });
});
