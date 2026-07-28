import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonItem,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useTheme } from './useTheme';
import type { ThemeMode } from './theme';

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/** Settings — currently the appearance (theme) override. Light/Dark force the
 * scheme; System follows the OS. Persisted via ThemeProvider. */
export function Settings() {
  const { mode, setMode } = useTheme();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="pp-container">
          <h2 className="pp-kicker">Appearance</h2>
          {/* No IonList wrapper: it renders role="list" but its radio-group
              children don't present as listitems (axe aria-required-children).
              A radio group isn't a list anyway — the group carries the
              semantics; each IonItem just supplies the row chrome. */}
          <IonRadioGroup
            value={mode}
            onIonChange={(e) => setMode(e.detail.value as ThemeMode)}
            data-testid="theme-group"
          >
            {OPTIONS.map((o) => (
              <IonItem key={o.value}>
                {/* The label is the radio's own child + aria-label so it's the
                    control's accessible name (a separate IonLabel leaves the
                    radio unnamed — axe aria-toggle-field-name). */}
                <IonRadio
                  justify="space-between"
                  value={o.value}
                  data-testid={`theme-${o.value}`}
                  aria-label={o.label}
                >
                  {o.label}
                </IonRadio>
              </IonItem>
            ))}
          </IonRadioGroup>
        </div>
      </IonContent>
    </IonPage>
  );
}
