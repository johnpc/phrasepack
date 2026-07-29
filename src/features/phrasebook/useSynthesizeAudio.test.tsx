import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const e = vi.hoisted(() => ({ synthesizePhraseAudio: vi.fn() }));
vi.mock('./generateApi', () => ({ synthesizePhraseAudio: e.synthesizePhraseAudio }));

import { useSynthesizeAudio } from './useSynthesizeAudio';

const wrapper = (qc: QueryClient) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };

describe('useSynthesizeAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('synthesizes and invalidates the pack phrase list on success', async () => {
    e.synthesizePhraseAudio.mockResolvedValue('media/phrases/lang-es-es/p1.mp3');
    const qc = new QueryClient();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useSynthesizeAudio('lang-es-es'), { wrapper: wrapper(qc) });

    const path = await result.current.synthesize('p1');
    expect(path).toBe('media/phrases/lang-es-es/p1.mp3');
    expect(e.synthesizePhraseAudio).toHaveBeenCalledWith('p1');
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['phrases', 'lang-es-es'] }),
    );
  });

  it('does not invalidate when the path is empty (no voice for the language)', async () => {
    e.synthesizePhraseAudio.mockResolvedValue('');
    const qc = new QueryClient();
    const invalidate = vi.spyOn(qc, 'invalidateQueries');
    const { result } = renderHook(() => useSynthesizeAudio('lang-x-swahili'), {
      wrapper: wrapper(qc),
    });

    await result.current.synthesize('p2');
    expect(invalidate).not.toHaveBeenCalled();
  });
});
