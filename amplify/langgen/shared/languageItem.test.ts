import { describe, it, expect } from 'vitest';
import { buildLanguageItem, buildRunItem } from './languageItem';

describe('buildLanguageItem', () => {
  const base = {
    id: 'lang-es-es',
    now: '2026-06-01T00:00:00.000Z',
    locale: 'es-ES',
    name: 'Spanish (Spain)',
    keyVersion: 1,
  };

  it('builds a DRAFT Language row with all fields', () => {
    const item = buildLanguageItem({ ...base, nativeName: 'Español', flagEmoji: '🇪🇸' });
    expect(item).toEqual({
      id: 'lang-es-es',
      __typename: 'Language',
      createdAt: base.now,
      updatedAt: base.now,
      locale: 'es-ES',
      name: 'Spanish (Spain)',
      nativeName: 'Español',
      flagEmoji: '🇪🇸',
      status: 'DRAFT',
      phraseCount: 0,
      keyVersion: 1,
    });
  });

  it('omits nativeName and flagEmoji when undefined', () => {
    const item = buildLanguageItem(base);
    expect(item.nativeName).toBeUndefined();
    expect(item.flagEmoji).toBeUndefined();
    expect(item).toMatchObject({ status: 'DRAFT', phraseCount: 0 });
  });
});

describe('buildRunItem', () => {
  it('builds a RUNNING GenerationRun row', () => {
    const item = buildRunItem({
      id: 'run-1',
      now: '2026-06-01T00:00:00.000Z',
      kind: 'GENERATE',
      locale: 'es-ES',
      languageId: 'lang-es-es',
      keyVersion: 1,
      requestedCount: 39,
    });
    expect(item).toEqual({
      id: 'run-1',
      __typename: 'GenerationRun',
      createdAt: '2026-06-01T00:00:00.000Z',
      updatedAt: '2026-06-01T00:00:00.000Z',
      kind: 'GENERATE',
      locale: 'es-ES',
      languageId: 'lang-es-es',
      keyVersion: 1,
      requestedCount: 39,
      generatedCount: 0,
      status: 'RUNNING',
      startedAt: '2026-06-01T00:00:00.000Z',
    });
  });

  it('records the REGENERATE kind', () => {
    const item = buildRunItem({
      id: 'run-2',
      now: '2026-06-01T00:00:00.000Z',
      kind: 'REGENERATE',
      locale: 'fr-FR',
      languageId: 'lang-fr-fr',
      keyVersion: 2,
      requestedCount: 5,
    });
    expect(item).toMatchObject({ kind: 'REGENERATE', status: 'RUNNING' });
  });
});
