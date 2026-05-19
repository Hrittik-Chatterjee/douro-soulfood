import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for D'ouro Soulfood Bistro.
 *
 * Target: Astro + Cloudflare Pages (wrangler dev on port 8788).
 * NOT astro dev — wrangler dev is the production-like local server
 * that simulates the Cloudflare Workers runtime.
 *
 * Both desktop and mobile projects use Chromium to avoid needing
 * WebKit/Firefox installs in CI. Mobile uses iPhone-like viewport.
 *
 * Run `npx wrangler pages dev dist --port 8788` before executing tests,
 * or use `npm run test:e2e` which handles server lifecycle.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  /*
   * Base URL: In CI, use the Cloudflare Pages preview URL (BASE_URL env var).
   * Locally, use wrangler dev on port 8788 (NOT astro dev — wrangler dev
   * simulates the Cloudflare Workers runtime).
   */
  use: {
    baseURL: process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8788',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* No webServer auto-start — wrangler dev is started separately
   * via `npm run test:e2e` script or manually.
   * This avoids port conflicts with wrangler's persistent process. */

  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile',
      use: {
        /* Chromium with iPhone-like viewport — avoids WebKit dependency */
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile/15E148 Safari/604.1',
      },
    },
  ],
});
