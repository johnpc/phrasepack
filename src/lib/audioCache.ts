/**
 * Offline audio cache. Phrase audio is served from a short-lived presigned S3
 * URL, so a pack that's cached for offline reading still couldn't PLAY with no
 * signal — the URL fetch fails. This stores the audio bytes in IndexedDB keyed
 * by the stable S3 path, so once a phrase has been played (online), it plays
 * forever after, offline included. Keeps the impure IDB/Blob work in one place
 * behind a tiny promise API; a null return just means "not cached, fall back to
 * the network". Every call degrades gracefully if IndexedDB is unavailable.
 */
const DB_NAME = 'phrasepack-audio';
const STORE = 'clips';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = run(db.transaction(STORE, mode).objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

/** Store audio bytes for a path (no-op on any failure — caching is best-effort).
 * IndexedDB structured-clones a Blob natively in every real browser. */
export async function putAudio(path: string, blob: Blob): Promise<void> {
  try {
    await tx('readwrite', (s) => s.put(blob, path));
  } catch {
    /* private mode / no IDB / quota — the network path still works */
  }
}

/** The cached audio Blob for a path, or null if not cached / unavailable. */
export async function getAudio(path: string): Promise<Blob | null> {
  try {
    const stored = await tx<Blob | undefined>('readonly', (s) => s.get(path));
    return stored instanceof Blob ? stored : null;
  } catch {
    return null;
  }
}
