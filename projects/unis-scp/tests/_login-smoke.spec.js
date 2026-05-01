import { test, expect } from '@playwright/test';

const FE = 'http://localhost:3001';

test('login page renders with new command-center design and authenticates', async ({ page }) => {
  await page.goto(`${FE}/login`);
  await page.waitForLoadState('networkidle');

  // Brand markers
  await expect(page.getByText(/Smartlog SCP/i)).toBeVisible();
  await expect(page.getByText(/Command/i).first()).toBeVisible();
  await expect(page.getByText(/Center/i).first()).toBeVisible();
  await expect(page.getByText(/SECURE TERMINAL/i)).toBeVisible();

  // Form fields still wired up
  const u = page.locator('#username');
  const p = page.locator('#password');
  await expect(u).toBeVisible();
  await expect(p).toBeVisible();

  // Validation: blank submit
  await page.getByRole('button', { name: /đăng nhập|sign in|log in/i }).first().click();
  await expect(page.getByText(/vui lòng nhập tên đăng nhập|usernameRequired/i)).toBeVisible();

  // Successful auth
  await u.fill('admin');
  await p.fill('Admin@123');
  await Promise.all([
    page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 15_000 }),
    page.getByRole('button', { name: /đăng nhập|sign in|log in/i }).first().click(),
  ]);

  // Landed on a non-login route
  expect(new URL(page.url()).pathname).not.toMatch(/^\/login/);
});
