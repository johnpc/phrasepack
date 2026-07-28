import { IonButton, IonContent, IonPage } from '@ionic/react';
import './ErrorFallback.css';

/** The recoverable UI shown when the app-wide ErrorBoundary catches a crash.
 * Kept separate from the boundary (a class component) so the presentation is a
 * simple, testable function component. */
export function ErrorFallback({ onReload }: { onReload: () => void }) {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="pp-error">
          <div className="pp-error__emoji" aria-hidden="true">
            🧭
          </div>
          <h1 className="pp-heading">Something went off the map</h1>
          <p className="pp-muted">
            The app hit an unexpected error. A reload usually sorts it out.
          </p>
          <IonButton onClick={onReload}>Reload</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}
