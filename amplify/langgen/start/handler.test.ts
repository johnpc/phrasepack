import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Target } from './resolveTarget';

const e = vi.hoisted(() => ({
  getItem: vi.fn(),
  putItem: vi.fn(),
  invokeWorker: vi.fn(),
  resolveGenerate: vi.fn(),
  resolveRegenerate: vi.fn(),
}));
vi.mock('../shared/ddb', () => ({ getItem: e.getItem, putItem: e.putItem }));
vi.mock('./invokeWorker', () => ({ invokeWorker: e.invokeWorker }));
vi.mock('./resolveTarget', () => ({
  resolveGenerate: e.resolveGenerate,
  resolveRegenerate: e.resolveRegenerate,
}));

import { handler } from './handler';

const newTarget: Target = {
  languageId: 'lang-es-es',
  locale: 'es-ES',
  languageName: 'Spanish (Spain)',
  nativeName: 'Español',
  flagEmoji: '🇪🇸',
  kind: 'GENERATE',
  isNew: true,
};
const existingTarget: Target = {
  languageId: 'lang-fr-fr',
  locale: 'fr-FR',
  languageName: 'French',
  kind: 'REGENERATE',
  isNew: false,
};

const makeEvent = (fieldName: string, args: Record<string, unknown>) =>
  ({ info: { fieldName }, arguments: args }) as unknown as Parameters<typeof handler>[0];

describe('langgen starter handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.LANGUAGE_TABLE = 'languages';
    process.env.GENERATION_RUN_TABLE = 'runs';
    process.env.WORKER_FUNCTION_NAME = 'worker-fn';
    e.putItem.mockResolvedValue(undefined);
    e.invokeWorker.mockResolvedValue(undefined);
    e.resolveGenerate.mockResolvedValue(newTarget);
    e.resolveRegenerate.mockResolvedValue(existingTarget);
  });

  it('generateLanguage NEW target writes a DRAFT Language + RUNNING run and invokes the worker', async () => {
    const out = await handler(
      makeEvent('generateLanguage', { locale: 'es-ES', name: 'Spanish (Spain)' }),
      {} as never,
      {} as never,
    );
    expect(out).toEqual({ runId: expect.any(String), languageId: 'lang-es-es' });
    expect(e.resolveGenerate).toHaveBeenCalled();

    const langItem = e.putItem.mock.calls.find((c) => c[0] === 'languages')?.[1];
    const runItem = e.putItem.mock.calls.find((c) => c[0] === 'runs')?.[1];
    expect(langItem).toMatchObject({
      __typename: 'Language',
      status: 'DRAFT',
      name: 'Spanish (Spain)',
      locale: 'es-ES',
    });
    expect(runItem).toMatchObject({
      __typename: 'GenerationRun',
      status: 'RUNNING',
      kind: 'GENERATE',
    });
    expect(e.invokeWorker).toHaveBeenCalledWith(
      'worker-fn',
      expect.objectContaining({ runId: out?.runId, languageId: 'lang-es-es', kind: 'GENERATE' }),
    );
  });

  it('regenerateLanguage does NOT write a Language row but writes the run + invokes the worker', async () => {
    const out = await handler(
      makeEvent('regenerateLanguage', { languageId: 'lang-fr-fr' }),
      {} as never,
      {} as never,
    );
    expect(e.resolveRegenerate).toHaveBeenCalledWith(expect.anything(), 'lang-fr-fr');
    expect(e.putItem.mock.calls.some((c) => c[0] === 'languages')).toBe(false);
    const runItem = e.putItem.mock.calls.find((c) => c[0] === 'runs')?.[1];
    expect(runItem).toMatchObject({ status: 'RUNNING', kind: 'REGENERATE' });
    expect(out).toEqual({ runId: expect.any(String), languageId: 'lang-fr-fr' });
    expect(e.invokeWorker).toHaveBeenCalledWith(
      'worker-fn',
      expect.objectContaining({ kind: 'REGENERATE', languageId: 'lang-fr-fr' }),
    );
  });

  it('defaults to generateLanguage when info.fieldName is absent', async () => {
    await handler(
      { arguments: { locale: 'es-ES', name: 'Spanish' } } as unknown as Parameters<
        typeof handler
      >[0],
      {} as never,
      {} as never,
    );
    expect(e.resolveGenerate).toHaveBeenCalled();
  });

  it('throws when a required env var is missing', async () => {
    delete process.env.LANGUAGE_TABLE;
    await expect(
      handler(
        makeEvent('generateLanguage', { locale: 'es-ES', name: 'Spanish' }),
        {} as never,
        {} as never,
      ),
    ).rejects.toThrow(/LANGUAGE_TABLE not set/);
  });
});
