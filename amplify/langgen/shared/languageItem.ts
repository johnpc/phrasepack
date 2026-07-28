/**
 * Pure builders for the Language + GenerationRun DynamoDB items the starter
 * writes directly (no resolver, so id/__typename/timestamps are set here).
 * Mirrors the models in amplify/data/resource.ts.
 */
export interface NewLanguageInput {
  id: string;
  now: string;
  locale: string;
  name: string;
  nativeName?: string;
  flagEmoji?: string;
  keyVersion: number;
}

/** A DRAFT Language row for a brand-new pack. */
export function buildLanguageItem(input: NewLanguageInput): Record<string, unknown> {
  return {
    id: input.id,
    __typename: 'Language',
    createdAt: input.now,
    updatedAt: input.now,
    locale: input.locale,
    name: input.name,
    nativeName: input.nativeName ?? undefined,
    flagEmoji: input.flagEmoji ?? undefined,
    status: 'DRAFT',
    phraseCount: 0,
    keyVersion: input.keyVersion,
  };
}

export interface NewRunInput {
  id: string;
  now: string;
  kind: 'GENERATE' | 'REGENERATE';
  locale: string;
  languageId: string;
  keyVersion: number;
  requestedCount: number;
}

/** A RUNNING GenerationRun row. */
export function buildRunItem(input: NewRunInput): Record<string, unknown> {
  return {
    id: input.id,
    __typename: 'GenerationRun',
    createdAt: input.now,
    updatedAt: input.now,
    kind: input.kind,
    locale: input.locale,
    languageId: input.languageId,
    keyVersion: input.keyVersion,
    requestedCount: input.requestedCount,
    generatedCount: 0,
    status: 'RUNNING',
    startedAt: input.now,
  };
}
