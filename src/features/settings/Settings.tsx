import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonList,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonItem,
  IonLabel,
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
          <IonList>
            <IonRadioGroup
              value={mode}
              onIonChange={(e) => setMode(e.detail.value as ThemeMode)}
              data-testid="theme-group"
            >
              {OPTIONS.map((o) => (
                <IonItem key={o.value}>
                  <IonLabel>{o.label}</IonLabel>
                  <IonRadio slot="end" value={o.value} data-testid={`theme-${o.value}`} />
                </IonItem>
              ))}
            </IonRadioGroup>
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
}
