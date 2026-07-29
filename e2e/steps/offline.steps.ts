import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('a visitor has viewed the {string} pack while online', async ({ page }, name: string) => {
  // Populate + persist the query cache: open home, the pack, then back to home.
  await page.goto('/home');
  const card = page.getByRole('button', { name: `Open ${name}` });
  await expect(card).toBeVisible({ timeout: 15_000 });
  await card.click();
  await expect(page.getByTestId('phrase-sections')).toBeVisible({ timeout: 15_000 });
  // Wait — WHILE STILL ON THE PACK PAGE (a full navigation aborts the pending
  // throttled write) — for the persisted cache to hold the phrases query WITH
  // ROWS. Checking only that the key exists isn't enough: pagination can persist
  // an empty snapshot mid-load, which rehydrates offline as "No phrases yet"
  // (the CI failure). Poll until a persisted phrases query has data.
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          try {
            const cache = JSON.parse(window.localStorage.getItem('pp-query-cache') ?? '{}');
            const queries = cache?.clientState?.queries ?? [];
            const phrases = queries.find(
              (q: { queryKey: unknown[] }) => q.queryKey?.[0] === 'phrases',
            );
            return Array.isArray(phrases?.state?.data) && phrases.state.data.length > 0;
          } catch {
            return false;
          }
        }),
      { timeout: 20_000 },
    )
    .toBe(true);
  await page.goto('/home');
  await expect(card).toBeVisible({ timeout: 15_000 });
});

When('their connection drops and they reopen the pack', async ({ page, context }) => {
  // App shell is already loaded; drop the network and navigate client-side so
  // the pack must render from the persisted cache, not the backend. Reopen the
  // SAME pack that was viewed online (Spanish) — only it is cached.
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Open Spanish (Spain)' }).click();
});

Then('an offline notice is shown', async ({ page }) => {
  await expect(page.getByTestId('offline-banner')).toBeVisible({ timeout: 15_000 });
});
