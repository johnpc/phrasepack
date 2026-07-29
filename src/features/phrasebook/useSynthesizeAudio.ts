import { useMutation, useQueryClient } from '@tanstack/react-query';
import { synthesizePhraseAudio } from './generateApi';

/** On-demand audio for one phrase. Calls the synth mutation; on success it
 * returns the new S3 path AND invalidates the pack's phrase list so the row
 * re-renders with audio. The caller uses the returned path immediately (to play
 * without waiting for the refetch). */
export function useSynthesizeAudio(languageId: string) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (phraseId: string) => synthesizePhraseAudio(phraseId),
    onSuccess: (path) => {
      // Empty path = no voice for this language; nothing changed, don't refetch.
      if (path) void qc.invalidateQueries({ queryKey: ['phrases', languageId] });
    },
  });
  return {
    synthesize: mutation.mutateAsync,
    isSynthesizing: mutation.isPending,
  };
}
