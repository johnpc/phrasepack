import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePractice } from './usePractice';
import type { PhraseRecord } from '../../lib/dataClient';

const deck = [
  { id: 'a', sourceText: 'Hello', translation: 'Hola' },
  { id: 'b', sourceText: 'Bye', translation: 'Adiós' },
] as PhraseRecord[];

describe('usePractice', () => {
  it('exposes the current phrase and reveal/grade flow to completion', () => {
    const { result } = renderHook(() => usePractice(deck));
    expect(result.current.current?.id).toBe('a');
    expect(result.current.total).toBe(2);
    expect(result.current.revealed).toBe(false);

    act(() => result.current.reveal());
    expect(result.current.revealed).toBe(true);

    act(() => result.current.grade(true));
    expect(result.current.current?.id).toBe('b');
    expect(result.current.mastered).toBe(1);

    act(() => result.current.grade(true));
    expect(result.current.complete).toBe(true);
  });

  it('restart re-queues the whole deck', () => {
    const { result } = renderHook(() => usePractice(deck));
    act(() => result.current.grade(true));
    act(() => result.current.grade(true));
    expect(result.current.complete).toBe(true);
    act(() => result.current.restart());
    expect(result.current.complete).toBe(false);
    expect(result.current.current?.id).toBe('a');
    expect(result.current.mastered).toBe(0);
  });
});
