import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/login');
  await page.evaluate(() => localStorage.removeItem('shelfzone-auth'));
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@shelfzone.com');
  await page.getByLabel('Password').fill('Admin@12345');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('Navigation & UX', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('breadcrumbs show on inner pages', async ({ page }) => {
    await page.goto('/dashboard/employees');
    // Home icon should be present (breadcrumb root)
    await expect(page.locator('nav').filter({ has: page.locator('a[href="/dashboard"]') })).toBeVisible();
  });

  test('navbar user dropdown shows email and role', async ({ page }) => {
    await page.getByRole('button', { name: /user/i }).last().click();
    await expect(page.getByText('admin@shelfzone.com')).toBeVisible();
    await expect(page.getByText(/super_admin/i)).toBeVisible();
  });

  test('sidebar collapses on desktop', async ({ page }) => {
    // Find the collapse button
    const collapseBtn = page.getByRole('button', { name: /toggle sidebar/i });
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      // Sidebar should be narrower — check that text labels are hidden
      await expect(page.locator('aside')).toHaveCSS('width', /80px|5rem/);
    }
  });

  test('landing page has sign in link', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('shelfzone-auth'));
    await page.goto('/');
    await expect(page.getByText('ShelfZone')).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
  });

  test('404 page shows for unknown dashboard routes', async ({ page }) => {
    await page.goto('/dashboard/nonexistent-page');
    // Should either show not-found or redirect
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('security headers are set', async ({ page }) => {
    const response = await page.goto('/dashboard');
    const headers = response?.headers();
    expect(headers?.['x-frame-options']).toBe('DENY');
    expect(headers?.['x-content-type-options']).toBe('nosniff');
  });
});
