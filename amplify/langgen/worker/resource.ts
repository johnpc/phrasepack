/**
 * The langgen worker Lambda — async-invoked by the starter. Does the long job:
 * Claude translates the (missing) catalog phrases, then per phrase Polly speaks
 * it to S3 and the Phrase row is written; finally the Language + GenerationRun
 * are flipped to PUBLISHED / DRAFT_READY. Long timeout + modest memory (holds
 * audio bytes). backend.ts grants Bedrock + Polly + S3 + table reads/writes.
 */
import { defineFunction } from '@aws-amplify/backend';

export const langgenWorker = defineFunction({
  name: 'langgen-worker',
  entry: './handler.ts',
  timeoutSeconds: 900, // up to 15 min: a full catalog × (translate + audio)
  memoryMB: 1024,
  // Co-locate with the starter (data stack) so the starter→worker invoke grant
  // and the worker's table writes don't span stacks (circular-dependency fix).
  resourceGroupName: 'data',
});
