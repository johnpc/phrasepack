/**
 * Travel destinations → the catalog language a traveler there would want. DATA
 * plus a small pure resolver. "Going to Japan? → Japanese." Makes the add flow
 * purposeful: pick where you're headed rather than guess the language name. Each
 * destination maps to a `locale` in CATALOG_LANGUAGES so it reuses that entry's
 * name/flag/voice; multiple destinations can share a language (Austria → German).
 */
import { CATALOG_LANGUAGES, type CatalogLanguage } from './languageCatalog';

export interface Destination {
  country: string;
  flagEmoji: string;
  locale: string; // must exist in CATALOG_LANGUAGES
}

export const DESTINATIONS: Destination[] = [
  { country: 'Spain', flagEmoji: '🇪🇸', locale: 'es-ES' },
  { country: 'Mexico', flagEmoji: '🇲🇽', locale: 'es-MX' },
  { country: 'France', flagEmoji: '🇫🇷', locale: 'fr-FR' },
  { country: 'Germany', flagEmoji: '🇩🇪', locale: 'de-DE' },
  { country: 'Austria', flagEmoji: '🇦🇹', locale: 'de-DE' },
  { country: 'Italy', flagEmoji: '🇮🇹', locale: 'it-IT' },
  { country: 'Brazil', flagEmoji: '🇧🇷', locale: 'pt-BR' },
  { country: 'Portugal', flagEmoji: '🇵🇹', locale: 'pt-PT' },
  { country: 'Netherlands', flagEmoji: '🇳🇱', locale: 'nl-NL' },
  { country: 'Poland', flagEmoji: '🇵🇱', locale: 'pl-PL' },
  { country: 'Sweden', flagEmoji: '🇸🇪', locale: 'sv-SE' },
  { country: 'Denmark', flagEmoji: '🇩🇰', locale: 'da-DK' },
  { country: 'Norway', flagEmoji: '🇳🇴', locale: 'nb-NO' },
  { country: 'Turkey', flagEmoji: '🇹🇷', locale: 'tr-TR' },
  { country: 'Japan', flagEmoji: '🇯🇵', locale: 'ja-JP' },
  { country: 'South Korea', flagEmoji: '🇰🇷', locale: 'ko-KR' },
  { country: 'China', flagEmoji: '🇨🇳', locale: 'cmn-CN' },
  { country: 'India', flagEmoji: '🇮🇳', locale: 'hi-IN' },
  { country: 'UAE', flagEmoji: '🇦🇪', locale: 'ar-AE' },
];

export interface DestinationChoice extends Destination {
  language: CatalogLanguage;
}

/** Destinations whose language isn't already generated, joined to their catalog
 * language. Pure over the existing locales. */
export function destinationsToOffer(existingLocales: Iterable<string>): DestinationChoice[] {
  const have = new Set(existingLocales);
  const byLocale = new Map(CATALOG_LANGUAGES.map((l) => [l.locale, l]));
  return DESTINATIONS.filter((d) => !have.has(d.locale))
    .map((d) => {
      const language = byLocale.get(d.locale);
      return language ? { ...d, language } : null;
    })
    .filter((d): d is DestinationChoice => d !== null);
}
