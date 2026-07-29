import { IonIcon } from '@ionic/react';
import { cloudOfflineOutline } from 'ionicons/icons';
import { useOnlineStatus } from '../../lib/useOnlineStatus';
import './OfflineBanner.css';

/** A slim bar shown only when the device is offline. Reassures the traveler
 * that packs they've already opened still work, while setting the expectation
 * that generating a new language or first-time audio needs a connection.
 * role=status so assistive tech announces the change without stealing focus. */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className="pp-offline" role="status" data-testid="offline-banner">
      <IonIcon icon={cloudOfflineOutline} aria-hidden="true" />
      <span>You’re offline — saved packs still work; new languages need a connection.</span>
    </div>
  );
}
