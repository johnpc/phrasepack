import { useEffect, useRef } from 'react';

/**
 * Modal-dialog focus management: on open, remember what was focused and move
 * focus INTO the dialog (the returned ref's element); on close/unmount, restore
 * focus to whatever had it before. This is the keyboard/screen-reader contract
 * a dialog owes that a static axe scan can't verify. Attach the returned ref to
 * the element that should receive initial focus (e.g. the close button).
 */
export function useDialogFocus<T extends HTMLElement>() {
  const initialRef = useRef<T | null>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    initialRef.current?.focus();
    return () => {
      // Restore focus to the trigger if it's still in the document.
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus();
    };
  }, []);

  return initialRef;
}
