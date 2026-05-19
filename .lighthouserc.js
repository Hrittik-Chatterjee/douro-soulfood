/**
 * Lighthouse CI Configuration — D'ouro Soulfood Bistro
 *
 * Performance budgets for an Astro v6 + Cloudflare Pages site.
 * Runs in CI after deployment to verify quality gates.
 *
 * Usage:
 *   pnpm lhci            — local autorun (needs staticDistDir or url)
 *   CI: lhci autorun     — triggered by deploy.yml workflow
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
       * In CI, we collect against the live preview URL (set via LHCI_URL env var).
       * For local runs, use staticDistDir to serve the built dist/ folder.
       */
      url: process.env.LHCI_URL
        ? [process.env.LHCI_URL]
        : ['http://localhost:8788/', 'http://localhost:8788/menu', 'http://localhost:8788/about', 'http://localhost:8788/contact'],
      numberOfRuns: 3,
      /*
       * Use staticDistDir only for local development when no URL is set.
       * In CI, LHCI_URL is always provided from the preview deployment.
       */
      ...(process.env.LHCI_URL
        ? {}
        : { staticDistDir: './dist' }),
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
        'interactive': ['warn', { maxNumericValue: 3500 }],

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
        'viewport': 'error',
        'color-contrast': 'error',

        /* ── SEO specifics ── */
        'canonical': 'warn',
        'crawlable-anchors': 'warn',
        'hreflang': 'warn',
        'robots-txt': 'warn',
        'tap-targets': 'warn',
      },
    },

    upload: {
      target: 'lhci',
      serverBaseUrl: process.env.LHCI_SERVER_URL || '',
      token: process.env.LHCI_TOKEN || '',
      /*
       * If no LHCI server is configured, results are saved locally.
       * The CI workflow uploads results as artifacts regardless.
       */
    },
  },
};
