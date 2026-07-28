/**
 * Pure bounded-concurrency map: run `fn` over items, at most `limit` in flight,
 * preserving result order. Caps Polly calls so a full catalog doesn't fan out
 * N parallel SynthesizeSpeech requests and trip TPS limits.
 */
export async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  const size = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: size }, () => worker()));
  return results;
}
