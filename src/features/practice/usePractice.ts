import { useMemo, useState } from 'react';
import type { PhraseRecord } from '../../lib/dataClient';
import {
  startSession,
  currentId,
  reveal,
  grade,
  masteredCount,
  isComplete,
  type PracticeState,
} from './practiceSession';

/** Drives a practice session over a pack's phrases. Owns the session state and
 * resolves the current card to its full PhraseRecord for the view. `restart`
 * reshuffles nothing — it just re-queues the deck in pack order for another
 * round. */
export function usePractice(phrases: PhraseRecord[]) {
  const [state, setState] = useState<PracticeState>(() => startSession(phrases));
  const byId = useMemo(() => new Map(phrases.map((p) => [p.id, p])), [phrases]);

  const id = currentId(state);
  const current = id ? (byId.get(id) ?? null) : null;

  return {
    current,
    revealed: state.revealed,
    mastered: masteredCount(state),
    total: state.total,
    complete: isComplete(state),
    reveal: () => setState(reveal),
    grade: (gotIt: boolean) => setState((s) => grade(s, gotIt)),
    restart: () => setState(startSession(phrases)),
  };
}
