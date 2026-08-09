import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import keystatic from '@keystatic/astro';
import cspHashes from './src/integrations/csp-hashes.mjs';

export default defineConfig({
  site: 'https://douro-soulfood.com',
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: 'compile',
  }),

  integrations: [
    sitemap({
      // Exclude the internal /dev/ui component-preview route (404s outside
      // dev mode anyway, but it shouldn't appear in the sitemap regardless).
      filter: (page) => !page.includes('/dev/'),
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
