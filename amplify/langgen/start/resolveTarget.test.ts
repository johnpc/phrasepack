import { describe, it, expect, vi } from 'vitest';
import { resolveGenerate, resolveRegenerate, type ResolveDeps } from './resolveTarget';

const deps = (row: Record<string, unknown> | null): ResolveDeps => ({
  getLanguage: vi.fn().mockResolvedValue(row),
});

describe('resolveGenerate', () => {
  it('creates a fresh GENERATE target with a deterministic id when no pack exists', async () => {
    const target = await resolveGenerate(deps(null), {
      locale: 'es-ES',
      name: 'Spanish (Spain)',
      nativeName: 'Español',
      flagEmoji: '🇪🇸',
    });
    expect(target).toEqual({
      languageId: 'lang-es-es',
      locale: 'es-ES',
      languageName: 'Spanish (Spain)',
      nativeName: 'Español',
      flagEmoji: '🇪🇸',
      kind: 'GENERATE',
      isNew: true,
    });
  });

  it('coerces null optional args to undefined', async () => {
    const target = await resolveGenerate(deps(null), {
      locale: 'fr-FR',
      name: 'French',
      nativeName: null,
      flagEmoji: null,
    });
    expect(target.nativeName).toBeUndefined();
    expect(target.flagEmoji).toBeUndefined();
    expect(target.isNew).toBe(true);
  });

  it('reuses an existing pack as a REGENERATE target (isNew false)', async () => {
    const target = await resolveGenerate(
      deps({ id: 'lang-es-es', locale: 'es-ES', name: 'Spanish' }),
      { locale: 'es-ES', name: 'ignored' },
    );
    expect(target).toEqual({
      languageId: 'lang-es-es',
      locale: 'es-ES',
      languageName: 'Spanish',
      kind: 'REGENERATE',
      isNew: false,
    });
  });
});

describe('resolveRegenerate', () => {
  it('returns a REGENERATE target for an existing pack', async () => {
    const target = await resolveRegenerate(
      deps({ id: 'lang-fr-fr', locale: 'fr-FR', name: 'French' }),
      'lang-fr-fr',
    );
    expect(target).toEqual({
      languageId: 'lang-fr-fr',
      locale: 'fr-FR',
      languageName: 'French',
      kind: 'REGENERATE',
      isNew: false,
    });
  });

  it('throws when the pack does not exist', async () => {
    await expect(resolveRegenerate(deps(null), 'lang-missing')).rejects.toThrow(
      /lang-missing not found/,
    );
  });
});
