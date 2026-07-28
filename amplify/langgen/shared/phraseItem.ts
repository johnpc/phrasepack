/**
 * Pure builder for a Phrase DynamoDB item written by the worker. Mirrors the
 * Phrase model in amplify/data/resource.ts — the app reads these rows, so the
 * shape MUST match what AppSync would write (id, __typename, timestamps set
 * here since a direct PutItem has no resolver to set them).
 */
export interface PhraseItemInput {
  id: string;
  languageId: string;
  phraseKeySlug: string;
  categorySlug: string;
  ord: number;
  now: string;
  sourceText: string;
  translation: string;
  phonetic?: string;
  audioPath?: string;
}

/** Build the Amplify-shaped Phrase item for a direct PutItem. */
export function buildPhraseItem(input: PhraseItemInput): Record<string, unknown> {
  return {
    id: input.id,
    __typename: 'Phrase',
    createdAt: input.now,
    updatedAt: input.now,
    languageId: input.languageId,
    phraseKeySlug: input.phraseKeySlug,
    categorySlug: input.categorySlug,
    ord: input.ord,
    sourceText: input.sourceText,
    translation: input.translation,
    phonetic: input.phonetic ?? undefined,
    audioPath: input.audioPath ?? undefined,
  };
}
