import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * csp-hashes — injects SHA-256 hashes for every inline <script> into the
 * SHIPPED `_headers` file at the end of the build.
 *
 * WHY THIS EXISTS
 * ---------------
 * `public/_headers` sets `script-src 'self'` with no 'unsafe-inline', so every
 * inline script must be allowed individually by exact-content hash. Those
 * hashes used to be maintained by hand, which only worked while exactly one
 * inline JSON-LD block existed and was byte-identical on all 7 pages.
 *
 * The moment JSON-LD is derived from Keystatic content, that stops being true
 * in a dangerous way: editing a price or an opening hour in the CMS changes the
 * rendered bytes, which invalidates the committed hash — and a CSP-blocked
 * script produces NO build error, NO test failure and NO visible symptom, only
 * a console violation in the visitor's browser. A content editor could silently
 * break the site's structured data (or the mobile nav) with a routine edit.
 *
 * So hashes are computed from the real build output instead of being asserted
 * ahead of time.
 *
 * FAIL-CLOSED BY DESIGN
 * ---------------------
 * `public/_headers` ships a valid but over-restrictive `script-src 'self'`.
 * This hook only ever ADDS hashes to it. If the hook never runs, the deployed
 * policy blocks inline scripts (loud, visible breakage) rather than silently
 * permitting anything — the safe direction to fail in.
 *
 * `scripts/checks/verify-csp-hashes.mjs` re-derives the hashes independently
 * and asserts the shipped file covers every inline script. It deliberately does
 * NOT share extraction code with this file: two independent implementations
 * agreeing is the actual signal. Keep both in CI.
 *
 * Astro's own `security.csp` was evaluated and rejected: it renders a
 * `<meta http-equiv="content-security-policy">`, and `frame-ancestors` is
 * ignored in a meta-delivered policy per the CSP spec, so the header cannot be
 * dropped. Two policies are also enforced independently (a script must satisfy
 * both), so the header's `default-src 'self'` would keep blocking inline
 * scripts regardless of what the meta policy allowed.
 */

/** Matches the inline scripts the CSP has to account for. Attribute-less and
 *  `type="module"` / `type="application/ld+json"` forms — CSP's script-src
 *  applies to an inline <script> regardless of its type attribute. */
const INLINE_SCRIPT = /<script(?:\s+type="(?:module|application\/ld\+json)")?>([\s\S]*?)<\/script>/g;

async function collectHtmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collectHtmlFiles(full)));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function sha256(source) {
  return `sha256-${createHash('sha256').update(source, 'utf-8').digest('base64')}`;
}

export default function cspHashes() {
  return {
    name: 'douro:csp-hashes',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        // With the Cloudflare adapter the browser-facing assets (and the
        // `_headers` copied out of public/) live under `client/`. Fall back to
        // `dir` itself so a plain static build keeps working.
        const root = fileURLToPath(dir);
        const clientDir = existsSync(join(root, 'client')) ? join(root, 'client') : root;
        const headersPath = join(clientDir, '_headers');

        if (!existsSync(headersPath)) {
          logger.warn(`no _headers found at ${headersPath} — CSP hashes not injected`);
          return;
        }

        const hashes = new Set();
        for (const file of await collectHtmlFiles(clientDir)) {
          // Strip comments first so a commented-out script can't contribute a
          // hash that no browser will ever need.
          const html = (await readFile(file, 'utf-8')).replace(/<!--[\s\S]*?-->/g, '');
          for (const match of html.matchAll(INLINE_SCRIPT)) {
            if (match[1].trim()) hashes.add(sha256(match[1]));
          }
        }

        if (hashes.size === 0) {
          logger.warn('no inline scripts found — leaving _headers untouched');
          return;
        }

        const headers = await readFile(headersPath, 'utf-8');
        const sources = [...hashes].sort().map((h) => `'${h}'`).join(' ');

        // Operate line by line and only on the real directive: comment lines in
        // _headers legitimately mention `script-src 'self'` while explaining this
        // mechanism, and a blind global replace would rewrite those too.
        let replaced = 0;
        const updated = headers
          .split('\n')
          .map((line) => {
            if (line.trimStart().startsWith('#')) return line;
            if (!line.includes('Content-Security-Policy:')) return line;
            return line.replace(/script-src 'self'/g, () => {
              replaced += 1;
              return `script-src 'self' ${sources}`;
            });
          })
          .join('\n');

        if (replaced !== 1) {
          throw new Error(
            `csp-hashes: expected exactly ONE "script-src 'self'" placeholder on a ` +
              `Content-Security-Policy line in ${headersPath}, found ${replaced}. ` +
              `public/_headers must keep that exact placeholder — see this integration's header comment.`,
          );
        }

        await writeFile(headersPath, updated, 'utf-8');
        logger.info(`injected ${hashes.size} inline-script hash(es) into _headers`);
      },
    },
  };
}
