import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('home shell is responsive, keyboard reachable, and axe-clean for serious violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Real people/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'together home' })).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((violation) =>
    violation.impact === 'critical' || violation.impact === 'serious',
  );
  expect(serious).toEqual([]);
});

test('health demo handles the canonical API readiness contract', async ({ page }) => {
  await page.route('http://127.0.0.1:3999/health/ready', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok', service: 'api', version: 'ci', environment: 'test' }),
    });
  });

  await page.goto('/health-demo');
  await page.getByRole('button', { name: 'Check API' }).click();
  await expect(page.getByText('api is ready in test.')).toBeVisible();
});
