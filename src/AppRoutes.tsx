import { Redirect, Route } from 'react-router-dom';
import { IonRouterOutlet } from '@ionic/react';
import { Home } from './features/phrasebook/Home';
import { PackDetail } from './features/phrasebook/PackDetail';
import { AddLanguage } from './features/phrasebook/AddLanguage';
import { Settings } from './features/settings/Settings';
import { NotFound } from './features/shell/NotFound';

/** App routes. Guest-first: every screen is reachable without an account.
 * IonRouterOutlet matches only DIRECT Route children, so keep them flat. */
export function AppRoutes() {
  return (
    <IonRouterOutlet>
      <Route exact path="/home">
        <Home />
      </Route>
      <Route exact path="/add">
        <AddLanguage />
      </Route>
      <Route exact path="/pack/:id">
        <PackDetail />
      </Route>
      <Route exact path="/settings">
        <Settings />
      </Route>
      <Route exact path="/">
        <Redirect to="/home" />
      </Route>
      {/* Catch-all 404 — a pathless route matches anything above didn't. */}
      <Route>
        <NotFound />
      </Route>
    </IonRouterOutlet>
  );
}
