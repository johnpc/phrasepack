import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

const api = vi.hoisted(() => ({
  generateLanguage: vi.fn(),
  regenerateLanguage: vi.fn(),
  getGenerationRun: vi.fn(),
}));
vi.mock('./generateApi', () => api);

import { useGenerate } from './useGenerate';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useGenerate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts idle', () => {
    const { result } = renderHook(() => useGenerate(), { wrapper });
    expect(result.current.phase).toBe('idle');
    expect(result.current.languageId).toBeNull();
  });

  it('runs then completes: generate → running → done, exposing languageId', async () => {
    api.generateLanguage.mockResolvedValue({ runId: 'r1', languageId: 'l1' });
    api.getGenerationRun
      .mockResolvedValueOnce({ status: 'RUNNING', languageId: 'l1' })
      .mockResolvedValue({ status: 'DRAFT_READY', languageId: 'l1' });
    const { result } = renderHook(() => useGenerate(), { wrapper });

    act(() => result.current.generate({ locale: 'es-ES', name: 'Spanish' }));
    await waitFor(() => expect(result.current.phase).toBe('done'), { timeout: 10000 });
    expect(result.current.languageId).toBe('l1');
  });

  it('exposes the mutation languageId immediately (before the run resolves)', async () => {
    api.generateLanguage.mockResolvedValue({ runId: 'r1', languageId: 'l9' });
    api.getGenerationRun.mockResolvedValue({ status: 'RUNNING', languageId: 'l9' });
    const { result } = renderHook(() => useGenerate(), { wrapper });
    act(() => result.current.generate({ locale: 'es-ES', name: 'Spanish' }));
    await waitFor(() => expect(result.current.phase).toBe('running'));
    expect(result.current.languageId).toBe('l9');
  });

  it('marks failed when the run reports FAILED', async () => {
    api.generateLanguage.mockResolvedValue({ runId: 'r1', languageId: 'l1' });
    api.getGenerationRun.mockResolvedValue({ status: 'FAILED', languageId: 'l1' });
    const { result } = renderHook(() => useGenerate(), { wrapper });
    act(() => result.current.generate({ locale: 'es-ES', name: 'Spanish' }));
    await waitFor(() => expect(result.current.phase).toBe('failed'), { timeout: 10000 });
  });

  it('marks failed when the start mutation rejects', async () => {
    api.generateLanguage.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useGenerate(), { wrapper });
    act(() => result.current.generate({ locale: 'es-ES', name: 'Spanish' }));
    await waitFor(() => expect(result.current.phase).toBe('failed'));
  });

  it('regenerate drives the same machine to done', async () => {
    api.regenerateLanguage.mockResolvedValue({ runId: 'r2', languageId: 'l2' });
    api.getGenerationRun.mockResolvedValue({ status: 'DRAFT_READY', languageId: 'l2' });
    const { result } = renderHook(() => useGenerate(), { wrapper });
    act(() => result.current.regenerate('l2'));
    await waitFor(() => expect(result.current.phase).toBe('done'), { timeout: 10000 });
    expect(api.regenerateLanguage).toHaveBeenCalledWith('l2');
  });

  it('reset returns to idle', async () => {
    api.generateLanguage.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useGenerate(), { wrapper });
    act(() => result.current.generate({ locale: 'es-ES', name: 'Spanish' }));
    await waitFor(() => expect(result.current.phase).toBe('failed'));
    act(() => result.current.reset());
    expect(result.current.phase).toBe('idle');
  });
});
