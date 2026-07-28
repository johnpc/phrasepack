/**
 * Produce one phrase: synthesize its pronunciation audio (Polly) to S3, then
 * write the Phrase row. Audio failure is non-fatal — a phrase is still useful
 * with text + phonetics — so it's caught and the row is written without audio.
 */
import { synthesizeSpeech } from '../shared/polly';
import { putMedia } from '../shared/s3';
import { phraseAudioKey } from '../shared/mediaKeys';
import { buildPhraseItem } from '../shared/phraseItem';
import { putItem } from '../shared/ddb';
import type { Voice } from '../shared/voiceForLanguage';

export interface ProducePhraseCtx {
  bucket: string;
  phraseTable: string;
  languageId: string;
  voice: Voice;
  now: string;
}

/** The fully-resolved data for one phrase (catalog key joined to translation). */
export interface ResolvedPhrase {
  phraseKeySlug: string;
  categorySlug: string;
  ord: number;
  sourceText: string;
  translation: string;
  phonetic?: string;
}

async function makeAudio(
  ctx: ProducePhraseCtx,
  phraseId: string,
  translation: string,
): Promise<string | undefined> {
  try {
    const bytes = await synthesizeSpeech(translation, ctx.voice);
    return await putMedia(
      ctx.bucket,
      phraseAudioKey(ctx.languageId, phraseId),
      bytes,
      'audio/mpeg',
    );
  } catch {
    return undefined; // non-fatal: phrase renders (and reads) without audio
  }
}

/** Synthesize audio for one phrase and write its row; returns the new id. */
export async function producePhrase(
  ctx: ProducePhraseCtx,
  phraseId: string,
  phrase: ResolvedPhrase,
): Promise<string> {
  const audioPath = await makeAudio(ctx, phraseId, phrase.translation);
  await putItem(
    ctx.phraseTable,
    buildPhraseItem({
      id: phraseId,
      languageId: ctx.languageId,
      phraseKeySlug: phrase.phraseKeySlug,
      categorySlug: phrase.categorySlug,
      ord: phrase.ord,
      now: ctx.now,
      sourceText: phrase.sourceText,
      translation: phrase.translation,
      phonetic: phrase.phonetic,
      audioPath,
    }),
  );
  return phraseId;
}
