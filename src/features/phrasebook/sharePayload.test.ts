import { describe, it, expect } from 'vitest';
import { buildSharePayload } from './sharePayload';
import type { LanguageRecord } from '../../lib/dataClient';

const lang = (over: Partial<LanguageRecord> = {}): LanguageRecord =>
  ({ id: 'lang-es-es', name: 'Spanish (Spain)', ...over }) as LanguageRecord;

describe('buildSharePayload', () => {
  it('builds a title, text, and deterministic pack URL from the origin', () => {
    const out = buildSharePayload(lang(), 'https://phrasepack.app');
    expect(out.url).toBe('https://phrasepack.app/pack/lang-es-es');
    expect(out.title).toContain('Spanish (Spain)');
    expect(out.text).toContain('Spanish (Spain)');
  });

  it('falls back to a generic name when the pack has none', () => {
    const out = buildSharePayload(lang({ name: null as unknown as string }), 'https://x.io');
    expect(out.title).toContain('this language');
  });
});
