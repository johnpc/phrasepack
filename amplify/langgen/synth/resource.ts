/**
 * The synthesizePhraseAudio resolver Lambda — records ONE phrase's audio on
 * demand (Polly → S3 → save the path), for a phrase that has none yet (e.g. a
 * seeded pack, or a language whose voice was added later). Synchronous: a single
 * SynthesizeSpeech call is well under the resolver timeout, so no worker.
 * backend.ts grants it Polly + S3 write + Phrase/Language table access.
 */
import { defineFunction } from '@aws-amplify/backend';

export const synthesizePhraseAudio = defineFunction({
  name: 'langgen-synth',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  resourceGroupName: 'data',
});
