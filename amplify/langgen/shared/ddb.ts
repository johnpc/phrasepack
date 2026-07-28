/**
 * DynamoDB edges for the langgen pipeline. The Lambdas write straight to the
 * Amplify-managed tables via their IAM roles (bypassing AppSync, like stoop's
 * ingestion) — so they set the Amplify metadata (__typename, timestamps)
 * themselves. Table names are injected by backend.ts. Mocked in handler tests.
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  GetCommand,
  BatchGetCommand,
} from '@aws-sdk/lib-dynamodb';

const doc = DynamoDBDocumentClient.from(new DynamoDBClient({}));

/** Put a fully-formed item (caller supplies id/__typename/timestamps). */
export async function putItem(table: string, item: Record<string, unknown>): Promise<void> {
  await doc.send(new PutCommand({ TableName: table, Item: item }));
}

/** Get an item by id (GetItem — no GSI coupling). Returns null if absent. */
export async function getItem(table: string, id: string): Promise<Record<string, unknown> | null> {
  const res = await doc.send(new GetCommand({ TableName: table, Key: { id } }));
  return res.Item ?? null;
}

/** Set named attributes on an item by id. Undefined values are skipped —
 * DynamoDB rejects an undefined attribute value, so an optional field (e.g.
 * audio that failed to synthesize) is simply omitted rather than failing. */
export async function updateItem(
  table: string,
  id: string,
  fields: Record<string, unknown>,
): Promise<void> {
  const keys = Object.keys(fields).filter((k) => fields[k] !== undefined);
  if (keys.length === 0) return;
  const names = Object.fromEntries(keys.map((k) => [`#${k}`, k]));
  const values = Object.fromEntries(keys.map((k) => [`:${k}`, fields[k]]));
  await doc.send(
    new UpdateCommand({
      TableName: table,
      Key: { id },
      UpdateExpression: `SET ${keys.map((k) => `#${k} = :${k}`).join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    }),
  );
}

const BATCH_GET_MAX = 100; // DynamoDB BatchGetItem hard limit per request

/** Which of the given ids currently exist in the table (by GetItem key). Used
 * by a REGENERATE to skip catalog keys already produced — deterministic phrase
 * ids mean this is a keys-only batch lookup, no GSI. Returns the present ids. */
export async function existingIds(table: string, ids: string[]): Promise<Set<string>> {
  const present = new Set<string>();
  for (let i = 0; i < ids.length; i += BATCH_GET_MAX) {
    const chunk = ids.slice(i, i + BATCH_GET_MAX);
    const res = await doc.send(
      new BatchGetCommand({
        RequestItems: {
          [table]: { Keys: chunk.map((id) => ({ id })), ProjectionExpression: 'id' },
        },
      }),
    );
    for (const item of res.Responses?.[table] ?? []) present.add(String(item.id));
  }
  return present;
}
