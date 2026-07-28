import { useQuery } from '@tanstack/react-query';
import { getUrl } from 'aws-amplify/storage';

const URL_TTL_SECONDS = 3600; // presigned-URL lifetime

async function resolveUrl(path: string): Promise<string> {
  const { url } = await getUrl({
    path,
    options: {
      // Skip the HEAD existence check — it adds a round-trip per media item and
      // we already know the key exists (it's stored on the record).
      validateObjectExistence: false,
      expiresIn: URL_TTL_SECONDS,
    },
  });
  return url.toString();
}

/**
 * Resolves an S3 audio key to a presigned URL (null if no key). Cached long
 * enough that re-renders / repeated plays don't re-mint the URL within its
 * lifetime.
 */
export function useMediaUrl(path: string | null | undefined): string | null {
  const query = useQuery({
    queryKey: ['media-url', path],
    queryFn: () => resolveUrl(path as string),
    enabled: !!path,
    staleTime: (URL_TTL_SECONDS - 300) * 1000, // refresh a bit before expiry
    gcTime: URL_TTL_SECONDS * 1000,
  });
  return query.data ?? null;
}
