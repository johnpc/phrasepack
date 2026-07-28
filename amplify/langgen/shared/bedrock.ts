/**
 * Thin isolation wrapper over Bedrock (Claude) — the only impure text-AI unit.
 * Mocked in handler tests; all prompt/parse logic lives in pure modules.
 *
 * Claude Haiku 4.5: our task is small, tool-forced, schema-bound output
 * (translate a fixed list of short phrases + give a phonetic reading) — not
 * reasoning-heavy — and the result is parsed + validated in code, so Haiku's
 * quality is ample at ~10x lower cost. This is the single text-generation entry
 * point for the app; bump the constant if a task ever needs a stronger model.
 */
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export const TEXT_MODEL_ID = 'us.anthropic.claude-haiku-4-5-20251001-v1:0';

const client = new BedrockRuntimeClient({});

/** Invoke Claude with a prepared Anthropic body; return decoded JSON. */
export async function invokeText(body: string): Promise<unknown> {
  const res = await client.send(
    new InvokeModelCommand({
      modelId: TEXT_MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body,
    }),
  );
  return JSON.parse(new TextDecoder().decode(res.body));
}
