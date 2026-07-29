import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { type CatalogLanguage } from './languageCatalog';
import { useGenerate } from './useGenerate';
import { GenerateProgress } from './GenerateProgress';
import { LanguagePicker } from './LanguagePicker';
import './AddLanguage.css';

/** Generate a pack for ANY language (AI): a free-text request or a popular
 * catalog pick. On completion routes to the fresh pack. Guest-first — no
 * account needed to generate. */
export function AddLanguage() {
  const history = useHistory();
  const { phase, languageId, generate } = useGenerate();
  const [picked, setPicked] = useState<CatalogLanguage | null>(null);

  const pick = (c: CatalogLanguage) => {
    setPicked(c);
    generate(c);
  };

  useEffect(() => {
    if (phase === 'done' && languageId) history.replace(`/pack/${languageId}`);
  }, [phase, languageId, history]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Add a language</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="pp-container pp-container--wide">
          {phase === 'idle' ? (
            <LanguagePicker onGenerate={pick} />
          ) : (
            <GenerateProgress
              phase={phase}
              languageName={picked?.name}
              flagEmoji={picked?.flagEmoji}
              onRetry={() => history.replace('/add')}
            />
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
