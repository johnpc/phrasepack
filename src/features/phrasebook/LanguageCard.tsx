import { IonIcon } from '@ionic/react';
import { chevronForward, sparkles } from 'ionicons/icons';
import type { LanguageRecord } from '../../lib/dataClient';
import { isStale } from './staleness';
import './LanguageCard.css';

/** One language pack on the Home grid: flag, name, phrase count, and a "new
 * phrases" badge when the pack predates the current phrase catalog. */
export function LanguageCard({
  language,
  onOpen,
}: {
  language: LanguageRecord;
  onOpen: (id: string) => void;
}) {
  const stale = isStale(language.keyVersion);
  return (
    <button
      className="pp-langcard"
      data-testid="language-card"
      onClick={() => onOpen(language.id)}
      aria-label={`Open ${language.name}`}
    >
      <span className="pp-langcard__flag" aria-hidden="true">
        {language.flagEmoji ?? '🌐'}
      </span>
      <span className="pp-langcard__body">
        <span className="pp-langcard__name pp-heading">{language.name}</span>
        <span className="pp-langcard__meta pp-muted">
          {language.nativeName ? `${language.nativeName} · ` : ''}
          {language.phraseCount ?? 0} phrases
        </span>
        {stale && (
          <span className="pp-langcard__badge" data-testid="new-phrases-badge">
            <IonIcon icon={sparkles} aria-hidden="true" /> New phrases available
          </span>
        )}
      </span>
      <IonIcon className="pp-langcard__chev" icon={chevronForward} aria-hidden="true" />
    </button>
  );
}
