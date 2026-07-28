import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const m = vi.hoisted(() => ({ list: vi.fn(), get: vi.fn() }));
vi.mock('../../lib/dataClient', () => ({
  dataClient: { models: { Language: { list: m.list, get: m.get } } },
  unwrap: (r: { data: unknown; errors?: { message: string }[] }) => {
    if (r.errors?.length) throw new Error(r.errors.map((e) => e.message).join('; '));
    return r.data;
  },
}));

import { usePublishedLanguages, useLanguage } from './languagesApi';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('usePublishedLanguages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters to PUBLISHED and sorts by publishedAt desc', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: 'a', publishedAt: '2026-01-01' },
        { id: 'b', publishedAt: '2026-03-01' },
      ],
    });
    const { result } = renderHook(() => usePublishedLanguages(), { wrapper });
    await waitFor(() => expect(result.current.data?.map((l) => l.id)).toEqual(['b', 'a']));
    expect(m.list).toHaveBeenCalledWith(
      expect.objectContaining({ filter: { status: { eq: 'PUBLISHED' } }, limit: 200 }),
    );
  });

  it('sorts rows with a missing publishedAt last (nullish coalesces to empty)', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: 'a', publishedAt: null },
        { id: 'b', publishedAt: '2026-03-01' },
      ],
    });
    const { result } = renderHook(() => usePublishedLanguages(), { wrapper });
    await waitFor(() => expect(result.current.data?.map((l) => l.id)).toEqual(['b', 'a']));
  });

  it('sorts when the newer row is missing publishedAt (both nullish sides)', async () => {
    m.list.mockResolvedValue({
      data: [
        { id: 'a', publishedAt: '2026-03-01' },
        { id: 'b', publishedAt: null },
      ],
    });
    const { result } = renderHook(() => usePublishedLanguages(), { wrapper });
    await waitFor(() => expect(result.current.data?.map((l) => l.id)).toEqual(['a', 'b']));
  });

  it('surfaces GraphQL errors (no false empty)', async () => {
    m.list.mockResolvedValue({ data: [], errors: [{ message: 'down' }] });
    const { result } = renderHook(() => usePublishedLanguages(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the row for an id', async () => {
    m.get.mockResolvedValue({ data: { id: 'x', name: 'Spanish' } });
    const { result } = renderHook(() => useLanguage('x'), { wrapper });
    await waitFor(() => expect(result.current.data?.id).toBe('x'));
    expect(m.get).toHaveBeenCalledWith({ id: 'x' });
  });

  it('is disabled when id is undefined', () => {
    const { result } = renderHook(() => useLanguage(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(m.get).not.toHaveBeenCalled();
  });
});
