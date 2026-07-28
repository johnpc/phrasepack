/**
 * Seed pack fixtures — DATA (records, not logic; exempt from the line gate).
 * A couple of fully-formed, deterministic packs so e2e can assert on real
 * rendered content (text + phonetic) without invoking Bedrock/Polly at seed
 * time. Slugs/categories mirror amplify/langgen/shared/phraseKeys.ts. Audio is
 * intentionally omitted (no Polly at seed) — the PlayButton renders its muted
 * state, which e2e covers too.
 */
export interface SeedPhrase {
  slug: string;
  category: string;
  source: string;
  translation: string;
  phonetic: string;
}

export interface SeedPack {
  locale: string;
  name: string;
  nativeName: string;
  flagEmoji: string;
  phrases: SeedPhrase[];
}

const SPANISH: SeedPack = {
  locale: 'es-ES',
  name: 'Spanish (Spain)',
  nativeName: 'Español',
  flagEmoji: '🇪🇸',
  phrases: [
    {
      slug: 'hello',
      category: 'greetings',
      source: 'Hello',
      translation: 'Hola',
      phonetic: 'OH-lah',
    },
    {
      slug: 'goodbye',
      category: 'greetings',
      source: 'Goodbye',
      translation: 'Adiós',
      phonetic: 'ah-DYOHS',
    },
    {
      slug: 'please',
      category: 'courtesy',
      source: 'Please',
      translation: 'Por favor',
      phonetic: 'por fah-VOR',
    },
    {
      slug: 'thank-you',
      category: 'courtesy',
      source: 'Thank you',
      translation: 'Gracias',
      phonetic: 'GRAH-syahs',
    },
    {
      slug: 'sorry',
      category: 'courtesy',
      source: 'Sorry',
      translation: 'Lo siento',
      phonetic: 'loh SYEN-toh',
    },
    {
      slug: 'do-you-speak-english',
      category: 'basics',
      source: 'Do you speak English?',
      translation: '¿Hablas inglés?',
      phonetic: 'AH-blahs een-GLEHS',
    },
    {
      slug: 'the-check-please',
      category: 'dining',
      source: 'The check, please',
      translation: 'La cuenta, por favor',
      phonetic: 'lah KWEN-tah por fah-VOR',
    },
    {
      slug: 'how-much-is-it',
      category: 'money',
      source: 'How much is it?',
      translation: '¿Cuánto cuesta?',
      phonetic: 'KWAN-toh KWES-tah',
    },
    {
      slug: 'do-you-take-cards',
      category: 'money',
      source: 'Do you take credit cards?',
      translation: '¿Aceptan tarjetas?',
      phonetic: 'ah-SEP-tahn tar-HEH-tahs',
    },
    {
      slug: 'i-need-a-taxi',
      category: 'transport',
      source: 'I need a taxi',
      translation: 'Necesito un taxi',
      phonetic: 'neh-seh-SEE-toh oon TAHK-see',
    },
    {
      slug: 'to-the-airport',
      category: 'transport',
      source: 'To the airport, please',
      translation: 'Al aeropuerto, por favor',
      phonetic: 'ahl ah-eh-roh-PWER-toh por fah-VOR',
    },
    {
      slug: 'where-is-the-bathroom',
      category: 'directions',
      source: 'Where is the bathroom?',
      translation: '¿Dónde está el baño?',
      phonetic: 'DOHN-deh es-TAH el BAH-nyoh',
    },
  ],
};

const FRENCH: SeedPack = {
  locale: 'fr-FR',
  name: 'French',
  nativeName: 'Français',
  flagEmoji: '🇫🇷',
  phrases: [
    {
      slug: 'hello',
      category: 'greetings',
      source: 'Hello',
      translation: 'Bonjour',
      phonetic: 'bohn-ZHOOR',
    },
    {
      slug: 'goodbye',
      category: 'greetings',
      source: 'Goodbye',
      translation: 'Au revoir',
      phonetic: 'oh ruh-VWAHR',
    },
    {
      slug: 'please',
      category: 'courtesy',
      source: 'Please',
      translation: "S'il vous plaît",
      phonetic: 'seel voo PLEH',
    },
    {
      slug: 'thank-you',
      category: 'courtesy',
      source: 'Thank you',
      translation: 'Merci',
      phonetic: 'mehr-SEE',
    },
    {
      slug: 'sorry',
      category: 'courtesy',
      source: 'Sorry',
      translation: 'Pardon',
      phonetic: 'par-DOHN',
    },
    {
      slug: 'the-check-please',
      category: 'dining',
      source: 'The check, please',
      translation: "L'addition, s'il vous plaît",
      phonetic: 'lah-dee-SYOHN seel voo PLEH',
    },
    {
      slug: 'how-much-is-it',
      category: 'money',
      source: 'How much is it?',
      translation: "C'est combien ?",
      phonetic: 'say kohm-BYEHN',
    },
    {
      slug: 'i-need-a-taxi',
      category: 'transport',
      source: 'I need a taxi',
      translation: "J'ai besoin d'un taxi",
      phonetic: 'zhay buh-ZWAHN duhn tahk-SEE',
    },
    {
      slug: 'where-is-the-bathroom',
      category: 'directions',
      source: 'Where is the bathroom?',
      translation: 'Où sont les toilettes ?',
      phonetic: 'oo sohn lay twah-LET',
    },
  ],
};

export const SEED_PACKS: SeedPack[] = [SPANISH, FRENCH];
