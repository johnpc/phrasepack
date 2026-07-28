import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ThemeContext } from './ThemeContext';
import { applyTheme, parseThemeMode, THEME_KEY, type ThemeMode } from './theme';

const readStored = (): ThemeMode => {
  try {
    return parseThemeMode(window.localStorage.getItem(THEME_KEY));
  } catch {
    return 'system';
  }
};

/** Holds the theme preference, persists it to localStorage, and applies it to
 * <html> so the light/dark tokens key off it. Defaults to 'system' (follows the
 * OS via the prefers-color-scheme media query). */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStored);

  useEffect(() => {
    applyTheme(mode, document.documentElement);
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* private mode / no storage — the in-memory choice still applies */
    }
  }, []);

  return <ThemeContext.Provider value={{ mode, setMode }}>{children}</ThemeContext.Provider>;
}
