import { type ReactNode } from 'react';
import { IonSpinner } from '@ionic/react';
import './LoadState.css';

export interface LoadStateProps {
  isLoading: boolean;
  isError?: boolean;
  /** Loaded, but there is nothing to show. Error takes priority over empty. */
  isEmpty?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
  children: ReactNode;
}

/**
 * The shared four-state wrapper every data screen uses so load/error/empty
 * handling is uniform and tested once. A data fetch has FOUR outcomes, not two:
 *   - loading → a spinner
 *   - error   → a friendly, RETRYABLE message (never a dead spinner)
 *   - empty   → a titled empty state, DISTINCT from loading
 *   - ready   → the children
 * Error takes priority over empty (a failed fetch resolving to [] must not read
 * as "empty"). Every fetch hook must expose isError alongside isLoading, or a
 * failure silently hangs on the spinner.
 */
export function LoadState({
  isLoading,
  isError,
  isEmpty,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyMessage,
  children,
}: LoadStateProps) {
  if (isError) {
    return (
      <div className="pp-loadstate" role="alert" data-testid="load-error">
        <div className="pp-loadstate__emoji" aria-hidden="true">
          😕
        </div>
        <p className="pp-loadstate__title pp-heading">Couldn’t load that</p>
        <p className="pp-muted">Check your connection and try again.</p>
        {onRetry && (
          <button className="pp-loadstate__retry" onClick={onRetry} data-testid="load-retry">
            Retry
          </button>
        )}
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="pp-loadstate" data-testid="load-spinner">
        <IonSpinner name="crescent" />
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="pp-loadstate" data-testid="load-empty">
        <div className="pp-loadstate__emoji" aria-hidden="true">
          🧳
        </div>
        <p className="pp-loadstate__title pp-heading">{emptyTitle}</p>
        {emptyMessage && <p className="pp-muted">{emptyMessage}</p>}
      </div>
    );
  }
  return <>{children}</>;
}
