import { describe, it, expect, vi, beforeEach } from 'vitest';

const send = vi.hoisted(() => vi.fn());
vi.mock('@aws-sdk/client-dynamodb', () => ({ DynamoDBClient: vi.fn() }));
vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: { from: () => ({ send }) },
  PutCommand: vi.fn((input) => ({ kind: 'put', input })),
  UpdateCommand: vi.fn((input) => ({ kind: 'update', input })),
  GetCommand: vi.fn((input) => ({ kind: 'get', input })),
  BatchGetCommand: vi.fn((input) => ({ kind: 'batchGet', input })),
}));

import { putItem, getItem, updateItem, existingIds } from './ddb';

describe('ddb edges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    send.mockResolvedValue({});
  });

  it('putItem sends a PutCommand with the item', async () => {
    await putItem('t', { id: 'x', translation: 'Hola' });
    expect(send.mock.calls[0][0].input).toEqual({
      TableName: 't',
      Item: { id: 'x', translation: 'Hola' },
    });
  });

  it('getItem returns the item or null', async () => {
    send.mockResolvedValueOnce({ Item: { id: 'x' } });
    expect(await getItem('t', 'x')).toEqual({ id: 'x' });
    send.mockResolvedValueOnce({});
    expect(await getItem('t', 'y')).toBeNull();
  });

  it('updateItem builds a SET expression from the fields', async () => {
    await updateItem('t', 'x', { status: 'DRAFT_READY', generatedCount: 3 });
    const cmd = send.mock.calls[0][0].input;
    expect(cmd.Key).toEqual({ id: 'x' });
    expect(cmd.UpdateExpression).toBe('SET #status = :status, #generatedCount = :generatedCount');
    expect(cmd.ExpressionAttributeNames).toEqual({
      '#status': 'status',
      '#generatedCount': 'generatedCount',
    });
    expect(cmd.ExpressionAttributeValues).toEqual({
      ':status': 'DRAFT_READY',
      ':generatedCount': 3,
    });
  });

  it('skips undefined fields (DynamoDB rejects undefined values)', async () => {
    await updateItem('t', 'x', { phraseCount: 3, publishedAt: undefined });
    const cmd = send.mock.calls[0][0].input;
    expect(cmd.UpdateExpression).toBe('SET #phraseCount = :phraseCount');
    expect(cmd.ExpressionAttributeValues).toEqual({ ':phraseCount': 3 });
  });

  it('no-ops when every field is undefined', async () => {
    await updateItem('t', 'x', { publishedAt: undefined });
    expect(send).not.toHaveBeenCalled();
  });

  it('existingIds returns the set of present ids', async () => {
    send.mockResolvedValueOnce({ Responses: { t: [{ id: 'a' }, { id: 'c' }] } });
    const present = await existingIds('t', ['a', 'b', 'c']);
    expect(present).toEqual(new Set(['a', 'c']));
    const cmd = send.mock.calls[0][0].input;
    expect(cmd.RequestItems.t.Keys).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    expect(cmd.RequestItems.t.ProjectionExpression).toBe('id');
  });

  it('existingIds returns an empty set when nothing is present', async () => {
    send.mockResolvedValueOnce({});
    expect(await existingIds('t', ['a'])).toEqual(new Set());
  });

  it('existingIds chunks requests over the 100-id BatchGet limit', async () => {
    const ids = Array.from({ length: 150 }, (_, i) => `id-${i}`);
    send.mockResolvedValueOnce({ Responses: { t: ids.slice(0, 100).map((id) => ({ id })) } });
    send.mockResolvedValueOnce({ Responses: { t: ids.slice(100).map((id) => ({ id })) } });
    const present = await existingIds('t', ids);
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[0][0].input.RequestItems.t.Keys).toHaveLength(100);
    expect(send.mock.calls[1][0].input.RequestItems.t.Keys).toHaveLength(50);
    expect(present.size).toBe(150);
  });
});
