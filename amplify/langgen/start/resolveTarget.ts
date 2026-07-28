/**
 * Resolve WHICH language a starter invocation targets, and whether a new pack
 * row must be created. Both mutations share the starter:
 *
 *  • generateLanguage({ locale, name, ... }) — the pack id is DETERMINISTIC from
 *    the locale, so if a pack already exists we reuse it (idempotent) and
 *    gap-fill; otherwise we mark it for creation.
 *  • regenerateLanguage({ languageId })       — load the existing pack; gap-fill.
 *
 * The impure edge (getItem) is injected so this planner is unit-testable
 * without AWS.
 */
import { languageIdForLocale } from '../shared/ids';

export interface GenerateArgs {
  locale: string;
  name: string;
  nativeName?: string | null;
  flagEmoji?: string | null;
}

export interface Target {
  languageId: string;
  locale: string;
  languageName: string;
  nativeName?: string;
  flagEmoji?: string;
  kind: 'GENERATE' | 'REGENERATE';
  /** true when the starter must create a fresh DRAFT Language row. */
  isNew: boolean;
}

export interface ResolveDeps {
  getLanguage: (id: string) => Promise<Record<string, unknown> | null>;
}

function existingTarget(row: Record<string, unknown>): Target {
  return {
    languageId: String(row.id),
    locale: String(row.locale),
    languageName: String(row.name),
    kind: 'REGENERATE',
    isNew: false,
  };
}

/** Resolve a generateLanguage call: reuse the deterministic-id pack, else create. */
export async function resolveGenerate(deps: ResolveDeps, args: GenerateArgs): Promise<Target> {
  const id = languageIdForLocale(args.locale);
  const existing = await deps.getLanguage(id);
  if (existing) return existingTarget(existing);
  return {
    languageId: id,
    locale: args.locale,
    languageName: args.name,
    nativeName: args.nativeName ?? undefined,
    flagEmoji: args.flagEmoji ?? undefined,
    kind: 'GENERATE',
    isNew: true,
  };
}

/** Resolve a regenerateLanguage call: the pack must already exist. */
export async function resolveRegenerate(deps: ResolveDeps, languageId: string): Promise<Target> {
  const row = await deps.getLanguage(languageId);
  if (!row) throw new Error(`language ${languageId} not found`);
  return existingTarget(row);
}
