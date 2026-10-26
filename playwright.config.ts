import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests for the production build.
 *
 * Run with `npm run test:e2e` (builds first) or `npx playwright test` against
 * an existing `build/` folder.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : [['list']],
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off'
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 }
      }
    }
  ],
  // When E2E_BASE_URL points at a deployed environment, no local server is needed.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'node e2e/static-server.js',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
        stdout: 'ignore',
        stderr: 'pipe'
      },
  outputDir: 'playwright-artifacts/test-results'
});
