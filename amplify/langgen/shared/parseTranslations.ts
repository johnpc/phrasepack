/**
 * Pure parser for Claude's InvokeModel response → translated phrases. With
 * tool_choice forcing `translate_phrases`, the response `content` carries a
 * single `tool_use` block whose `input` is `{ translations: [...] }`. Kept pure
 * so malformed responses are unit-tested without AWS.
 */
export interface Translation {
  slug: string;
  translation: string;
  phonetic?: string;
}

interface ContentBlock {
  type: string;
  name?: string;
  input?: unknown;
}
interface ClaudeBody {
  content?: ContentBlock[];
}

function toTranslation(v: unknown): Translation | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  if (typeof o.slug !== 'string' || typeof o.translation !== 'string') return null;
  if (!o.slug.trim() || !o.translation.trim()) return null;
  return {
    slug: o.slug,
    translation: o.translation,
    phonetic: typeof o.phonetic === 'string' ? o.phonetic : undefined,
  };
}

/** Extract + validate the forced translate_phrases tool input. Drops bad rows. */
export function parseTranslations(body: ClaudeBody): Translation[] {
  const block = body.content?.find((b) => b.type === 'tool_use' && b.name === 'translate_phrases');
  if (!block) throw new Error('no translate_phrases tool_use block in model response');
  const input = block.input as { translations?: unknown };
  if (!input || !Array.isArray(input.translations)) {
    throw new Error('translate_phrases input missing a translations array');
  }
  const rows = input.translations.map(toTranslation).filter((t): t is Translation => t !== null);
  if (rows.length === 0) throw new Error('translate_phrases produced no valid translations');
  return rows;
}
