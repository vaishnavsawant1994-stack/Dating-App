import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('protected Admin routes fail closed to staff sign in', async ({ page }) => {
  await page.goto('/overview');
  await expect(page).toHaveURL(/\/login\?reason=admin-auth-required$/);
  await expect(page.getByRole('heading', { name: 'Staff sign in' })).toBeVisible();
  await expect(page.getByText('Consumer accounts cannot sign in here.')).toBeVisible();
});

test('non-production preview renders the permission-aware Admin shell accessibly', async ({ page }) => {
  await page.goto('/preview');
  await expect(page.getByRole('status')).toContainText('TEST');
  await expect(page.getByRole('navigation', { name: 'Admin navigation' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Operations overview' })).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to admin content' })).toBeFocused();

  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter(
    (violation) => violation.impact === 'critical' || violation.impact === 'serious',
  );
  expect(serious).toEqual([]);
});

test('Admin health uses the Admin API origin', async ({ page }) => {
  await page.route('http://127.0.0.1:3998/health/ready', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ok' }) });
  });
  await page.goto('/preview');
  await page.getByRole('button', { name: 'Check Admin API' }).click();
  await expect(page.getByText('Ready')).toBeVisible();
});
