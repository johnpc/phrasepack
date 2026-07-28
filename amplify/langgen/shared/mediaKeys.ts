/**
 * Pure helper for phrase audio S3 keys. Audio lives under
 * media/phrases/<languageId>/ (the prefix the storage policy grants), keyed by
 * phrase id so each phrase owns one stable MP3 object.
 */
export function phraseAudioKey(languageId: string, phraseId: string): string {
  return `media/phrases/${languageId}/${phraseId}.mp3`;
}
