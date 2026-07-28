import { describe, it, expect } from 'vitest';
import { buildTranslateRequest } from './phrasesPrompt';

interface ParsedBody {
  anthropic_version: string;
  max_tokens: number;
  system: string;
  tools: { name: string }[];
  tool_choice: { type: string; name: string };
  messages: { role: string; content: string }[];
}

describe('buildTranslateRequest', () => {
  const req = {
    languageName: 'Spanish (Spain)',
    locale: 'es-ES',
    phrases: [
      { slug: 'thank-you', text: 'Thank you' },
      { slug: 'hello', text: 'Hello' },
    ],
  };

  it('returns valid JSON with the tool-forced Anthropic envelope', () => {
    const body = JSON.parse(buildTranslateRequest(req)) as ParsedBody;
    expect(body.anthropic_version).toBe('bedrock-2023-05-31');
    expect(body.max_tokens).toBe(8192);
    expect(body.tools[0].name).toBe('translate_phrases');
  });

  it('forces the translate_phrases tool via tool_choice', () => {
    const body = JSON.parse(buildTranslateRequest(req)) as ParsedBody;
    expect(body.tool_choice).toEqual({ type: 'tool', name: 'translate_phrases' });
  });

  it('lists every phrase with its slug in the user message', () => {
    const body = JSON.parse(buildTranslateRequest(req)) as ParsedBody;
    const content = body.messages[0].content;
    expect(body.messages[0].role).toBe('user');
    expect(content).toContain('[thank-you] Thank you');
    expect(content).toContain('[hello] Hello');
  });

  it('names the language and locale in the system prompt', () => {
    const body = JSON.parse(buildTranslateRequest(req)) as ParsedBody;
    expect(body.system).toContain('Spanish (Spain)');
    expect(body.system).toContain('es-ES');
  });
});
