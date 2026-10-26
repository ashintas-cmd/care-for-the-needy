import { expect, test } from '@playwright/test';
import { dismissAwarenessBanner } from './helpers';

/**
 * Captures review screenshots for the desktop and mobile home page. These are
 * written to `playwright-artifacts/` and are also asserted to be non-trivial,
 * so a page that fails to render is caught here too.
 */
test('capture home page screenshots', async ({ page }) => {
  await page.goto('/');
  await dismissAwarenessBanner(page);

  const hero = page.locator('.hero');
  await expect(hero.locator('.hero-visual img')).toBeVisible();

  // Let the trials/stats API settle so the capture shows real numbers.
  await page.waitForLoadState('networkidle').catch(() => undefined);
  await page.waitForTimeout(500);

  await hero.screenshot({ path: 'playwright-artifacts/home-hero.png' });
  await page.screenshot({ path: 'playwright-artifacts/home-desktop.png', fullPage: true });

  const desktopHeight = await page.evaluate(() => document.body.scrollHeight);
  expect(desktopHeight).toBeGreaterThan(2_000);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'playwright-artifacts/home-mobile.png', fullPage: true });

  const care = page.locator('.care-visual');
  await care.scrollIntoViewIfNeeded();
  await care.screenshot({ path: 'playwright-artifacts/home-care.png' });
});
