import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({ generate: vi.fn(), regenerate: vi.fn(), get: vi.fn() }));
vi.mock('../../lib/dataClient', () => ({
  dataClient: {
    mutations: { generateLanguage: m.generate, regenerateLanguage: m.regenerate },
    models: { GenerationRun: { get: m.get } },
  },
  unwrap: (r: { data: unknown; errors?: { message: string }[] }) => {
    if (r.errors?.length) throw new Error(r.errors.map((e) => e.message).join('; '));
    return r.data;
  },
}));

import { generateLanguage, regenerateLanguage, getGenerationRun } from './generateApi';

describe('generateApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('generateLanguage returns the run + language ids', async () => {
    m.generate.mockResolvedValue({ data: { runId: 'r1', languageId: 'l1' }, errors: null });
    expect(await generateLanguage({ locale: 'es-ES', name: 'Spanish' })).toEqual({
      runId: 'r1',
      languageId: 'l1',
    });
    expect(m.generate).toHaveBeenCalledWith({ locale: 'es-ES', name: 'Spanish' });
  });

  it('generateLanguage throws on error', async () => {
    m.generate.mockResolvedValue({ data: null, errors: [{ message: 'denied' }] });
    await expect(generateLanguage({ locale: 'es-ES', name: 'Spanish' })).rejects.toThrow('denied');
  });

  it('generateLanguage throws when there is no data', async () => {
    m.generate.mockResolvedValue({ data: null, errors: null });
    await expect(generateLanguage({ locale: 'es-ES', name: 'Spanish' })).rejects.toThrow(
      'Failed to start generation.',
    );
  });

  it('regenerateLanguage returns the run + language ids', async () => {
    m.regenerate.mockResolvedValue({ data: { runId: 'r2', languageId: 'l2' }, errors: null });
    expect(await regenerateLanguage('l2')).toEqual({ runId: 'r2', languageId: 'l2' });
    expect(m.regenerate).toHaveBeenCalledWith({ languageId: 'l2' });
  });

  it('regenerateLanguage throws when there is no data', async () => {
    m.regenerate.mockResolvedValue({ data: null, errors: null });
    await expect(regenerateLanguage('l2')).rejects.toThrow('Failed to start refresh.');
  });

  it('getGenerationRun unwraps the run', async () => {
    m.get.mockResolvedValue({ data: { id: 'r1', status: 'RUNNING' } });
    expect(await getGenerationRun('r1')).toEqual({ id: 'r1', status: 'RUNNING' });
    expect(m.get).toHaveBeenCalledWith({ id: 'r1' });
  });

  it('getGenerationRun throws on GraphQL errors', async () => {
    m.get.mockResolvedValue({ data: null, errors: [{ message: 'nope' }] });
    await expect(getGenerationRun('r1')).rejects.toThrow('nope');
  });
});
