import { Page } from '@playwright/test';

export const HERO_SRC = '/images/hero-people-today-brighter-tomorrows.webp';
export const CARE_SRC = '/images/care-at-home.webp';

export const HERO_ALT = /Collage of clinical trial participants/i;
export const CARE_ALT = /nurse adjusts an IV drip/i;
export const CARE_CAPTION = 'Dignified care close to home, with family by your side.';

/**
 * The patient-awareness modal covers the whole page on first visit. Dismiss it
 * the way a real visitor would before asserting on page content.
 */
export async function dismissAwarenessBanner(page: Page) {
  const overlay = page.locator('.awareness-overlay');

  if ((await overlay.count()) === 0) return;

  const continueButton = page.getByRole('button', { name: /I Understand/i });

  if ((await continueButton.count()) > 0) {
    // A programmatic click is used on purpose: the floating "Scroll down for
    // more" hint sits above the footer button and would swallow a real click.
    await continueButton.first().evaluate((element: HTMLElement) => element.click());
  }

  await overlay.waitFor({ state: 'detached', timeout: 10_000 });
}

/** True when an <img> has finished loading actual pixels (not a broken icon). */
export async function imageIsLoaded(page: Page, selector: string) {
  return page.locator(selector).evaluate((element: HTMLImageElement) => {
    return element.complete && element.naturalWidth > 0 && element.naturalHeight > 0;
  });
}
