import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const getUrl = vi.hoisted(() => vi.fn());
vi.mock('aws-amplify/storage', () => ({ getUrl }));

const cache = vi.hoisted(() => ({ getAudio: vi.fn(), putAudio: vi.fn() }));
vi.mock('./audioCache', () => ({ getAudio: cache.getAudio, putAudio: cache.putAudio }));

import { useMediaUrl } from './useMediaUrl';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useMediaUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cache.getAudio.mockResolvedValue(null);
    cache.putAudio.mockResolvedValue(undefined);
    // Stub only createObjectURL — keep the real URL constructor intact.
    URL.createObjectURL = vi.fn(() => 'blob:mock-url');
  });

  it('fetches the presigned URL, caches the bytes, and returns a blob URL', async () => {
    getUrl.mockResolvedValue({ url: new URL('https://s3/media/phrases/x.mp3') });
    const blob = new Blob([new Uint8Array([1])], { type: 'audio/mpeg' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ blob: () => Promise.resolve(blob) }));

    const { result } = renderHook(() => useMediaUrl('media/phrases/x.mp3'), { wrapper });
    await waitFor(() => expect(result.current).toBe('blob:mock-url'));
    expect(cache.putAudio).toHaveBeenCalledWith('media/phrases/x.mp3', blob);
  });

  it('serves a cached blob without touching the network (offline)', async () => {
    cache.getAudio.mockResolvedValue(new Blob([new Uint8Array([2])], { type: 'audio/mpeg' }));
    const { result } = renderHook(() => useMediaUrl('media/phrases/cached.mp3'), { wrapper });
    await waitFor(() => expect(result.current).toBe('blob:mock-url'));
    expect(getUrl).not.toHaveBeenCalled();
  });

  it('falls back to the presigned URL when the byte fetch fails', async () => {
    getUrl.mockResolvedValue({ url: new URL('https://s3/media/phrases/y.mp3') });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const { result } = renderHook(() => useMediaUrl('media/phrases/y.mp3'), { wrapper });
    await waitFor(() => expect(result.current).toBe('https://s3/media/phrases/y.mp3'));
  });

  it('returns null and does not fetch when given no path', () => {
    const { result } = renderHook(() => useMediaUrl(null), { wrapper });
    expect(result.current).toBeNull();
    expect(getUrl).not.toHaveBeenCalled();
  });
});
