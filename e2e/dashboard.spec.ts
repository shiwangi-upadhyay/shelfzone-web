import { test, expect, Page } from '@playwright/test';

// Helper to login before tests
async function login(page: Page) {
  await page.goto('/login');
  await page.evaluate(() => localStorage.removeItem('shelfzone-auth'));
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@shelfzone.com');
  await page.getByLabel('Password').fill('Admin@12345');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('dashboard page loads with stat cards', async ({ page }) => {
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Welcome to ShelfZone')).toBeVisible();
  });

  test('sidebar navigation works', async ({ page }) => {
    // Click Employees
    await page.getByRole('link', { name: 'Employees' }).click();
    await expect(page).toHaveURL(/\/dashboard\/employees/);
    await expect(page.getByText('Employees')).toBeVisible();
  });

  test('departments page loads', async ({ page }) => {
    await page.goto('/dashboard/departments');
    await expect(page.getByText('Departments')).toBeVisible();
    await expect(page.getByText('Add Department')).toBeVisible();
  });

  test('designations page loads', async ({ page }) => {
    await page.goto('/dashboard/designations');
    await expect(page.getByText('Designations')).toBeVisible();
    await expect(page.getByText('Add Designation')).toBeVisible();
  });

  test('notifications page loads', async ({ page }) => {
    await page.goto('/dashboard/notifications');
    await expect(page.getByText('Notifications')).toBeVisible();
  });

  test('attendance page loads', async ({ page }) => {
    await page.goto('/dashboard/attendance');
    await expect(page.getByText('Attendance')).toBeVisible();
  });

  test('leave page loads', async ({ page }) => {
    await page.goto('/dashboard/leave');
    await expect(page.getByText('Leave')).toBeVisible();
  });

  test('payroll page loads', async ({ page }) => {
    await page.goto('/dashboard/payroll');
    await expect(page.getByText('Payroll')).toBeVisible();
  });

  test('profile page loads', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await expect(page.getByText('Profile')).toBeVisible();
  });
});

test.describe('Agent Portal', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('agents page loads', async ({ page }) => {
    await page.goto('/dashboard/agents');
    await expect(page.getByText('AI Agents')).toBeVisible();
    await expect(page.getByText('New Agent')).toBeVisible();
  });

  test('teams page loads', async ({ page }) => {
    await page.goto('/dashboard/agents/teams');
    await expect(page.getByText('Agent Teams')).toBeVisible();
  });

  test('analytics page loads', async ({ page }) => {
    await page.goto('/dashboard/agents/analytics');
    await expect(page.getByText('Agent Analytics')).toBeVisible();
  });

  test('budgets page loads', async ({ page }) => {
    await page.goto('/dashboard/agents/budgets');
    await expect(page.getByText('Budgets')).toBeVisible();
  });

  test('costs page loads', async ({ page }) => {
    await page.goto('/dashboard/agents/costs');
    await expect(page.getByText('Cost Analysis')).toBeVisible();
  });

  test('commands page loads', async ({ page }) => {
    await page.goto('/dashboard/agents/commands');
    await expect(page.getByText('Command Audit Log')).toBeVisible();
  });
});
