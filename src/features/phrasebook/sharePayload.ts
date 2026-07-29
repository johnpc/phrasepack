/**
 * Pure builder for a pack's share payload. A pack is guest-readable at a
 * deterministic URL, so the link works for anyone (a travel companion, say).
 * Kept pure — the origin is injected — so it's unit-testable without a browser.
 */
import type { LanguageRecord } from '../../lib/dataClient';

export interface SharePayload {
  title: string;
  text: string;
  url: string;
}

export function buildSharePayload(language: LanguageRecord, origin: string): SharePayload {
  const name = language.name ?? 'this language';
  return {
    title: `PhrasePack — ${name}`,
    text: `Handy ${name} travel phrases (spelling, pronunciation, and audio) on PhrasePack:`,
    url: `${origin}/pack/${language.id}`,
  };
}
