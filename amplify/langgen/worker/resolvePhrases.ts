/**
 * Pure join: catalog keys (to produce) + Claude's translations → the fully-
 * resolved phrase rows the worker will write. Matches by slug; a key with no
 * translation (Claude dropped it) is skipped so we never write a phrase with a
 * missing translation. `ord` comes from the key's position in the FULL catalog
 * (so gap-fills insert at the right spot), passed in via `ordForSlug`.
 */
import type { PhraseKey } from '../shared/phraseKeys';
import type { Translation } from '../shared/parseTranslations';
import type { ResolvedPhrase } from './producePhrase';

export function resolvePhrases(
  toProduce: PhraseKey[],
  translations: Translation[],
  ordForSlug: (slug: string) => number,
): ResolvedPhrase[] {
  const bySlug = new Map(translations.map((t) => [t.slug, t]));
  const resolved: ResolvedPhrase[] = [];
  for (const key of toProduce) {
    const t = bySlug.get(key.slug);
    if (!t) continue; // Claude omitted this one — don't write a blank row
    resolved.push({
      phraseKeySlug: key.slug,
      categorySlug: key.categorySlug,
      ord: ordForSlug(key.slug),
      sourceText: key.text,
      translation: t.translation,
      phonetic: t.phonetic,
    });
  }
  return resolved;
}
