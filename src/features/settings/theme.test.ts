import { describe, it, expect } from 'vitest';
import { parseThemeMode, themeAttr, applyTheme } from './theme';

describe('parseThemeMode', () => {
  it('passes through each valid mode', () => {
    expect(parseThemeMode('light')).toBe('light');
    expect(parseThemeMode('dark')).toBe('dark');
    expect(parseThemeMode('system')).toBe('system');
  });

  it('coerces garbage and null to system', () => {
    expect(parseThemeMode('purple')).toBe('system');
    expect(parseThemeMode('')).toBe('system');
    expect(parseThemeMode(null)).toBe('system');
  });
});

describe('themeAttr', () => {
  it('maps system to null (remove the override)', () => {
    expect(themeAttr('system')).toBeNull();
  });

  it('returns the mode for explicit light/dark', () => {
    expect(themeAttr('light')).toBe('light');
    expect(themeAttr('dark')).toBe('dark');
  });
});

describe('applyTheme', () => {
  it('sets data-theme for light and dark', () => {
    const root = document.createElement('html');
    applyTheme('light', root);
    expect(root.getAttribute('data-theme')).toBe('light');
    applyTheme('dark', root);
    expect(root.getAttribute('data-theme')).toBe('dark');
  });

  it('removes data-theme for system', () => {
    const root = document.createElement('html');
    root.setAttribute('data-theme', 'dark');
    applyTheme('system', root);
    expect(root.hasAttribute('data-theme')).toBe(false);
  });

  it('is a no-op when the root is null', () => {
    expect(() => applyTheme('dark', null)).not.toThrow();
  });
});
