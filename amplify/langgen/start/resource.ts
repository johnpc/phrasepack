/**
 * The langgen starter Lambda (custom-mutation resolver for BOTH generateLanguage
 * and regenerateLanguage). Creates/looks-up the Language + a RUNNING
 * GenerationRun, async-invokes the worker, and returns { runId, languageId }
 * immediately — so it stays well under the AppSync resolver timeout. backend.ts
 * grants it the worker invoke + table reads/writes.
 */
import { defineFunction } from '@aws-amplify/backend';

export const generateLanguageStarter = defineFunction({
  name: 'langgen-start',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 256,
  // These are custom-mutation resolvers; assigning to the data stack avoids the
  // data<->function nested-stack circular dependency CloudFormation rejects.
  resourceGroupName: 'data',
});
