import { describe, it, expect, vi, beforeEach } from 'vitest';

const e = vi.hoisted(() => ({
  getItem: vi.fn(),
  updateItem: vi.fn(),
  synthesizeSpeech: vi.fn(),
  putMedia: vi.fn(),
}));
vi.mock('../shared/ddb', () => ({ getItem: e.getItem, updateItem: e.updateItem }));
vi.mock('../shared/polly', () => ({ synthesizeSpeech: e.synthesizeSpeech }));
vi.mock('../shared/s3', () => ({ putMedia: e.putMedia }));
// Real voiceForLanguage: es-ES → a voice, x-swahili → null.

import { handler } from './handler';

const call = (phraseId: string) =>
  handler({ arguments: { phraseId } } as never, {} as never, {} as never);

describe('synthesizePhraseAudio handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PHRASE_TABLE = 'phrases';
    process.env.LANGUAGE_TABLE = 'languages';
    process.env.MEDIA_BUCKET = 'bucket';
    e.updateItem.mockResolvedValue(undefined);
    e.synthesizeSpeech.mockResolvedValue(new Uint8Array([1]));
    e.putMedia.mockImplementation((_b: string, key: string) => Promise.resolve(key));
  });

  it('synthesizes, stores, saves the path, and returns it', async () => {
    e.getItem
      .mockResolvedValueOnce({ id: 'p1', languageId: 'lang-es-es', translation: 'Gracias' })
      .mockResolvedValueOnce({ id: 'lang-es-es', locale: 'es-ES' });
    const out = await call('p1');
    expect(out).toEqual({ path: 'media/phrases/lang-es-es/p1.mp3' });
    expect(e.synthesizeSpeech).toHaveBeenCalledWith(
      'Gracias',
      expect.objectContaining({ voiceId: 'Lucia' }),
    );
    expect(e.updateItem).toHaveBeenCalledWith(
      'phrases',
      'p1',
      expect.objectContaining({ audioPath: 'media/phrases/lang-es-es/p1.mp3' }),
    );
  });

  it('is a no-op when the phrase already has audio', async () => {
    e.getItem.mockResolvedValueOnce({ id: 'p1', languageId: 'l', audioPath: 'media/x.mp3' });
    const out = await call('p1');
    expect(out).toEqual({ path: 'media/x.mp3' });
    expect(e.synthesizeSpeech).not.toHaveBeenCalled();
    expect(e.updateItem).not.toHaveBeenCalled();
  });

  it('returns an empty path when the language has no supported voice', async () => {
    e.getItem
      .mockResolvedValueOnce({ id: 'p2', languageId: 'lang-x-swahili', translation: 'Ndiyo' })
      .mockResolvedValueOnce({ id: 'lang-x-swahili', locale: 'x-swahili' });
    const out = await call('p2');
    expect(out).toEqual({ path: '' });
    expect(e.synthesizeSpeech).not.toHaveBeenCalled();
  });

  it('throws when the phrase is not found', async () => {
    e.getItem.mockResolvedValueOnce(null);
    await expect(call('missing')).rejects.toThrow(/not found/);
  });

  it('throws when a required env var is missing', async () => {
    delete process.env.PHRASE_TABLE;
    await expect(call('p1')).rejects.toThrow(/PHRASE_TABLE not set/);
  });
});
