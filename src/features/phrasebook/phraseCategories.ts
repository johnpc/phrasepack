/**
 * Client mirror of the backend phrase categories (amplify/langgen/shared/
 * phraseKeys.ts CATEGORIES) — the order + labels for the pack-detail sections.
 * DATA; kept in sync with the backend by hand (both are small and stable).
 */
import type { PhraseCategoryMeta } from './groupPhrases';

export const PHRASE_CATEGORIES: PhraseCategoryMeta[] = [
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
