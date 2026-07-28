/**
 * Pure builder for the Bedrock (Claude) request that translates a batch of key
 * phrases into a target language with a phonetic reading. Tool-forced
 * structured output: a single `translate_phrases` tool + tool_choice, so Claude
 * must return exactly the typed array (native structured outputs are rejected
 * on the InvokeModel bedrock-2023-05-31 envelope, so tool-forcing is the proven
 * route). Kept separate from the network call so prompt + schema are unit-
 * testable without AWS.
 */
export interface PhraseToTranslate {
  slug: string;
  text: string; // the English phrase
}

export interface TranslatePhrasesRequest {
  /** Target language English name, e.g. "Spanish (Spain)". */
  languageName: string;
  /** BCP-47 locale, e.g. "es-ES" — nudges regional spelling/register. */
  locale: string;
  phrases: PhraseToTranslate[];
}

const TOOL = {
  name: 'translate_phrases',
  description: 'Translate each English travel phrase into the target language.',
  input_schema: {
    type: 'object',
    properties: {
      translations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            slug: {
              type: 'string',
              description: 'the phrase slug, copied verbatim from the input',
            },
            translation: {
              type: 'string',
              description: 'the phrase in the target language, with correct spelling and accents',
            },
            phonetic: {
              type: 'string',
              description:
                'a simple pronunciation for an English speaker (Latin letters, syllables ' +
                'separated by hyphens, STRESSED syllable in CAPS), e.g. "GRAH-see-as"',
            },
          },
          required: ['slug', 'translation', 'phonetic'],
        },
      },
    },
    required: ['translations'],
  },
} as const;

/** Build the Anthropic-native Messages body for InvokeModel (tool-forced). */
export function buildTranslateRequest(req: TranslatePhrasesRequest): string {
  const system = [
    `You are an expert translator and travel-phrasebook author for ${req.languageName} (${req.locale}).`,
    'Translate each English phrase into natural, polite, traveler-appropriate language.',
    'Use the correct native script, spelling, and accents for the target language.',
    'For "phonetic", give an approximate pronunciation an English speaker can read aloud:',
    'Latin letters only, syllables separated by hyphens, the STRESSED syllable in CAPS.',
    "Copy each phrase's slug verbatim so answers can be matched. Call translate_phrases exactly once.",
  ].join('\n');
  const list = req.phrases.map((p) => `- [${p.slug}] ${p.text}`).join('\n');
  return JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 8192,
    system,
    tools: [TOOL],
    tool_choice: { type: 'tool', name: TOOL.name },
    messages: [{ role: 'user', content: `Translate these phrases:\n${list}` }],
  });
}
