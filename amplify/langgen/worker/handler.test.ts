import { describe, it, expect, vi, beforeEach } from 'vitest';
import { KEY_PHRASES, KEY_VERSION } from '../shared/phraseKeys';
import { phraseIdFor } from '../shared/ids';
import type { WorkerEvent } from '../start/invokeWorker';

const e = vi.hoisted(() => ({
  invokeText: vi.fn(),
  parseTranslations: vi.fn(),
  updateItem: vi.fn(),
  existingIds: vi.fn(),
  producePhrase: vi.fn(),
}));
vi.mock('../shared/bedrock', () => ({ invokeText: e.invokeText }));
vi.mock('../shared/parseTranslations', () => ({ parseTranslations: e.parseTranslations }));
vi.mock('../shared/ddb', () => ({ updateItem: e.updateItem, existingIds: e.existingIds }));
vi.mock('./producePhrase', () => ({ producePhrase: e.producePhrase }));

import { handler } from './handler';

// A translation for every catalog key so the real resolvePhrases join is total.
const allTranslations = KEY_PHRASES.map((k) => ({
  slug: k.slug,
  translation: `t-${k.slug}`,
  phonetic: `p-${k.slug}`,
}));

const genEvent: WorkerEvent = {
  runId: 'r1',
  languageId: 'lang-es-es',
  locale: 'es-ES',
  languageName: 'Spanish (Spain)',
  kind: 'GENERATE',
};

describe('langgen worker handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GENERATION_RUN_TABLE = 'runs';
    process.env.LANGUAGE_TABLE = 'languages';
    process.env.PHRASE_TABLE = 'phrases';
    process.env.MEDIA_BUCKET = 'bucket';
    e.invokeText.mockResolvedValue({});
    e.parseTranslations.mockReturnValue(allTranslations);
    e.producePhrase.mockResolvedValue('pid');
    e.existingIds.mockResolvedValue(new Set<string>());
    e.updateItem.mockResolvedValue(undefined);
  });

  it('GENERATE translates + produces every phrase then flips Language PUBLISHED and run DRAFT_READY', async () => {
    await handler(genEvent);
    expect(e.existingIds).not.toHaveBeenCalled();
    expect(e.invokeText).toHaveBeenCalledTimes(1);
    expect(e.producePhrase).toHaveBeenCalledTimes(KEY_PHRASES.length);
    expect(e.updateItem).toHaveBeenCalledWith(
      'languages',
      'lang-es-es',
      expect.objectContaining({
        status: 'PUBLISHED',
        phraseCount: KEY_PHRASES.length,
        keyVersion: KEY_VERSION,
      }),
    );
    expect(e.updateItem).toHaveBeenCalledWith(
      'runs',
      'r1',
      expect.objectContaining({ status: 'DRAFT_READY', generatedCount: KEY_PHRASES.length }),
    );
  });

  it('REGENERATE only produces the missing catalog keys via existingIds', async () => {
    // Everything present except the first catalog key → exactly one to produce.
    const missingSlug = KEY_PHRASES[0].slug;
    const present = new Set(KEY_PHRASES.slice(1).map((k) => phraseIdFor('lang-es-es', k.slug)));
    e.existingIds.mockResolvedValue(present);
    e.parseTranslations.mockReturnValue([{ slug: missingSlug, translation: 'x', phonetic: 'y' }]);

    await handler({ ...genEvent, kind: 'REGENERATE' });

    expect(e.existingIds).toHaveBeenCalledTimes(1);
    expect(e.invokeText).toHaveBeenCalledTimes(1);
    expect(e.producePhrase).toHaveBeenCalledTimes(1);
    expect(e.updateItem).toHaveBeenCalledWith(
      'runs',
      'r1',
      expect.objectContaining({ status: 'DRAFT_READY', generatedCount: 1 }),
    );
  });

  it('REGENERATE with nothing missing skips the model but still marks PUBLISHED/DRAFT_READY', async () => {
    const present = new Set(KEY_PHRASES.map((k) => phraseIdFor('lang-es-es', k.slug)));
    e.existingIds.mockResolvedValue(present);

    await handler({ ...genEvent, kind: 'REGENERATE' });

    expect(e.invokeText).not.toHaveBeenCalled();
    expect(e.producePhrase).not.toHaveBeenCalled();
    expect(e.updateItem).toHaveBeenCalledWith(
      'languages',
      'lang-es-es',
      expect.objectContaining({ status: 'PUBLISHED' }),
    );
    expect(e.updateItem).toHaveBeenCalledWith(
      'runs',
      'r1',
      expect.objectContaining({ status: 'DRAFT_READY', generatedCount: 0 }),
    );
  });

  it('marks the run FAILED and rethrows when generation throws', async () => {
    e.parseTranslations.mockImplementation(() => {
      throw new Error('bad model output');
    });
    await expect(handler(genEvent)).rejects.toThrow('bad model output');
    expect(e.updateItem).toHaveBeenCalledWith(
      'runs',
      'r1',
      expect.objectContaining({ status: 'FAILED', statusReason: 'bad model output' }),
    );
  });

  it('uses a fallback reason when a non-Error is thrown', async () => {
    e.invokeText.mockRejectedValue('boom');
    await expect(handler(genEvent)).rejects.toBe('boom');
    expect(e.updateItem).toHaveBeenCalledWith(
      'runs',
      'r1',
      expect.objectContaining({ status: 'FAILED', statusReason: 'generation failed' }),
    );
  });
});
