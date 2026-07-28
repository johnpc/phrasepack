import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({
  synthesizeSpeech: vi.fn(),
  putMedia: vi.fn(),
  putItem: vi.fn(),
}));
vi.mock('../shared/polly', () => ({ synthesizeSpeech: e.synthesizeSpeech }));
vi.mock('../shared/s3', () => ({ putMedia: e.putMedia }));
vi.mock('../shared/ddb', () => ({ putItem: e.putItem }));

import { producePhrase, type ProducePhraseCtx, type ResolvedPhrase } from './producePhrase';

const ctx: ProducePhraseCtx = {
  bucket: 'b',
  phraseTable: 't',
  languageId: 'lang-es-es',
  voice: { voiceId: 'Lucia', languageCode: 'es-ES', engine: 'neural' },
  now: '2026-06-01T00:00:00.000Z',
};
const phrase: ResolvedPhrase = {
  phraseKeySlug: 'thank-you',
  categorySlug: 'courtesy',
  ord: 11,
  sourceText: 'Thank you',
  translation: 'Gracias',
  phonetic: 'GRAH-see-as',
};

describe('producePhrase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    e.synthesizeSpeech.mockResolvedValue(new Uint8Array([1]));
    e.putMedia.mockImplementation((_b, key) => Promise.resolve(key));
    e.putItem.mockResolvedValue(undefined);
  });

  it('synthesizes audio and writes the phrase with the audioPath', async () => {
    const id = await producePhrase(ctx, 'lang-es-es-thank-you', phrase);
    expect(id).toBe('lang-es-es-thank-you');
    expect(e.synthesizeSpeech).toHaveBeenCalledWith('Gracias', ctx.voice);
    expect(e.putMedia).toHaveBeenCalledWith(
      'b',
      'media/phrases/lang-es-es/lang-es-es-thank-you.mp3',
      expect.any(Uint8Array),
      'audio/mpeg',
    );
    const item = e.putItem.mock.calls[0][1];
    expect(item).toMatchObject({
      id: 'lang-es-es-thank-you',
      __typename: 'Phrase',
      translation: 'Gracias',
      audioPath: 'media/phrases/lang-es-es/lang-es-es-thank-you.mp3',
    });
  });

  it('still writes the phrase when audio synthesis fails (non-fatal)', async () => {
    e.synthesizeSpeech.mockRejectedValue(new Error('polly down'));
    await producePhrase(ctx, 'lang-es-es-thank-you', phrase);
    const item = e.putItem.mock.calls[0][1];
    expect(item.audioPath).toBeUndefined();
    expect(item.translation).toBe('Gracias');
  });

  it('still writes the phrase when the S3 put fails (non-fatal)', async () => {
    e.putMedia.mockRejectedValue(new Error('s3 down'));
    await producePhrase(ctx, 'lang-es-es-thank-you', phrase);
    const item = e.putItem.mock.calls[0][1];
    expect(item.audioPath).toBeUndefined();
  });
});
