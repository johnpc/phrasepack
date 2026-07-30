import { describe, it, expect } from 'vitest';
import {
  startSession,
  currentId,
  reveal,
  grade,
  masteredCount,
  isComplete,
} from './practiceSession';
import type { PhraseRecord } from '../../lib/dataClient';

const deck = (...ids: string[]): PhraseRecord[] => ids.map((id) => ({ id }) as PhraseRecord);

describe('practiceSession', () => {
  it('starts with the deck queued in order, nothing mastered, not revealed', () => {
    const s = startSession(deck('a', 'b', 'c'));
    expect(currentId(s)).toBe('a');
    expect(s.total).toBe(3);
    expect(masteredCount(s)).toBe(0);
    expect(s.revealed).toBe(false);
    expect(isComplete(s)).toBe(false);
  });

  it('reveal flips the revealed flag', () => {
    expect(reveal(startSession(deck('a'))).revealed).toBe(true);
  });

  it('"got it" masters the card, advances, and re-hides the answer', () => {
    let s = reveal(startSession(deck('a', 'b')));
    s = grade(s, true);
    expect(currentId(s)).toBe('b');
    expect(masteredCount(s)).toBe(1);
    expect(s.revealed).toBe(false);
  });

  it('"practice again" re-queues the card to the back, not mastered', () => {
    let s = startSession(deck('a', 'b'));
    s = grade(s, false);
    expect(currentId(s)).toBe('b'); // a moved to the back
    expect(masteredCount(s)).toBe(0);
    s = grade(s, true); // b
    s = grade(s, true); // a comes back
    expect(isComplete(s)).toBe(true);
    expect(masteredCount(s)).toBe(2);
  });

  it('is complete once every card is "got it"', () => {
    let s = startSession(deck('a', 'b'));
    s = grade(s, true);
    s = grade(s, true);
    expect(isComplete(s)).toBe(true);
    expect(currentId(s)).toBeNull();
  });

  it('grade is a no-op on an empty queue', () => {
    const empty = startSession(deck());
    expect(grade(empty, true)).toEqual(empty);
  });
});
