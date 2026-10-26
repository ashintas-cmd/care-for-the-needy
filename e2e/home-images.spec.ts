import { expect, test } from '@playwright/test';
import {
  CARE_ALT,
  CARE_CAPTION,
  CARE_SRC,
  HERO_ALT,
  HERO_SRC,
  dismissAwarenessBanner,
  imageIsLoaded
} from './helpers';

test.describe('Home page photography', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await dismissAwarenessBanner(page);
  });

  test('shows the hero collage and the care photo', async ({ page }) => {
    const hero = page.locator('.hero-visual img');
    const care = page.locator('.care-visual img');

    await expect(hero).toBeVisible();
    await expect(care).toBeVisible();

    // Bundled assets: when the API is unavailable the page must still be whole.
    await expect(hero).toHaveAttribute('src', HERO_SRC);
    await expect(care).toHaveAttribute('src', CARE_SRC);

    expect(await imageIsLoaded(page, '.hero-visual img')).toBe(true);
    expect(await imageIsLoaded(page, '.care-visual img')).toBe(true);
  });

  test('exposes descriptive alt text and a caption for screen readers', async ({ page }) => {
    await expect(page.locator('.hero-visual img')).toHaveAttribute('alt', HERO_ALT);
    await expect(page.locator('.care-visual img')).toHaveAttribute('alt', CARE_ALT);
    await expect(page.locator('.care-visual figcaption')).toHaveText(CARE_CAPTION);
  });

  test('serves both photos from the CDN path with the right content type', async ({ page }) => {
    for (const [path, expectedType] of [
      [HERO_SRC, 'image/webp'],
      [CARE_SRC, 'image/webp']
    ] as const) {
      const response = await page.request.get(path);

      expect(response.status(), `${path} should be reachable`).toBe(200);
      expect(response.headers()['content-type']).toContain(expectedType);
      expect((await response.body()).byteLength).toBeGreaterThan(1_000);
    }
  });

  test('renders the Firestore copy of the metadata when the images API responds', async ({ page }) => {
    await page.route('**/api/images', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              id: 'hero-primary',
              slot: 'hero',
              title: 'Firestore hero',
              alt: 'Hero alt text loaded from Firestore',
              caption: 'Hero caption loaded from Firestore',
              src: `${HERO_SRC}?v=firestore`,
              width: 1536,
              height: 1024,
              order: 1
            },
            {
              id: 'care-at-home',
              slot: 'care',
              title: 'Firestore care',
              alt: 'Care alt text loaded from Firestore',
              caption: 'Caption served from Firestore',
              src: `${CARE_SRC}?v=firestore`,
              width: 349,
              height: 195,
              order: 2
            }
          ]
        })
      });
    });

    // The route is registered after the initial navigation, so reload.
    await page.reload();
    await dismissAwarenessBanner(page);

    await expect(page.locator('.hero-visual img')).toHaveAttribute('src', `${HERO_SRC}?v=firestore`);
    await expect(page.locator('.care-visual figcaption')).toHaveText('Caption served from Firestore');
    expect(await imageIsLoaded(page, '.hero-visual img')).toBe(true);
  });

  test('falls back to the bundled photos when the images API fails', async ({ page }) => {
    await page.route('**/api/images', route => route.abort());

    await page.reload();
    await dismissAwarenessBanner(page);

    await expect(page.locator('.hero-visual img')).toHaveAttribute('src', HERO_SRC);
    await expect(page.locator('.care-visual img')).toHaveAttribute('src', CARE_SRC);
    expect(await imageIsLoaded(page, '.hero-visual img')).toBe(true);
    expect(await imageIsLoaded(page, '.care-visual img')).toBe(true);
  });

  test('has no broken images on the home page', async ({ page }) => {
    const broken = await page.locator('img').evaluateAll((images: HTMLImageElement[]) =>
      images
        .filter(img => !(img.complete && img.naturalWidth > 0))
        .map(img => img.getAttribute('src'))
    );

    expect(broken).toEqual([]);
  });

  test('keeps the hero search usable alongside the new imagery', async ({ page }) => {
    const input = page.locator('.hero .search-box input');

    await expect(input).toBeVisible();
    await input.fill('diabetes');
    await expect(input).toHaveValue('diabetes');
    await expect(page.locator('.hero .search-box button')).toBeEnabled();
  });
});

test.describe('Home page mobile layout', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('stacks both photos without horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await dismissAwarenessBanner(page);

    await expect(page.locator('.hero-visual img')).toBeVisible();
    await expect(page.locator('.care-visual img')).toBeVisible();

    // Photos never render wider than their container.
    for (const selector of ['.hero-visual img', '.care-visual img']) {
      const overflow = await page.locator(selector).evaluate((element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        return rect.width - element.parentElement!.getBoundingClientRect().width;
      });
      expect(overflow).toBeLessThanOrEqual(1);
    }

    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(pageOverflow).toBeLessThanOrEqual(1);
  });

  test('keeps the logo and the main navigation usable on phones', async ({ page }) => {
    await page.goto('/');
    await dismissAwarenessBanner(page);

    const nav = page.locator('.nav');
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Search Trials' })).toBeVisible();

    // The logo block must stay inside the viewport rather than being clipped.
    const logoOverflow = await page.locator('.logo').evaluate((element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return Math.min(rect.left, window.innerWidth - rect.right);
    });
    expect(logoOverflow).toBeGreaterThanOrEqual(-1);
  });
});
