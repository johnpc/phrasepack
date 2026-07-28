import type { PhraseRecord } from '../../lib/dataClient';
import { PlayButton } from './PlayButton';
import './PhraseRow.css';

/** One phrase: the foreign translation as the hero, the English source beneath,
 * the phonetic reading as a chip, and a play button for the spoken audio. */
export function PhraseRow({ phrase }: { phrase: PhraseRecord }) {
  return (
    <li className="pp-row" data-testid="phrase-row">
      <div className="pp-row__text">
        <p
          className="pp-row__translation pp-phrase"
          lang={undefined}
          data-testid="phrase-translation"
        >
          {phrase.translation}
        </p>
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
