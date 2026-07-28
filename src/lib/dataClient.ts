/**
 * Shared Amplify Data client (typed against the backend Schema).
 *
 * Auth mode is chosen per call by readAuthMode(): signed-in users read via
 * 'userPool' (group claims ride in the JWT — immune to identity-pool role
 * remapping for Cognito group members), while anonymous visitors read via
 * 'identityPool' (the guest role). A client/schema provider mismatch returns
 * empty results, not an error — so guest reads work only while every read model
 * keeps its allow.guest() grant.
 */
import { generateClient } from 'aws-amplify/data';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { Schema } from '../../amplify/data/resource';

export const dataClient = generateClient<Schema>({ authMode: 'identityPool' });

/** 'userPool' when a Cognito session exists, else 'identityPool' (guest). */
export async function readAuthMode(): Promise<'userPool' | 'identityPool'> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken ? 'userPool' : 'identityPool';
  } catch {
    return 'identityPool';
  }
}

/**
 * Unwrap an Amplify list/get result, THROWING when the call returned GraphQL
 * errors. Amplify resolves (never rejects) on a failed request — it hands back
 * `{ data: [], errors: [...] }` — so a transient network/auth failure otherwise
 * looks identical to "genuinely empty", silently degrading a read to an empty
 * list. Throwing lets react-query treat it as an error (retry + surfaced state)
 * instead of a false empty. Pure over its input.
 */
export function unwrap<T>(result: { data: T; errors?: readonly { message: string }[] }): T {
  if (result.errors?.length) throw new Error(result.errors.map((e) => e.message).join('; '));
  return result.data;
}

export type LanguageRecord = Schema['Language']['type'];
export type PhraseRecord = Schema['Phrase']['type'];
export type GenerationRunRecord = Schema['GenerationRun']['type'];
