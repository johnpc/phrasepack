import { lazy } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import { Home } from './features/phrasebook/Home';
import { PackDetail } from './features/phrasebook/PackDetail';
import { LazyRoute } from './features/shell/LazyRoute';

// Home + PackDetail stay EAGER: Home is the landing route (instant first paint),
// and PackDetail is the OFFLINE-critical surface — reading a saved pack must not
// depend on fetching a JS chunk with no connection. The rest need the network
// anyway (generation, settings, a mistyped route), so lazy-load them to trim the
// initial mobile download; they fetch on navigation.
const AddLanguage = lazy(() =>
  import('./features/phrasebook/AddLanguage').then((m) => ({ default: m.AddLanguage })),
);
const Settings = lazy(() =>
  import('./features/settings/Settings').then((m) => ({ default: m.Settings })),
);
const NotFound = lazy(() =>
  import('./features/shell/NotFound').then((m) => ({ default: m.NotFound })),
);

/** App routes. Guest-first: every screen is reachable without an account.
 * IonRouterOutlet matches only DIRECT Route children, so keep them flat — and
 * the Suspense boundary lives INSIDE each lazy route element, not around the
 * outlet. */
export function AppRoutes() {
  return (
    <IonRouterOutlet>
      <Route exact path="/home">
        <Home />
      </Route>
      <Route exact path="/add">
        <LazyRoute>
          <AddLanguage />
        </LazyRoute>
      </Route>
      <Route exact path="/pack/:id">
        <PackDetail />
      </Route>
      <Route exact path="/settings">
        <LazyRoute>
          <Settings />
        </LazyRoute>
      </Route>
      <Route exact path="/">
        <Redirect to="/home" />
      </Route>
      {/* Catch-all 404 — a pathless route matches anything above didn't. */}
      <Route>
        <LazyRoute>
          <NotFound />
        </LazyRoute>
      </Route>
    </IonRouterOutlet>
  );
}
