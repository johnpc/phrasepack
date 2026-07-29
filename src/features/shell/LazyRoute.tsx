import { Suspense, type ReactNode } from 'react';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import './LoadState.css';

/** Suspense boundary for a lazy-loaded route element. IonRouterOutlet only
 * matches DIRECT <Route> children, so the boundary must live INSIDE the route
 * element (not around the outlet). The fallback is a full-page spinner so a
 * deferred chunk load never flashes an empty screen. */
export function LazyRoute({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <IonPage>
          <IonContent className="ion-padding">
            <div className="pp-loadstate" data-testid="route-loading">
              <IonSpinner name="crescent" role="status" aria-label="Loading" />
            </div>
          </IonContent>
        </IonPage>
      }
    >
      {children}
    </Suspense>
  );
}
