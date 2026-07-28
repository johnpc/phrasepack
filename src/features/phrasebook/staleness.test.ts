import { describe, it, expect } from 'vitest';
import { isStale, CURRENT_KEY_VERSION } from './staleness';

describe('isStale', () => {
  it('is stale when the pack version is older than current', () => {
    expect(isStale(0, 1)).toBe(true);
    expect(isStale(1, 2)).toBe(true);
  });

  it('is not stale when equal or newer than current', () => {
    expect(isStale(1, 1)).toBe(false);
    expect(isStale(2, 1)).toBe(false);
  });

  it('treats null/undefined as version 0 (stale when current > 0)', () => {
    expect(isStale(null, 1)).toBe(true);
    expect(isStale(undefined, 1)).toBe(true);
    expect(isStale(null, 0)).toBe(false);
  });

  it('defaults current to CURRENT_KEY_VERSION', () => {
    expect(isStale(CURRENT_KEY_VERSION)).toBe(false);
    expect(isStale(CURRENT_KEY_VERSION - 1)).toBe(true);
  });
});
