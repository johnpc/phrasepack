/**
 * Client wrappers for the language-generation custom mutations + the
 * GenerationRun read. GUEST-callable (default identityPool auth) so a traveler
 * can add or refresh a language without an account.
 */
import { dataClient, unwrap, type GenerationRunRecord } from '../../lib/dataClient';

export interface GenerateLanguageInput {
  locale: string;
  name: string;
  nativeName?: string;
  flagEmoji?: string;
}

/** Kick off AI generation of a new pack; returns the run + language ids now. */
export async function generateLanguage(
  input: GenerateLanguageInput,
): Promise<{ runId: string; languageId: string }> {
  const { data, errors } = await dataClient.mutations.generateLanguage(input);
  if (errors || !data) throw new Error(errors?.[0]?.message ?? 'Failed to start generation.');
  return { runId: data.runId, languageId: data.languageId };
}

/** Refresh an existing pack, filling in newly-added key phrases. */
export async function regenerateLanguage(
  languageId: string,
): Promise<{ runId: string; languageId: string }> {
  const { data, errors } = await dataClient.mutations.regenerateLanguage({ languageId });
  if (errors || !data) throw new Error(errors?.[0]?.message ?? 'Failed to start refresh.');
  return { runId: data.runId, languageId: data.languageId };
}

/** One run by id — the client polls this to know when generation finished. */
export async function getGenerationRun(runId: string): Promise<GenerationRunRecord | null> {
  return unwrap(await dataClient.models.GenerationRun.get({ id: runId }));
}
