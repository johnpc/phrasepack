import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

async function openPack(page: import('@playwright/test').Page, name: string) {
  await page.goto('/home');
  const card = page.getByRole('button', { name: `Open ${name}` });
  await expect(card).toBeVisible({ timeout: 15_000 });
  await card.click();
  await expect(page.getByTestId('phrase-sections')).toBeVisible({ timeout: 15_000 });
}

When('they start practicing', async ({ page }) => {
  await page.getByTestId('start-practice').click();
  await expect(page).toHaveURL(/\/practice$/);
});

Given('a visitor is practicing the {string} pack', async ({ page }, name: string) => {
  await openPack(page, name);
  await page.getByTestId('start-practice').click();
  await expect(page.getByTestId('practice-card')).toBeVisible({ timeout: 15_000 });
});

Then('a practice card prompts for an English phrase', async ({ page }) => {
  await expect(page.getByTestId('practice-card')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('practice-reveal')).toBeVisible();
});

When('they reveal the answer', async ({ page }) => {
  await page.getByTestId('practice-reveal').click();
});

Then("the card's translation and grade buttons are shown", async ({ page }) => {
  await expect(page.getByTestId('practice-answer')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId('grade-got-it')).toBeVisible();
  await expect(page.getByTestId('grade-again')).toBeVisible();
});
