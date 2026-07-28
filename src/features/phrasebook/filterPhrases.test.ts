import { describe, it, expect } from 'vitest';
import { filterPhrases, normalizeQuery } from './filterPhrases';
import type { PhraseRecord } from '../../lib/dataClient';

const p = (over: Partial<PhraseRecord>): PhraseRecord =>
  ({ sourceText: '', translation: '', phonetic: '', ...over }) as PhraseRecord;

const rows = [
  p({ sourceText: 'I need a taxi', translation: 'Necesito un taxi', phonetic: 'neh-seh-SEE-toh' }),
  p({ sourceText: 'Thank you', translation: 'Gracias', phonetic: 'GRAH-syahs' }),
  p({
    sourceText: 'The check, please',
    translation: 'La cuenta, por favor',
    phonetic: 'lah KWEN-tah',
  }),
];

describe('normalizeQuery', () => {
  it('lowercases, trims, and strips diacritics', () => {
    expect(normalizeQuery('  CAFÉ ')).toBe('cafe');
    expect(normalizeQuery('Gráçias')).toBe('gracias');
  });
});

describe('filterPhrases', () => {
  it('returns all phrases for a blank query', () => {
    expect(filterPhrases(rows, '')).toHaveLength(3);
    expect(filterPhrases(rows, '   ')).toHaveLength(3);
  });

  it('matches the English source', () => {
    const out = filterPhrases(rows, 'taxi');
    expect(out).toHaveLength(1);
    expect(out[0].translation).toBe('Necesito un taxi');
  });

  it('matches the translation, case- and accent-insensitively', () => {
    expect(filterPhrases(rows, 'GRACIAS')).toHaveLength(1);
    expect(filterPhrases(rows, 'cuenta')[0].sourceText).toBe('The check, please');
  });

  it('matches the phonetic reading', () => {
    expect(filterPhrases(rows, 'KWEN')[0].translation).toBe('La cuenta, por favor');
  });

  it('returns nothing when there is no match', () => {
    expect(filterPhrases(rows, 'zzz')).toEqual([]);
  });

  it('tolerates a missing phonetic', () => {
    const noPhon = [p({ sourceText: 'Hello', translation: 'Hola', phonetic: null })];
    expect(filterPhrases(noPhon, 'hola')).toHaveLength(1);
    expect(filterPhrases(noPhon, 'zzz')).toHaveLength(0);
  });
});
