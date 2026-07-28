/**
 * S3 put edge for phrase audio (impure). Isolated so handlers compose pure key
 * builders + this I/O; mocked in handler tests. MEDIA_BUCKET is injected by
 * backend.ts.
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({});

/** Put media bytes at `key`; returns the key. */
export async function putMedia(
  bucket: string,
  key: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<string> {
  await s3.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: bytes, ContentType: contentType }),
  );
  return key;
}
