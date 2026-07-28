import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const m = vi.hoisted(() => ({ listByLang: vi.fn() }));
vi.mock('../../lib/dataClient', () => ({
  dataClient: { models: { Phrase: { listPhraseByLanguageIdAndOrd: m.listByLang } } },
  unwrap: (r: { data: unknown; errors?: { message: string }[] }) => {
    if (r.errors?.length) throw new Error(r.errors.map((e) => e.message).join('; '));
    return r.data;
  },
}));

import { usePhrases } from './phrasesApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('usePhrases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('paginates via nextToken and concatenates pages', async () => {
    m.listByLang
      .mockResolvedValueOnce({ data: [{ id: 'p1' }], nextToken: 'tok' })
      .mockResolvedValueOnce({ data: [{ id: 'p2' }], nextToken: null });
    const { result } = renderHook(() => usePhrases('lang-1'), { wrapper });
    await waitFor(() => expect(result.current.data?.map((p) => p.id)).toEqual(['p1', 'p2']));
    expect(m.listByLang).toHaveBeenCalledTimes(2);
    expect(m.listByLang).toHaveBeenNthCalledWith(
      1,
      { languageId: 'lang-1' },
      { limit: 200, nextToken: undefined },
    );
    expect(m.listByLang).toHaveBeenNthCalledWith(
      2,
      { languageId: 'lang-1' },
      { limit: 200, nextToken: 'tok' },
    );
  });

  it('is disabled when languageId is undefined', () => {
    const { result } = renderHook(() => usePhrases(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(m.listByLang).not.toHaveBeenCalled();
  });
});
