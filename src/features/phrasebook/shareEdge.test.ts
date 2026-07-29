import { describe, it, expect, vi, afterEach } from 'vitest';
import { sharePack } from './shareEdge';

const payload = { title: 't', text: 'x', url: 'https://x.io/pack/lang-es-es' };

afterEach(() => {
  vi.unstubAllGlobals();
  // Remove any share stub we added (jsdom has none by default).
  delete (navigator as { share?: unknown }).share;
});

describe('sharePack', () => {
  it('uses the native share sheet when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    (navigator as { share?: unknown }).share = share;
    expect(await sharePack(payload)).toBe('shared');
    expect(share).toHaveBeenCalledWith(payload);
  });

  it('reports cancelled when the user dismisses the sheet', async () => {
    (navigator as { share?: unknown }).share = vi
      .fn()
      .mockRejectedValue(new DOMException('user aborted', 'AbortError'));
    expect(await sharePack(payload)).toBe('cancelled');
  });

  it('copies to clipboard when there is no native share', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    expect(await sharePack(payload)).toBe('copied');
    expect(writeText).toHaveBeenCalledWith(payload.url);
  });

  it('falls back to clipboard when a real share error occurs', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      share: vi.fn().mockRejectedValue(new Error('boom')),
      clipboard: { writeText },
    });
    expect(await sharePack(payload)).toBe('copied');
  });

  it('reports failed when neither path works', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    expect(await sharePack(payload)).toBe('failed');
  });
});
