import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth state
    await page.goto('/login');
    await page.evaluate(() => localStorage.removeItem('shelfzone-auth'));
  });

  test('login page renders correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows validation errors for empty form', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid email/i)).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('wrong@test.com');
    await page.getByLabel('Password').fill('wrongpass123');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Should show error toast or message
    await expect(page.getByText(/invalid|failed|error/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@shelfzone.com');
    await page.getByLabel('Password').fill('Admin@12345');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('logout redirects to login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@shelfzone.com');
    await page.getByLabel('Password').fill('Admin@12345');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Logout via avatar dropdown
    await page.getByRole('button', { name: /user/i }).last().click();
    await page.getByText('Log out').click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('unauthenticated user redirected from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('register page renders', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByText(/sign up|register|create account/i).first()).toBeVisible();
  });

  test('forgot password page renders', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByText(/forgot|reset|password/i).first()).toBeVisible();
  });
});
