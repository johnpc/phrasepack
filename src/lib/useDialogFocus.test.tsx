import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { useDialogFocus } from './useDialogFocus';

function Dialog() {
  const ref = useDialogFocus<HTMLButtonElement>();
  return (
    <button ref={ref} data-testid="dialog-close">
      Close
    </button>
  );
}

describe('useDialogFocus', () => {
  it('moves focus to the ref element on mount', () => {
    const { getByTestId } = render(<Dialog />);
    expect(document.activeElement).toBe(getByTestId('dialog-close'));
  });

  it('restores focus to the previously-focused element on unmount', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { getByTestId, unmount } = render(<Dialog />);
    expect(document.activeElement).toBe(getByTestId('dialog-close'));

    unmount();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('does not throw when the previous element is gone at unmount', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    const { unmount } = render(<Dialog />);
    trigger.remove(); // trigger left the DOM before close
    expect(() => unmount()).not.toThrow();
  });
});
