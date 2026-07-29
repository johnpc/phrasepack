import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, persistOptions } from './lib/queryClient';
import { ThemeProvider } from './features/settings/ThemeProvider';
import { ErrorBoundary } from './features/shell/ErrorBoundary';
import { OfflineBanner } from './features/shell/OfflineBanner';
import { Toast } from './features/shell/Toast';
import { AppRoutes } from './AppRoutes';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Brand fonts (bundled) + design tokens. Dark mode is driven by our own --pp-*
 * tokens (prefers-color-scheme + a data-theme override), not Ionic's palette. */
import './theme/fonts';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <ThemeProvider>
        <IonReactRouter>
          <OfflineBanner />
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
          <Toast />
        </IonReactRouter>
      </ThemeProvider>
    </PersistQueryClientProvider>
  </IonApp>
);

export default App;
