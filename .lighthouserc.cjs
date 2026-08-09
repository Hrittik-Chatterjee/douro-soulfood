/**
 * Lighthouse CI Configuration — D'ouro Soulfood Bistro
 *
 * Performance budgets for an Astro v6 + Cloudflare Pages site.
 * Runs in CI after deployment to verify quality gates.
 *
 * Usage:
 *   pnpm build && pnpm serve:dist   — in one shell
 *   pnpm lhci                       — in another
 *   CI: same two steps, in deploy.yml's `lighthouse` job
 *   LHCI_URL=https://…  pnpm lhci   — audit a deployed origin instead
 *
 * Key design decisions:
 * - Performance: 0.9 min — Astro SSG should easily hit this
 * - Accessibility: 0.92 min — axe-core already validates in E2E;
 *   Lighthouse provides an extra layer with different checks
 * - Best Practices: 0.9 min — HTTPS, no console errors, etc.
 * - SEO: 0.92 min — meta tags, canonical, structured data already
 *   verified by Playwright; Lighthouse adds crawlability checks
 * - First Contentful Paint: < 1.8s — aggressive but achievable
 *   with Astro's zero-JS default and Cloudflare edge CDN
 * - Largest Contentful Paint: < 2.5s — Core Web Vital "good" threshold
 * - Cumulative Layout Shift: < 0.1 — Core Web Vital "good" threshold
 * - Total Blocking Time: < 200ms — Astro ships zero JS by default
 * - Interactive: < 3.5s — should be fast with minimal hydration
 */

module.exports = {
  ci: {
    collect: {
      /*
       * Audits the five public routes on a locally served build (start it with
       * `pnpm serve:dist`), or against LHCI_URL when auditing a real deployment.
       *
       * NOT staticDistDir, which is what this used to fall back to: lhci's own
       * static server sends everything UNCOMPRESSED, while Cloudflare serves
       * Brotli. On this site that is the difference between a 70.9 KB and a
       * 10.3 KB render-blocking stylesheet, which moved the homepage
       * performance score from 0.86 to 0.50 — i.e. it manufactured budget
       * failures that do not exist in production. scripts/serve-dist.mjs
       * negotiates br/gzip so the measurement reflects what visitors get.
       *
       * Trailing slashes are required: the site sets `trailingSlash: 'always'`,
       * so '/menu' answers 301 and auditing it measures a redirect hop.
       */
      url: (() => {
        const origin = (process.env.LHCI_URL || 'http://127.0.0.1:8788').replace(/\/$/, '');
        return ['/', '/menu/', '/about/', '/catering/', '/contact/'].map((p) => origin + p);
      })(),
      numberOfRuns: 3,
      /*
       * --no-sandbox: standard for any containerized/CI Chrome launch
       * (GitHub Actions runners, Docker-based agents) where the kernel
       * sandbox primitives Chrome wants aren't available/permitted.
       */
      settings: {
        chromeFlags: '--no-sandbox --disable-gpu',
      },
    },

    assert: {
      assertions: {
        /* ── Category scores (0–1 scale) ── */
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.92 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.92 }],

        /* ── Core Web Vitals ── */
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        interactive: ['warn', { maxNumericValue: 3500 }],

        /* ── Performance details ── */
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'render-blocking-resources': 'warn',
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'warn',
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',

        /* ── Accessibility specifics ── */
        'document-title': ['error', { minLength: 10 }],
        'meta-description': ['error', { minLength: 50 }],
        'html-has-lang': 'error',
        'html-lang-valid': 'error',
        viewport: 'error',
        'color-contrast': 'error',

        /* ── SEO specifics ── */
        canonical: 'warn',
        'crawlable-anchors': 'warn',
        hreflang: 'warn',
        'robots-txt': 'warn',
        /* 'tap-targets' was removed from Lighthouse (no longer a known
           audit as of this Lighthouse version) — tap-target sizing is
           independently enforced via the min-h-12 (48px) convention
           audited elsewhere in this repo's design-system checks. */
      },
    },

    upload: {
      /*
       * target: 'lhci' requires a server + token; this project has never
       * run an LHCI server, so that combination always fails the upload
       * step (and therefore `lhci autorun` as a whole) with "Must provide
       * token for LHCI target". Fall back to 'filesystem' (writes
       * .lighthouseci/ locally, which the CI workflow already uploads as
       * a build artifact) unless a real server is actually configured.
       */
      target: process.env.LHCI_SERVER_URL ? 'lhci' : 'filesystem',
      ...(process.env.LHCI_SERVER_URL
        ? { serverBaseUrl: process.env.LHCI_SERVER_URL, token: process.env.LHCI_TOKEN || '' }
        : {
            /*
             * Without an explicit outputDir the filesystem target writes one
             * <host>-<timestamp>.report.{html,json} pair per run per URL into
             * the CURRENT directory — 30 untracked files in the repo root for a
             * 5-URL, 3-run audit. Keep them inside the already-gitignored
             * .lighthouseci/ directory, which the workflow uploads as an artifact.
             */
            outputDir: '.lighthouseci/reports',
          }),
    },
  },
};
