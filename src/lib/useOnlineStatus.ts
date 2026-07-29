import { useEffect, useState } from 'react';

/** Tracks navigator.onLine, updating on the browser's online/offline events.
 * Defaults to online when the API is unavailable (SSR/old engines), so we never
 * show a false "offline" banner. */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' || navigator.onLine === undefined ? true : navigator.onLine,
  );

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
}
