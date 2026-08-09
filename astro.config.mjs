import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';
import cspHashes from './src/integrations/csp-hashes.mjs';
import { DEFAULT_LOCALE, LIVE_LOCALES } from './src/lib/i18n/locales.ts';

// Astro's `i18n.locales` is kept in lockstep with LIVE_LOCALES, not with the
// full locale registry (src/lib/i18n/locales.ts) — see that file's module
// comment for why a `planned` locale must never appear here before its pages
// exist. Both this array and the sitemap's `i18n.locales` map (below) derive
// from LIVE_LOCALES so a Phase 3 activation is a one-line change in exactly
// one place (LIVE_LOCALES), not three configs kept in sync by hand.
const sitemapLocaleMap = Object.fromEntries(LIVE_LOCALES.map((code) => [code, code]));

export default defineConfig({
  site: 'https://douro-soulfood.com',
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: 'compile',
  }),

  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: [...LIVE_LOCALES],
    routing: { prefixDefaultLocale: false },
    // No `fallback` — that would generate /en/* filled with German prose the
    // moment `en` becomes routable, which is exactly what must never ship.
  },

  integrations: [
    sitemap({
      // Exclude the internal /dev/ui component-preview route (404s outside
      // dev mode anyway, but it shouldn't appear in the sitemap regardless).
      filter: (page) => !page.includes('/dev/'),
      // With one live locale, every path has exactly one entry in this map, so
      // @astrojs/sitemap's own `links.length <= 1` guard (generate-sitemap.js)
      // suppresses <xhtml:link rel="alternate"> for all of them — verified
      // against the installed 3.7.2 source, not assumed. Adding a second live
      // locale (Phase 3) is what turns this on, automatically, for every path
      // that has a translated sibling — legal pages stay untouched since they
      // deliberately never get an `en` sibling page.
      i18n: { defaultLocale: DEFAULT_LOCALE, locales: sitemapLocaleMap },
    }),
    keystatic(),
    // Must stay LAST: its astro:build:done hook rewrites dist/client/_headers
    // using the final rendered HTML.
    cspHashes(),
  ],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ['sharp'],
      optimizeDeps: {
        exclude: ['@keystatic/astro/internal/keystatic-api.js'],
      },
    },
  },
});
