import { expect, test } from '@playwright/test';

const adminRoutes = ['/admin', '/admin/registrations', '/admin/users', '/admin/schedules', '/admin/attendance', '/admin/corrections', '/admin/reports', '/admin/audit'];
const userRoutes = ['/app', '/attendance', '/history', '/profile', '/corrections'];
const forbidden = /\b(undefined|null|NaN|Invalid Date|passwordHash|argon2|sessionTokenHash|objectKey|pendingKey)\b|\[object Object\]/i;

async function login(page: import('@playwright/test').Page, email: string, password: string): Promise<void> { await page.goto('/login'); await page.getByLabel('Email').fill(email); await page.getByLabel('Kata sandi').fill(password); await page.getByRole('button', { name: 'Masuk' }).click(); await expect(page).toHaveURL(/\/admin|\/app|\/status/); }

test('admin and user route sweeper', async ({ page }, testInfo) => {
  const consoleErrors: string[] = []; const pageErrors: string[] = []; page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); }); page.on('pageerror', (error) => pageErrors.push(error.message));
  await login(page, 'admin@example.com', 'ChangeMe123');
  for (const route of adminRoutes) { await page.goto(route); await expect(page.locator('main')).toBeVisible(); await expect(page.locator('body')).not.toContainText(forbidden); await expect(page.locator('body')).not.toContainText(/\{\s*"/); await page.screenshot({ path: `e2e/screenshots/admin-${route.slice(1).replaceAll('/', '-') || 'home'}.png`, fullPage: true }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `horizontal overflow on ${route}`).toBeTruthy(); }
  await login(page, 'demo6@example.com', 'DemoUser12345');
  for (const route of userRoutes) { await page.goto(route); await expect(page.locator('main')).toBeVisible(); await expect(page.locator('body')).not.toContainText(forbidden); await page.screenshot({ path: `e2e/screenshots/user-${route.slice(1).replaceAll('/', '-')}.png`, fullPage: true }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBeTruthy(); }
  expect(consoleErrors, consoleErrors.join('\n')).toEqual([]); expect(pageErrors, pageErrors.join('\n')).toEqual([]); expect(testInfo.project.name).toBe('chromium');
});
