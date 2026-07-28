/**
 * The canonical catalog of key travel phrases — DATA, not logic (exempt from
 * the line-length gate). This is the source of truth for what EVERY language
 * pack should contain: the most useful simple phrases a traveler needs.
 *
 * `KEY_VERSION` is bumped whenever keys are added/changed. A Language pack
 * records the version it was generated against; the app compares the pack's
 * existing phrase slugs against this catalog to find gaps and offer a
 * gap-filling regeneration ("we added new key phrases"). Slugs are stable and
 * must never be reused for a different phrase.
 */

/** Bump when the KEY_PHRASES list changes so packs can detect staleness. */
export const KEY_VERSION = 1;

export interface PhraseCategory {
  slug: string;
  label: string;
}

/** Display groups on the pack-detail screen, in presentation order. */
export const CATEGORIES: PhraseCategory[] = [
  { slug: 'basics', label: 'The Basics' },
  { slug: 'greetings', label: 'Greetings' },
  { slug: 'courtesy', label: 'Please & Thank You' },
  { slug: 'dining', label: 'Eating & Drinking' },
  { slug: 'money', label: 'Money & Paying' },
  { slug: 'transport', label: 'Getting Around' },
  { slug: 'directions', label: 'Directions' },
  { slug: 'shopping', label: 'Shopping' },
  { slug: 'accommodation', label: 'Where You Stay' },
  { slug: 'emergencies', label: 'Emergencies' },
];

export interface PhraseKey {
  slug: string;
  categorySlug: string;
  text: string; // the English phrase to translate
}

/**
 * The key phrases. Order here is the global `ord` for the pack (grouped by the
 * category order above at render time). Keep phrases SHORT and genuinely useful
 * for a traveler — the whole point is a pocket phrasebook, not a course.
 */
export const KEY_PHRASES: PhraseKey[] = [
  // The Basics
  { slug: 'yes', categorySlug: 'basics', text: 'Yes' },
  { slug: 'no', categorySlug: 'basics', text: 'No' },
  { slug: 'do-you-speak-english', categorySlug: 'basics', text: 'Do you speak English?' },
  { slug: 'i-dont-understand', categorySlug: 'basics', text: "I don't understand" },
  { slug: 'can-you-help-me', categorySlug: 'basics', text: 'Can you help me?' },

  // Greetings
  { slug: 'hello', categorySlug: 'greetings', text: 'Hello' },
  { slug: 'goodbye', categorySlug: 'greetings', text: 'Goodbye' },
  { slug: 'good-morning', categorySlug: 'greetings', text: 'Good morning' },
  { slug: 'good-evening', categorySlug: 'greetings', text: 'Good evening' },
  { slug: 'nice-to-meet-you', categorySlug: 'greetings', text: 'Nice to meet you' },

  // Please & Thank You
  { slug: 'please', categorySlug: 'courtesy', text: 'Please' },
  { slug: 'thank-you', categorySlug: 'courtesy', text: 'Thank you' },
  { slug: 'youre-welcome', categorySlug: 'courtesy', text: "You're welcome" },
  { slug: 'excuse-me', categorySlug: 'courtesy', text: 'Excuse me' },
  { slug: 'sorry', categorySlug: 'courtesy', text: 'Sorry' },

  // Eating & Drinking
  { slug: 'a-table-for-two', categorySlug: 'dining', text: 'A table for two, please' },
  { slug: 'the-menu-please', categorySlug: 'dining', text: 'The menu, please' },
  { slug: 'water-please', categorySlug: 'dining', text: 'Water, please' },
  { slug: 'the-check-please', categorySlug: 'dining', text: 'The check, please' },
  { slug: 'it-was-delicious', categorySlug: 'dining', text: 'It was delicious' },

  // Money & Paying
  { slug: 'how-much-is-it', categorySlug: 'money', text: 'How much is it?' },
  { slug: 'too-expensive', categorySlug: 'money', text: "That's too expensive" },
  { slug: 'do-you-take-cards', categorySlug: 'money', text: 'Do you take credit cards?' },
  { slug: 'i-pay-cash', categorySlug: 'money', text: "I'll pay cash" },

  // Getting Around
  { slug: 'i-need-a-taxi', categorySlug: 'transport', text: 'I need a taxi' },
  { slug: 'to-the-airport', categorySlug: 'transport', text: 'To the airport, please' },
  { slug: 'where-is-the-station', categorySlug: 'transport', text: 'Where is the train station?' },
  { slug: 'one-ticket', categorySlug: 'transport', text: 'One ticket, please' },

  // Directions
  { slug: 'where-is-the-bathroom', categorySlug: 'directions', text: 'Where is the bathroom?' },
  { slug: 'is-it-far', categorySlug: 'directions', text: 'Is it far?' },
  { slug: 'left-right-straight', categorySlug: 'directions', text: 'Left, right, or straight?' },

  // Shopping
  { slug: 'im-just-looking', categorySlug: 'shopping', text: "I'm just looking, thanks" },
  {
    slug: 'do-you-have-this-in',
    categorySlug: 'shopping',
    text: 'Do you have this in another size?',
  },

  // Where You Stay
  { slug: 'i-have-a-reservation', categorySlug: 'accommodation', text: 'I have a reservation' },
  { slug: 'is-breakfast-included', categorySlug: 'accommodation', text: 'Is breakfast included?' },

  // Emergencies
  { slug: 'help', categorySlug: 'emergencies', text: 'Help!' },
  { slug: 'call-a-doctor', categorySlug: 'emergencies', text: 'Call a doctor, please' },
  { slug: 'i-am-lost', categorySlug: 'emergencies', text: 'I am lost' },
  { slug: 'where-is-the-hospital', categorySlug: 'emergencies', text: 'Where is the hospital?' },
];
