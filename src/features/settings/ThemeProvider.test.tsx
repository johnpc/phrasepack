import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';
import { THEME_KEY } from './theme';

function Probe() {
  const { mode, setMode } = useTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <button onClick={() => setMode('dark')}>dark</button>
      <button onClick={() => setMode('system')}>system</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );

describe('ThemeProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to system and applies no override', () => {
    renderProbe();
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
  });

  it('reads the persisted preference on mount', () => {
    window.localStorage.setItem(THEME_KEY, 'dark');
    renderProbe();
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
  });

  it('setMode updates state, persists, and sets data-theme on the document', () => {
    renderProbe();
    act(() => void screen.getByText('dark').click());
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(window.localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setMode back to system removes the override', () => {
    renderProbe();
    act(() => void screen.getByText('dark').click());
    act(() => void screen.getByText('system').click());
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(window.localStorage.getItem(THEME_KEY)).toBe('system');
  });
});

describe('useTheme', () => {
  it('throws when used outside a ThemeProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/within a ThemeProvider/);
    spy.mockRestore();
  });
});
