import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

const theme = vi.hoisted(() => ({ mode: 'system' as string, setMode: vi.fn() }));
vi.mock('./useTheme', () => ({ useTheme: () => theme }));

import { Settings } from './Settings';

describe('Settings', () => {
  it('renders a radio for each theme option', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('theme-group')).toBeInTheDocument();
    expect(screen.getByTestId('theme-system')).toBeInTheDocument();
    expect(screen.getByTestId('theme-light')).toBeInTheDocument();
    expect(screen.getByTestId('theme-dark')).toBeInTheDocument();
  });

  it('picking an option calls setMode with the chosen value', () => {
    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );
    fireEvent(
      screen.getByTestId('theme-group'),
      new CustomEvent('ionChange', { detail: { value: 'dark' } }),
    );
    expect(theme.setMode).toHaveBeenCalledWith('dark');
  });
});
