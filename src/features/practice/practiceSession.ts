/**
 * Pure practice-session logic — a lightweight flashcard drill over a pack's
 * phrases. Each card shows the English prompt; the learner reveals the
 * translation + phonetic + audio, then self-grades. "Got it" advances; "Practice
 * again" re-queues the card near the end so it comes back this session. The
 * session ends when every card has been graded "got it" at least once. Kept a
 * pure reducer so ordering + progress are unit-testable with no React.
 */
import type { PhraseRecord } from '../../lib/dataClient';

export interface PracticeState {
  /** Phrase ids still to get right, in queue order (current = queue[0]). */
  queue: string[];
  /** Ids the learner has answered "got it" (may re-appear if re-queued). */
  mastered: Set<string>;
  /** Total cards in the deck — the denominator for progress. */
  total: number;
  revealed: boolean;
}

/** Build the initial session from a pack's phrases (deck order = pack order). */
export function startSession(phrases: PhraseRecord[]): PracticeState {
  return {
    queue: phrases.map((p) => p.id),
    mastered: new Set(),
    total: phrases.length,
    revealed: false,
  };
}

/** The current card's phrase id, or null when the session is complete. */
export function currentId(state: PracticeState): string | null {
  return state.queue[0] ?? null;
}

/** Reveal the current card's answer. */
export function reveal(state: PracticeState): PracticeState {
  return { ...state, revealed: true };
}

/** Grade the current card. `gotIt` removes it (and marks mastered); otherwise it
 * moves to the back of the queue to return later. Either way, un-reveal for the
 * next card. A no-op on an empty queue. */
export function grade(state: PracticeState, gotIt: boolean): PracticeState {
  const [head, ...rest] = state.queue;
  if (head === undefined) return state;
  const mastered = new Set(state.mastered);
  if (gotIt) {
    mastered.add(head);
    return { ...state, queue: rest, mastered, revealed: false };
  }
  return { ...state, queue: [...rest, head], revealed: false };
}

/** Cards mastered so far — the progress numerator (capped at total). */
export function masteredCount(state: PracticeState): number {
  return Math.min(state.mastered.size, state.total);
}

export const isComplete = (state: PracticeState): boolean => state.queue.length === 0;
