import { QueryClient, MutationCache } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';
import { showToast } from '../features/shell/toastBus';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** App-wide react-query client. Server state (Amplify data) lives here. A
 * global mutation onError surfaces a toast so a failed action (generate a
 * language, …) tells the traveler instead of failing silently.
 *
 * `gcTime` is a week so cached packs survive long enough to be persisted +
 * rehydrated for offline reading (see persistOptions). */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      gcTime: ONE_WEEK_MS,
      // offlineFirst: serve cached data immediately even with no connection
      // (the default 'online' mode PAUSES queries offline, so a rehydrated pack
      // would spin instead of showing). A fetch is still attempted when online.
      networkMode: 'offlineFirst',
    },
  },
  mutationCache: new MutationCache({
    onError: () => showToast('Something went wrong. Check your connection and try again.'),
  }),
});

/** Persist the query cache to localStorage so packs a traveler has already
 * opened still render offline (abroad, no data). Options for
 * PersistQueryClientProvider. Presigned media URLs are excluded — they expire,
 * so a stale one is worse than re-minting; everything else (language + phrase
 * lists) is safe to rehydrate. */
export const persistOptions: Omit<PersistQueryClientOptions, 'queryClient'> = {
  persister: createSyncStoragePersister({ storage: window.localStorage, key: 'pp-query-cache' }),
  maxAge: ONE_WEEK_MS,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => query.queryKey[0] !== 'media-url',
  },
};
