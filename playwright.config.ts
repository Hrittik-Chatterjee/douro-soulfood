import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for D'ouro Soulfood Bistro.
 *
 * Serves the built output from `dist/client` on port 8788 via
 * `scripts/serve-dist.mjs` and starts it automatically (see webServer below),
 * so `pnpm build && pnpm exec playwright test` is all that's needed.
 *
 * Every public route is prerendered, so the served files are byte-for-byte the
 * HTML that ships. `wrangler pages dev` would additionally emulate the Workers
 * runtime, but it cannot start in every environment and no assertion in this
 * suite depends on it. Header behaviour from `_headers` is NOT reproduced here —
 * it's applied by Cloudflare at the edge, and covered by
 * `scripts/checks/verify-csp-hashes.mjs` instead.
 *
 * Both desktop and mobile projects use Chromium to avoid needing
 * WebKit/Firefox installs in CI. Mobile uses iPhone-like viewport.
 */

/*
 * An explicitly supplied base URL means "test that server instead", so the
 * local one must not be started — that's how a run can target a deployed
 * preview or an already-running dev server.
 */
const externalBaseURL = process.env.BASE_URL || process.env.PLAYWRIGHT_BASE_URL;
const PORT = 8788;
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: externalBaseURL || `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /*
   * Starts the static server for the built output, unless BASE_URL points
   * somewhere else. `reuseExistingServer` outside CI means a server you already
   * have on 8788 is left alone instead of causing a port conflict; in CI the
   * port is always free and a stray listener should be treated as an error.
   */
  ...(externalBaseURL
    ? {}
    : {
        webServer: {
          // Relative to this config's directory (the repo root), which is where
          // Playwright resolves webServer.cwd from by default.
          command: `node scripts/serve-dist.mjs --port ${PORT}`,
          url: `http://127.0.0.1:${PORT}/`,
          reuseExistingServer: !process.env.CI,
          timeout: 60_000,
          stdout: 'ignore',
          stderr: 'pipe',
        },
      }),

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
