import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

/** Open a named pack by clicking its card from home — exercises the real
 * navigation + phrase read path (not a guessed URL). */
async function openPack(page: import('@playwright/test').Page, name: string) {
  await page.goto('/home');
  const card = page.getByRole('button', { name: `Open ${name}` });
  await expect(card).toBeVisible({ timeout: 15_000 });
  await card.click();
  await expect(page).toHaveURL(/\/pack\//);
}

Given('a visitor opens the {string} pack', async ({ page }, name: string) => {
  await openPack(page, name);
});

Given(
  'a visitor opens the {string} pack with phrase reads failing',
  async ({ page }, name: string) => {
    // Fail ONLY the phrase-by-language query so the pack header still loads from
    // the real backend — proves the phrase list's own error path.
    await page.route('**/graphql', async (route) => {
      const body = route.request().postData() ?? '';
      if (body.includes('listPhraseByLanguageIdAndOrd')) {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: '{"errors":[{"message":"boom"}]}',
        });
      }
      return route.continue();
    });
    await openPack(page, name);
  },
);

Then(
  'the phrase {string} is visible with its English {string}',
  async ({ page }, translation: string, english: string) => {
    const row = page.getByTestId('phrase-row').filter({ hasText: translation });
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row).toContainText(english);
  },
);

Then('the phonetic {string} is visible', async ({ page }, phonetic: string) => {
  await expect(page.getByText(phonetic)).toBeVisible();
});

Then('a category section {string} is visible', async ({ page }, label: string) => {
  await expect(page.getByRole('heading', { name: label })).toBeVisible({ timeout: 15_000 });
});

Then('every phrase row has a play control', async ({ page }) => {
  await expect(page.getByTestId('phrase-sections')).toBeVisible({ timeout: 15_000 });
  const rows = page.getByTestId('phrase-row');
  const count = await rows.count();
  expect(count).toBeGreaterThan(0);
  // A play control is either the active button or the muted (no-audio) marker.
  const controls = page.locator('[data-testid="phrase-play"], .pp-play--muted');
  expect(await controls.count()).toBe(count);
});

Then('the pack shows a retry, not a blank list', async ({ page }) => {
  await expect(page.getByTestId('load-error')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('load-retry')).toBeVisible();
});

When('they search the pack for {string}', async ({ page }, query: string) => {
  await expect(page.getByTestId('phrase-sections')).toBeVisible({ timeout: 15_000 });
  await page.getByTestId('phrase-search').fill(query);
});

Then('the phrase {string} is not visible', async ({ page }, translation: string) => {
  await expect(page.getByTestId('phrase-row').filter({ hasText: translation })).toHaveCount(0);
});
