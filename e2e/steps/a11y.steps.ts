import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import AxeBuilder from '@axe-core/playwright';

const { Given, Then } = createBdd();

Given('a visitor opens the settings screen', async ({ page }) => {
  await page.goto('/settings');
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByTestId('theme-group')).toBeVisible({ timeout: 15_000 });
});

Then('the page has no WCAG accessibility violations', async ({ page }) => {
  // Wait for any loading spinner to clear so the scan sees the SETTLED DOM, not
  // a transient loading state. (The spinner itself is now labelled, but a
  // half-rendered page can still flag spurious issues.)
  await expect(page.getByTestId('load-spinner')).toHaveCount(0, { timeout: 15_000 });
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const summary = results.violations
    .map((v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})`)
    .join('\n');
  expect(results.violations, `Accessibility violations found:\n${summary}`).toEqual([]);
});
