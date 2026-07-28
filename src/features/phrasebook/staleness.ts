/**
 * Pure staleness check for the "new phrases available — refresh this pack"
 * prompt. A pack records the phrase-catalog KEY_VERSION it was generated
 * against; when the catalog grows (new key phrases added, version bumped), any
 * pack on an older version is missing those phrases and can be refreshed.
 *
 * CURRENT_KEY_VERSION mirrors KEY_VERSION in amplify/langgen/shared/phraseKeys.ts
 * — bump both together when the catalog changes. Kept as a plain client
 * constant (not a backend read) so the check is a cheap local comparison.
 */
export const CURRENT_KEY_VERSION = 1;

/** True when a pack predates the current phrase catalog (has fillable gaps). */
export function isStale(
  keyVersion: number | null | undefined,
  current: number = CURRENT_KEY_VERSION,
): boolean {
  return (keyVersion ?? 0) < current;
}
