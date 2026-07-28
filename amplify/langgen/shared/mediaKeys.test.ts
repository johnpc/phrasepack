import { describe, it, expect } from 'vitest';
import { phraseAudioKey } from './mediaKeys';

describe('phraseAudioKey', () => {
  it('builds the media/phrases prefix keyed by phrase id', () => {
    expect(phraseAudioKey('lang-es-es', 'lang-es-es-thank-you')).toBe(
      'media/phrases/lang-es-es/lang-es-es-thank-you.mp3',
    );
  });
});
