/**
 * Pure BCP-47 locale → Amazon Polly voice mapping for phrase pronunciation.
 * Kept a tested table so the audio edge stays trivial and adding a language is
 * a one-line change. Each entry pins the Polly VoiceId, the LanguageCode, and
 * the engine (most modern voices are 'neural'; a few only offer 'standard').
 *
 * Matching falls back progressively: exact locale ("pt-BR") → language prefix
 * ("pt" → first pt-* entry) → US English. So a pack for an unlisted regional
 * variant still speaks in the right language.
 */
export interface Voice {
  voiceId: string;
  languageCode: string;
  engine: 'neural' | 'standard';
}

const N = (voiceId: string, languageCode: string): Voice => ({
  voiceId,
  languageCode,
  engine: 'neural',
});

const VOICE_BY_LOCALE: Record<string, Voice> = {
  'en-US': N('Joanna', 'en-US'),
  'en-GB': N('Amy', 'en-GB'),
  'es-ES': N('Lucia', 'es-ES'),
  'es-MX': N('Mia', 'es-MX'),
  'fr-FR': N('Lea', 'fr-FR'),
  'fr-CA': N('Gabrielle', 'fr-CA'),
  'de-DE': N('Vicki', 'de-DE'),
  'it-IT': N('Bianca', 'it-IT'),
  'pt-BR': N('Camila', 'pt-BR'),
  'pt-PT': N('Ines', 'pt-PT'),
  'nl-NL': N('Laura', 'nl-NL'),
  'pl-PL': N('Ola', 'pl-PL'),
  'sv-SE': N('Elin', 'sv-SE'),
  'nb-NO': N('Ida', 'nb-NO'),
  'da-DK': N('Sofie', 'da-DK'),
  'ja-JP': N('Takumi', 'ja-JP'),
  'ko-KR': N('Seoyeon', 'ko-KR'),
  'cmn-CN': N('Zhiyu', 'cmn-CN'),
  'ar-AE': N('Hala', 'ar-AE'),
  'hi-IN': N('Kajal', 'hi-IN'),
  'tr-TR': { voiceId: 'Filiz', languageCode: 'tr-TR', engine: 'standard' },
  'ru-RU': { voiceId: 'Tatyana', languageCode: 'ru-RU', engine: 'standard' },
};

const DEFAULT: Voice = VOICE_BY_LOCALE['en-US'];

/** Resolve a Polly voice for a BCP-47 locale (exact → prefix → en-US). */
export function voiceForLanguage(locale: string | null | undefined): Voice {
  if (!locale) return DEFAULT;
  const exact = VOICE_BY_LOCALE[locale];
  if (exact) return exact;
  const prefix = locale.split('-')[0].toLowerCase();
  const match = Object.entries(VOICE_BY_LOCALE).find(([key]) =>
    key.toLowerCase().startsWith(`${prefix}-`),
  );
  return match ? match[1] : DEFAULT;
}
