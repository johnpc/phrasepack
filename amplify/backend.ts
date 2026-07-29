import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { generateLanguageStarter } from './langgen/start/resource';
import { langgenWorker } from './langgen/worker/resource';
import { synthesizePhraseAudio } from './langgen/synth/resource';

/**
 * PHRASEPACK backend.
 *
 * Language generation is an async worker (not Step Functions): the langgen
 * starter (shared by generateLanguage + regenerateLanguage) creates/looks-up a
 * DRAFT Language + RUNNING GenerationRun and async-invokes the worker, which
 * calls Bedrock (Claude translates the catalog phrases) + Polly (speaks each),
 * writing audio to S3 and Phrase rows straight to DynamoDB via its IAM role
 * (bypassing AppSync, mirroring stoop's ingestion). Deterministic ids make
 * every write idempotent, so a regeneration overwrites rather than duplicates.
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  generateLanguageStarter,
  langgenWorker,
  synthesizePhraseAudio,
});

const tables = backend.data.resources.tables;
const bucket = backend.storage.resources.bucket;

// Bedrock InvokeModel on the Claude (text) models.
const bedrockGrant = () =>
  new PolicyStatement({
    actions: ['bedrock:InvokeModel'],
    resources: [
      'arn:aws:bedrock:*::foundation-model/anthropic.*',
      'arn:aws:bedrock:*:*:inference-profile/*anthropic.*',
    ],
  });
// Polly SynthesizeSpeech is not resource-scopable — must be '*'.
const pollyGrant = () =>
  new PolicyStatement({ actions: ['polly:SynthesizeSpeech'], resources: ['*'] });

// --- Starter: reads/creates Language + writes GenerationRun, invokes worker ---
const starter = backend.generateLanguageStarter.resources.lambda;
backend.generateLanguageStarter.addEnvironment('LANGUAGE_TABLE', tables['Language'].tableName);
backend.generateLanguageStarter.addEnvironment(
  'GENERATION_RUN_TABLE',
  tables['GenerationRun'].tableName,
);
backend.generateLanguageStarter.addEnvironment(
  'WORKER_FUNCTION_NAME',
  backend.langgenWorker.resources.lambda.functionName,
);
tables['Language'].grantReadWriteData(starter);
tables['GenerationRun'].grantWriteData(starter);
backend.langgenWorker.resources.lambda.grantInvoke(starter);

// --- Worker: Bedrock + Polly + S3 + Phrase/Language/GenerationRun writes ---
const worker = backend.langgenWorker.resources.lambda;
backend.langgenWorker.addEnvironment('PHRASE_TABLE', tables['Phrase'].tableName);
backend.langgenWorker.addEnvironment('LANGUAGE_TABLE', tables['Language'].tableName);
backend.langgenWorker.addEnvironment('GENERATION_RUN_TABLE', tables['GenerationRun'].tableName);
backend.langgenWorker.addEnvironment('MEDIA_BUCKET', bucket.bucketName);
worker.addToRolePolicy(bedrockGrant());
worker.addToRolePolicy(pollyGrant());
bucket.grantWrite(worker, 'media/phrases/*');
tables['Phrase'].grantReadWriteData(worker); // read: gap-fill existence check
tables['Language'].grantWriteData(worker);
tables['GenerationRun'].grantWriteData(worker);

// --- On-demand single-phrase audio: Polly + S3 write + Phrase(read/write) +
// Language(read for the locale). Synchronous resolver, no worker. ---
const synth = backend.synthesizePhraseAudio.resources.lambda;
backend.synthesizePhraseAudio.addEnvironment('PHRASE_TABLE', tables['Phrase'].tableName);
backend.synthesizePhraseAudio.addEnvironment('LANGUAGE_TABLE', tables['Language'].tableName);
backend.synthesizePhraseAudio.addEnvironment('MEDIA_BUCKET', bucket.bucketName);
synth.addToRolePolicy(pollyGrant());
bucket.grantWrite(synth, 'media/phrases/*');
tables['Phrase'].grantReadWriteData(synth);
tables['Language'].grantReadData(synth);
