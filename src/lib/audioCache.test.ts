import { describe, it, expect } from 'vitest';
import { putAudio, getAudio } from './audioCache';

describe('audioCache', () => {
  it('round-trips a blob by path', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'audio/mpeg' });
    await putAudio('media/phrases/lang-es-es/p1.mp3', blob);
    const got = await getAudio('media/phrases/lang-es-es/p1.mp3');
    expect(got).toBeInstanceOf(Blob);
    expect(got?.type).toBe('audio/mpeg');
  });

  it('returns null for a path that was never cached', async () => {
    expect(await getAudio('media/phrases/never/there.mp3')).toBeNull();
  });

  it('overwrites an existing entry for the same path', async () => {
    const path = 'media/phrases/lang-es-es/p2.mp3';
    await putAudio(path, new Blob([new Uint8Array([1])]));
    await putAudio(path, new Blob([new Uint8Array([9, 9, 9, 9])]));
    const got = await getAudio(path);
    expect(await got?.arrayBuffer().then((b) => b.byteLength)).toBe(4);
  });
});
