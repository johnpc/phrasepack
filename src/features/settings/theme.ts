/**
 * Pure theme helpers (unit-testable, no React). A theme preference is one of
 * three modes; 'system' follows the OS (we simply remove the override attribute
 * and let the prefers-color-scheme media query in variables.css decide), while
 * 'light'/'dark' set an explicit data-theme on <html> that wins over the OS.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_KEY = 'pp-theme';
const MODES: ThemeMode[] = ['light', 'dark', 'system'];

/** Coerce an arbitrary stored value to a valid mode ('system' default). */
export function parseThemeMode(value: string | null): ThemeMode {
  return MODES.includes(value as ThemeMode) ? (value as ThemeMode) : 'system';
}

/** The data-theme attribute value for a mode ('system' → null = remove it). */
export function themeAttr(mode: ThemeMode): string | null {
  return mode === 'system' ? null : mode;
}

/** Apply a mode to the document root: set/remove data-theme. Guards against a
 * missing document (SSR/tests without a DOM). */
export function applyTheme(mode: ThemeMode, root: HTMLElement | null): void {
  if (!root) return;
  const attr = themeAttr(mode);
  if (attr) root.setAttribute('data-theme', attr);
  else root.removeAttribute('data-theme');
}
