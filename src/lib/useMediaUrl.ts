import { useQuery } from '@tanstack/react-query';
import { getUrl } from 'aws-amplify/storage';
import { getAudio, putAudio } from './audioCache';

const URL_TTL_SECONDS = 3600; // presigned-URL lifetime

/**
 * Resolve an audio S3 key to a PLAYABLE url, offline-first:
 *   1. If the bytes are cached in IndexedDB, return a local object-URL — plays
 *      with no network (a plane, abroad without data).
 *   2. Otherwise mint a presigned URL, fetch the bytes, cache them for next
 *      time, and return an object-URL. If the fetch fails (offline, uncached),
 *      fall back to the presigned URL directly so an online play still works.
 * Object-URLs are cheap and live for the session; we don't revoke eagerly since
 * a phrase may be replayed, and they're released on reload.
 */
async function resolveUrl(path: string): Promise<string> {
  const cached = await getAudio(path);
  if (cached) return URL.createObjectURL(cached);

  const { url } = await getUrl({
    path,
    options: { validateObjectExistence: false, expiresIn: URL_TTL_SECONDS },
  });
  const remote = url.toString();
  try {
    const blob = await fetch(remote).then((r) => r.blob());
    await putAudio(path, blob);
    return URL.createObjectURL(blob);
  } catch {
    return remote; // couldn't cache (e.g. offline + uncached) — use the URL as-is
  }
}

/**
 * Resolves an S3 audio key to a playable URL (null if no key), caching the bytes
 * for offline playback. Cached long enough that re-renders / repeated plays
 * don't re-resolve within its lifetime.
 */
export function useMediaUrl(path: string | null | undefined): string | null {
  const query = useQuery({
    queryKey: ['media-url', path],
    queryFn: () => resolveUrl(path as string),
    enabled: !!path,
    staleTime: (URL_TTL_SECONDS - 300) * 1000,
    gcTime: URL_TTL_SECONDS * 1000,
  });
  return query.data ?? null;
}
