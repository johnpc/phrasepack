/**
 * The list of languages a traveler can generate a pack for — DATA plus small
 * pure helpers. Kept client-side (not a backend read) because it's a fixed,
 * curated set the "Add a language" picker offers; the actual translations are
 * AI-generated per pick. Locales match the Polly voice table in the backend.
 */
export interface CatalogLanguage {
  locale: string;
  name: string;
  nativeName: string;
  flagEmoji: string;
}

export const CATALOG_LANGUAGES: CatalogLanguage[] = [
  { locale: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español', flagEmoji: '🇪🇸' },
  { locale: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español', flagEmoji: '🇲🇽' },
  { locale: 'fr-FR', name: 'French', nativeName: 'Français', flagEmoji: '🇫🇷' },
  { locale: 'de-DE', name: 'German', nativeName: 'Deutsch', flagEmoji: '🇩🇪' },
  { locale: 'it-IT', name: 'Italian', nativeName: 'Italiano', flagEmoji: '🇮🇹' },
  { locale: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português', flagEmoji: '🇧🇷' },
  { locale: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português', flagEmoji: '🇵🇹' },
  { locale: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', flagEmoji: '🇳🇱' },
  { locale: 'pl-PL', name: 'Polish', nativeName: 'Polski', flagEmoji: '🇵🇱' },
  { locale: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', flagEmoji: '🇸🇪' },
  { locale: 'da-DK', name: 'Danish', nativeName: 'Dansk', flagEmoji: '🇩🇰' },
  { locale: 'nb-NO', name: 'Norwegian', nativeName: 'Norsk', flagEmoji: '🇳🇴' },
  { locale: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', flagEmoji: '🇹🇷' },
  { locale: 'ru-RU', name: 'Russian', nativeName: 'Русский', flagEmoji: '🇷🇺' },
  { locale: 'ja-JP', name: 'Japanese', nativeName: '日本語', flagEmoji: '🇯🇵' },
  { locale: 'ko-KR', name: 'Korean', nativeName: '한국어', flagEmoji: '🇰🇷' },
  { locale: 'cmn-CN', name: 'Mandarin Chinese', nativeName: '中文', flagEmoji: '🇨🇳' },
  { locale: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', flagEmoji: '🇮🇳' },
  { locale: 'ar-AE', name: 'Arabic', nativeName: 'العربية', flagEmoji: '🇦🇪' },
];

/** Catalog entries whose locale is not among the already-generated ones — the
 * choices the "Add a language" picker should offer. Pure over its inputs. */
export function availableToGenerate(existingLocales: Iterable<string>): CatalogLanguage[] {
  const have = new Set(existingLocales);
  return CATALOG_LANGUAGES.filter((l) => !have.has(l.locale));
}
