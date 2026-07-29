/**
 * synthesizePhraseAudio resolver — record one phrase's audio on demand. Thin:
 * read the Phrase + its pack's locale, resolve a Polly voice, synthesize → S3,
 * save the audioPath on the row, return it. Returns an empty path when the
 * phrase already has audio (idempotent) or the language has no supported voice
 * (the phrase keeps its text + phonetics). Logic beyond the edges lives in the
 * shared helpers, which are unit-tested; this file is exempt as a resolver.
 */
import { getItem, updateItem } from '../shared/ddb';
import { synthesizeSpeech } from '../shared/polly';
import { putMedia } from '../shared/s3';
import { phraseAudioKey } from '../shared/mediaKeys';
import { voiceForLanguage } from '../shared/voiceForLanguage';
import type { Schema } from '../../data/resource';

const env = (name: string): string => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} not set`);
  return v;
};

export const handler: Schema['synthesizePhraseAudio']['functionHandler'] = async (event) => {
  const { phraseId } = event.arguments;
  const phrase = await getItem(env('PHRASE_TABLE'), phraseId);
  if (!phrase) throw new Error(`phrase ${phraseId} not found`);

  // Already has audio → no-op (idempotent; a double-tap won't re-synthesize).
  if (typeof phrase.audioPath === 'string' && phrase.audioPath) {
    return { path: phrase.audioPath };
  }

  const languageId = String(phrase.languageId);
  const lang = await getItem(env('LANGUAGE_TABLE'), languageId);
  const voice = voiceForLanguage(lang?.locale ? String(lang.locale) : null);
  if (!voice) return { path: '' }; // no supported voice — text + phonetics only

  const bytes = await synthesizeSpeech(String(phrase.translation), voice);
  const key = phraseAudioKey(languageId, phraseId);
  await putMedia(env('MEDIA_BUCKET'), key, bytes, 'audio/mpeg');
  await updateItem(env('PHRASE_TABLE'), phraseId, {
    audioPath: key,
    updatedAt: new Date().toISOString(),
  });
  return { path: key };
};
