/**
 * Server state for the phrases in a pack — read through react-query. Phrases
 * are read by languageId in `ord` order via the byLanguageId GSI, paginated so
 * a full catalog always loads.
 */
import { useQuery } from '@tanstack/react-query';
import { dataClient, unwrap, type PhraseRecord } from '../../lib/dataClient';

async function listPhrases(languageId: string): Promise<PhraseRecord[]> {
  const all: PhraseRecord[] = [];
  let token: string | null | undefined;
  do {
    const res = await dataClient.models.Phrase.listPhraseByLanguageIdAndOrd(
      { languageId },
      { limit: 200, nextToken: token },
    );
    all.push(...unwrap(res));
    token = res.nextToken;
  } while (token);
  return all;
}

export function usePhrases(languageId: string | undefined) {
  return useQuery({
    queryKey: ['phrases', languageId],
    queryFn: () => listPhrases(languageId as string),
    enabled: !!languageId,
  });
}
