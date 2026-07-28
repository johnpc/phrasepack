/**
 * Thin isolation wrapper over Amazon Polly SynthesizeSpeech — phrase
 * pronunciation audio. Mocked in handler tests. Neural engine, MP3 out.
 */
import {
  PollyClient,
  SynthesizeSpeechCommand,
  type VoiceId,
  type LanguageCode,
} from '@aws-sdk/client-polly';
import type { Voice } from './voiceForLanguage';

const client = new PollyClient({});

/** Synthesize MP3 speech for `text` in the given voice; return the bytes. */
export async function synthesizeSpeech(text: string, voice: Voice): Promise<Uint8Array> {
  const res = await client.send(
    new SynthesizeSpeechCommand({
      Text: text,
      // voiceForLanguage yields valid Polly ids/codes from a curated table;
      // cast the strings to the SDK's string-literal enums.
      VoiceId: voice.voiceId as VoiceId,
      LanguageCode: voice.languageCode as LanguageCode,
      OutputFormat: 'mp3',
      Engine: voice.engine,
    }),
  );
  if (!res.AudioStream) throw new Error('Polly response missing audio stream');
  return res.AudioStream.transformToByteArray();
}
