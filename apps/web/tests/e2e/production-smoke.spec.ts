import { expect, test } from '@playwright/test';

const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/verify-account',
  '/reset-password',
  '/verify-email-change',
  '/two-factor-challenge',
  '/blocked',
  '/privacy',
  '/terms',
] as const;

const protectedRoutes = [
  '/dashboard',
  '/learning-agent',
  '/settings/security',
  '/trackers',
  '/trackers/create',
  '/community',
  '/leaderboard',
  '/mock-tests',
  '/chat',
  '/friends',
  '/activity',
  '/admin',
  '/admin/users',
  '/admin/system-health',
] as const;

for (const path of publicRoutes) {
  test(`renders public route ${path} without a browser error`, async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    const response = await page.goto(path, { waitUntil: 'networkidle' });

    expect(response?.ok()).toBe(true);
    await expect(page.locator('#root')).not.toBeEmpty();
    expect(pageErrors).toEqual([]);
  });
}

for (const path of protectedRoutes) {
  test(`guards protected route ${path} and stays crash-free`, async ({ page }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    const response = await page.goto(path, { waitUntil: 'networkidle' });

    expect(response?.ok()).toBe(true);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('#root')).not.toBeEmpty();
    expect(pageErrors).toEqual([]);
  });
}
