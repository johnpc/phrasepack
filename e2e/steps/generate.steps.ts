import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

/** Stub the generateLanguage mutation so the flow test doesn't hit Bedrock/
 * Polly. Returns a runId + languageId; the run then reports RUNNING forever
 * (enough to assert the in-progress UI without generating anything). */
async function stubGeneration(page: import('@playwright/test').Page, fail: boolean) {
  await page.route('**/graphql', async (route) => {
    const body = route.request().postData() ?? '';
    if (body.includes('generateLanguage')) {
      if (fail) {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: '{"errors":[{"message":"boom"}]}',
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { generateLanguage: { runId: 'run-e2e', languageId: 'lang-de-de' } },
        }),
      });
    }
    if (body.includes('getGenerationRun') || body.includes('GetGenerationRun')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { getGenerationRun: { id: 'run-e2e', status: 'RUNNING' } } }),
      });
    }
    return route.continue();
  });
}

Given('a visitor opens the add-a-language screen', async ({ page }) => {
  await page.goto('/add');
  await expect(page).toHaveURL(/\/add$/);
  await expect(page.getByTestId('catalog-list')).toBeVisible({ timeout: 15_000 });
});

Given('a visitor opens the add-a-language screen with generation stubbed', async ({ page }) => {
  await stubGeneration(page, false);
  await page.goto('/add');
  await expect(page.getByTestId('catalog-list')).toBeVisible({ timeout: 15_000 });
});

Given('a visitor opens the add-a-language screen with generation failing', async ({ page }) => {
  await stubGeneration(page, true);
  await page.goto('/add');
  await expect(page.getByTestId('catalog-list')).toBeVisible({ timeout: 15_000 });
});

Then('a language choice {string} is offered', async ({ page }, name: string) => {
  await expect(page.getByTestId('catalog-choice').filter({ hasText: name })).toBeVisible();
});

Then('the already-generated {string} is not offered', async ({ page }, name: string) => {
  await expect(page.getByTestId('catalog-choice').filter({ hasText: name })).toHaveCount(0);
});

When('they pick the {string} language', async ({ page }, name: string) => {
  await page.getByTestId('catalog-choice').filter({ hasText: name }).click();
});

When('they type {string} and request generation', async ({ page }, name: string) => {
  await page.getByTestId('custom-language-input').fill(name);
  await page.getByTestId('custom-language-generate').click();
});

Then('a generation-in-progress message is shown', async ({ page }) => {
  await expect(page.getByTestId('generate-progress')).toBeVisible({ timeout: 15_000 });
});

Then('a generation-failed message with a retry is shown', async ({ page }) => {
  await expect(page.getByTestId('generate-failed')).toBeVisible({ timeout: 15_000 });
});

When('they switch to browse by destination', async ({ page }) => {
  await page.getByTestId('mode-destination').click();
});

Then('a destination {string} is offered', async ({ page }, country: string) => {
  await expect(page.getByTestId('destination-choice').filter({ hasText: country })).toBeVisible({
    timeout: 15_000,
  });
});
