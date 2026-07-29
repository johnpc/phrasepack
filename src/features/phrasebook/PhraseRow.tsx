import { IonIcon } from '@ionic/react';
import { star, starOutline } from 'ionicons/icons';
import type { PhraseRecord } from '../../lib/dataClient';
import { PlayButton } from './PlayButton';
import './PhraseRow.css';

/** One phrase: a favorite star, the foreign translation as the hero, the
 * English source beneath, the phonetic reading as a chip, and a play button for
 * the spoken audio. Tapping the translation opens the full-screen "show it"
 * view (when onShow is provided). */
export function PhraseRow({
  phrase,
  isFavorite = false,
  onToggleFavorite,
  onShow,
}: {
  phrase: PhraseRecord;
  isFavorite?: boolean;
  onToggleFavorite?: (slug: string) => void;
  onShow?: (phrase: PhraseRecord) => void;
}) {
  return (
    <li className="pp-row" data-testid="phrase-row">
      {onToggleFavorite && (
        <button
          className="pp-row__star"
          data-testid="phrase-favorite"
          data-favorite={isFavorite}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite ? `Unfavorite ${phrase.sourceText}` : `Favorite ${phrase.sourceText}`
          }
          onClick={() => onToggleFavorite(phrase.phraseKeySlug)}
        >
          <IonIcon icon={isFavorite ? star : starOutline} aria-hidden="true" />
        </button>
      )}
      <div className="pp-row__text">
        {onShow ? (
          <button
            className="pp-row__translation pp-row__translation--show pp-phrase"
            data-testid="phrase-show"
            aria-label={`Show ${phrase.sourceText} full screen`}
            onClick={() => onShow(phrase)}
          >
            {phrase.translation}
          </button>
        ) : (
          <p className="pp-row__translation pp-phrase" data-testid="phrase-translation">
            {phrase.translation}
          </p>
        )}
        <p className="pp-row__source pp-muted">{phrase.sourceText}</p>
        {phrase.phonetic && (
          <span className="pp-row__phonetic" data-testid="phrase-phonetic">
            {phrase.phonetic}
          </span>
        )}
      </div>
      <PlayButton audioPath={phrase.audioPath} label={phrase.sourceText} />
    </li>
  );
}
