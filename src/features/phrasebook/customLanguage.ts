/**
 * Pure helpers for a free-text "any language" request. The user types a language
 * NAME (e.g. "Swahili", "Brazilian Portuguese"); the backend needs a { locale,
 * name }. Claude translates primarily from the NAME, and the locale drives the
 * Polly voice + regional spelling — so for a free-text request we derive a
 * best-effort locale slug from the name (unknown languages simply get no audio,
 * which the backend handles). Kept pure so parsing is unit-testable.
 */
import { CATALOG_LANGUAGES, type CatalogLanguage } from './languageCatalog';

/** A tidy display name: trimmed, collapsed whitespace, Title Case (lowercasing
 * the rest so an all-caps "SWAHILI" becomes "Swahili"). */
export function normalizeName(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** A locale slug derived from a free-text name — lowercased, non-alphanumerics
 * to hyphens (e.g. "Brazilian Portuguese" → "brazilian-portuguese"). Prefixed
 * `x-` to mark it a custom (non-BCP-47) tag the voice table won't match. */
export function localeForName(name: string): string {
  const slug = normalizeName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `x-${slug}`;
}

/** Resolve a typed name to a generate request. If it case-insensitively matches
 * a catalog language's name, reuse that entry (real locale + flag + endonym);
 * otherwise build a custom request from the derived locale. Returns null for a
 * blank/too-short name so the UI can disable submit. */
export function requestForName(input: string): CatalogLanguage | null {
  const name = normalizeName(input);
  if (name.length < 2) return null;
  const known = CATALOG_LANGUAGES.find((l) => l.name.toLowerCase() === name.toLowerCase());
  if (known) return known;
  return { locale: localeForName(name), name, nativeName: '', flagEmoji: '🌐' };
}
