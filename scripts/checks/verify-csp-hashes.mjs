#!/usr/bin/env node
/**
 * verify-csp-hashes.mjs — checks that every inline <script> in the built
 * output (application/ld+json and type="module") has its SHA-256 hash
 * present in the SHIPPED _headers' CSP script-src directive.
 *
 * The CSP intentionally has no 'unsafe-inline' for scripts — inline scripts are
 * allowed individually by exact-content hash instead. Astro auto-inlines small
 * page scripts (NavBar/MobileNavDrawer/MapEmbed interactivity, the JSON-LD
 * block) rather than externalizing them, and their minified byte content can
 * change on ANY toolchain update (Astro/Vite/esbuild version bump) or any
 * Keystatic content edit that feeds the JSON-LD — so a stale hash fails
 * silently in the browser (console-only CSP violation, no build error) unless
 * this script catches it first.
 *
 * Reads dist/client/_headers, NOT public/_headers: the hashes are injected at
 * build time by src/integrations/csp-hashes.mjs, so the shipped file is the only
 * one that reflects what browsers will actually enforce. public/_headers holds a
 * deliberately over-restrictive `script-src 'self'` placeholder.
 *
 * This check re-derives the hashes independently of that integration on purpose
 * — two implementations agreeing is the signal. Do not refactor them to share
 * extraction code.
 *
 * Usage: pnpm build && node scripts/checks/verify-csp-hashes.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const DIST = 'dist/client';
const HEADERS_PATH = 'dist/client/_headers';

function findHtmlFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) results.push(...findHtmlFiles(full));
    else if (entry.endsWith('.html')) results.push(full);
  }
  return results;
}

function sha256(content) {
  return 'sha256-' + createHash('sha256').update(content, 'utf-8').digest('base64');
}

const headersContent = readFileSync(HEADERS_PATH, 'utf-8');
const cspMatch = headersContent.match(/Content-Security-Policy:\s*(.+)/);
if (!cspMatch) {
  console.error(`FAIL: no Content-Security-Policy line found in ${HEADERS_PATH}`);
  process.exit(1);
}
const declaredHashes = new Set(
  [...cspMatch[1].matchAll(/'(sha256-[A-Za-z0-9+/=]+)'/g)].map((m) => m[1])
);

const htmlFiles = findHtmlFiles(DIST);
const foundHashes = new Set();
const scriptTagPattern = /<script(?:\s+type="(?:module|application\/ld\+json)")?>([\s\S]*?)<\/script>/g;

let missing = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf-8').replace(/<!--[\s\S]*?-->/g, '');
  for (const m of html.matchAll(scriptTagPattern)) {
    const content = m[1].trim();
    if (!content) continue;
    const hash = sha256(m[1]);
    foundHashes.add(hash);
    if (!declaredHashes.has(hash)) {
      console.log(`MISSING ${hash}  (${file}, ${content.length} bytes: ${content.slice(0, 50).replace(/\s+/g, ' ')}...)`);
      missing++;
    }
  }
}

console.log(`\n${foundHashes.size} unique inline script(s) found across ${htmlFiles.length} built page(s).`);
console.log(`${declaredHashes.size} hash(es) declared in ${HEADERS_PATH}.`);

if (missing > 0) {
  console.log(`\nFAIL: ${missing} inline script hash(es) are not covered by the CSP — they will be silently blocked by browsers in production.`);
  console.log('Add the missing hash(es) above to public/_headers\' script-src directive.');
  process.exit(1);
}

console.log('\nPASS: every inline script in the build is covered by the CSP.');
