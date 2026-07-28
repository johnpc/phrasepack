import { IonButton, IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './ErrorFallback.css';

/** Friendly catch-all for an unmatched/stale route. */
export function NotFound() {
  const history = useHistory();
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="pp-error">
          <div className="pp-error__emoji" aria-hidden="true">
            🗺️
          </div>
          <h1 className="pp-heading">Page not found</h1>
          <p className="pp-muted">That page doesn’t exist. Let’s get you back to your packs.</p>
          <IonButton onClick={() => history.replace('/home')}>Go home</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}
