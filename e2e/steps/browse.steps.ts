import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, Then } = createBdd();

Given('a visitor opens the app at the root', async ({ page }) => {
  await page.goto('/');
});

Then('they are taken to the home shelf', async ({ page }) => {
  await expect(page).toHaveURL(/\/home$/);
});

Given('a visitor opens the home shelf', async ({ page }) => {
  await page.goto('/home');
  await expect(page).toHaveURL(/\/home$/);
});

Given('a visitor opens the home shelf with a failing network', async ({ page }) => {
  await page.route('**/graphql', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: '{"errors":[{"message":"boom"}]}',
    }),
  );
  await page.goto('/home');
  await expect(page).toHaveURL(/\/home$/);
});

Then('a language pack {string} is visible', async ({ page }, name: string) => {
  // Assert on a REAL seeded pack rendered as a card — the guest Language read.
  await expect(page.getByRole('button', { name: `Open ${name}` })).toBeVisible({
    timeout: 15_000,
  });
});

Then('home shows a retry, not a blank list', async ({ page }) => {
  await expect(page.getByTestId('load-error')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('load-retry')).toBeVisible();
});
