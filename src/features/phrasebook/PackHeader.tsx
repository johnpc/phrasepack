import type { LanguageRecord } from '../../lib/dataClient';
import './PackHeader.css';

/** The pack-detail hero: a big flag, the language name + endonym, and the
 * phrase count. Gives the screen a sense of place before the phrase list. */
export function PackHeader({ language }: { language: LanguageRecord }) {
  return (
    <header className="pp-packhead" data-testid="pack-header">
      <span className="pp-packhead__flag" aria-hidden="true">
        {language.flagEmoji ?? '🌐'}
      </span>
      <div className="pp-packhead__meta">
        <h1 className="pp-packhead__name pp-heading">{language.name}</h1>
        <p className="pp-packhead__sub pp-muted">
          {language.nativeName ? `${language.nativeName} · ` : ''}
          {language.phraseCount ?? 0} phrases
        </p>
      </div>
    </header>
  );
}
