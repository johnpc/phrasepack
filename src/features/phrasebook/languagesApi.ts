/**
 * Server state for language packs — all Amplify Data access goes through
 * react-query here (no fetches in components). Guest reads use the client's
 * default identityPool auth; the read models grant allow.guest().
 */
import { useQuery } from '@tanstack/react-query';
import { dataClient, unwrap, type LanguageRecord } from '../../lib/dataClient';

/** All PUBLISHED packs, newest first — the Home list. */
async function listPublishedLanguages(): Promise<LanguageRecord[]> {
  const res = await dataClient.models.Language.list({
    filter: { status: { eq: 'PUBLISHED' } },
    limit: 200,
  });
  const rows = unwrap(res);
  return [...rows].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));
}

export function usePublishedLanguages() {
  return useQuery({ queryKey: ['languages', 'published'], queryFn: listPublishedLanguages });
}

/** One pack by id (the pack-detail header). */
async function getLanguage(id: string): Promise<LanguageRecord | null> {
  return unwrap(await dataClient.models.Language.get({ id }));
}

export function useLanguage(id: string | undefined) {
  return useQuery({
    queryKey: ['language', id],
    queryFn: () => getLanguage(id as string),
    enabled: !!id,
  });
}
