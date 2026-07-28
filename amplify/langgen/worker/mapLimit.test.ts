import { describe, it, expect } from 'vitest';
import { mapLimit } from './mapLimit';

describe('mapLimit', () => {
  it('preserves result order', async () => {
    const out = await mapLimit([1, 2, 3, 4], 2, async (n) => n * 10);
    expect(out).toEqual([10, 20, 30, 40]);
  });

  it('never exceeds the concurrency limit in flight', async () => {
    let inFlight = 0;
    let peak = 0;
    await mapLimit(
      Array.from({ length: 10 }, (_, i) => i),
      3,
      async (n) => {
        inFlight++;
        peak = Math.max(peak, inFlight);
        await new Promise((r) => setTimeout(r, 5));
        inFlight--;
        return n;
      },
    );
    expect(peak).toBeLessThanOrEqual(3);
  });

  it('handles an empty list', async () => {
    expect(await mapLimit([], 4, async (n) => n)).toEqual([]);
  });

  it('caps concurrency at the item count when the limit is larger', async () => {
    let peak = 0;
    let inFlight = 0;
    await mapLimit([1, 2], 10, async (n) => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;
      return n;
    });
    expect(peak).toBeLessThanOrEqual(2);
  });

  it('passes the index to the worker', async () => {
    const out = await mapLimit(['a', 'b'], 1, async (s, i) => `${s}${i}`);
    expect(out).toEqual(['a0', 'b1']);
  });
});
