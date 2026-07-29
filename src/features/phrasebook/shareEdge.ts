/**
 * Impure share edge — isolated so the hook stays testable. Prefers the native
 * Web Share sheet; falls back to copying the link to the clipboard. Returns the
 * outcome so the UI can give the right feedback:
 *   'shared'    — the native sheet completed
 *   'copied'    — no native share; link copied to clipboard
 *   'cancelled' — the user dismissed the native sheet (no error)
 *   'failed'    — neither path worked
 */
import type { SharePayload } from './sharePayload';

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError';
}

export async function sharePack(payload: SharePayload): Promise<ShareOutcome> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(payload);
      return 'shared';
    } catch (err) {
      if (isAbort(err)) return 'cancelled';
      // fall through to clipboard on a genuine share failure
    }
  }
  try {
    await navigator.clipboard.writeText(payload.url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
