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
  await page.goto('/home');
  await expect(card).toBeVisible({ timeout: 15_000 });
  // The persister throttles writes to localStorage — wait until the pack's
  // phrase query is actually persisted, so it can rehydrate once offline.
  // (Without this the fast CI runner drops the connection before the write.)
  await expect
    .poll(
      () => page.evaluate(() => window.localStorage.getItem('pp-query-cache')?.includes('phrases')),
      { timeout: 15_000 },
    )
    .toBe(true);
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
