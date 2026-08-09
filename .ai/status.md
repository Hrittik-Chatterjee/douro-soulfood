# Repo Status

> Point-in-time snapshot. Stale the moment this session ends unless a future agent updates it — treat as a starting point, verify anything load-bearing (per `.ai/truth-gates.md`).

## Current repo status

D'ouro Soulfood Bistro site — Astro 6 + Tailwind v4 + Keystatic, deployed to Cloudflare Pages/Workers. `main` branch is stable; `pnpm build` passes clean from a fresh checkout. Legal pages (Impressum/Datenschutz) are live. Google Fonts are self-hosted, Google Maps is consent-gated. The Impeccable design-audit skill is installed (project scope, Claude Code only, `.claude/skills/impeccable/`). A full design-system knowledge base lives at `docs/design-system/` (17 files, real project data, not placeholders). No open PRs, no open issues.

## Active task

SEO Phase 1 (German-only) landed: build-time CSP hash generation, one schema.org `@graph` per page, required meta descriptions, trailing-slash canonicals, generated `/llms.txt`, real image alt text. **Phases 2-4 (i18n infrastructure, English activation, zh/pt) are NOT started** — see `docs/seo.md` and the plan.

## Next best action

Fix the mobile LCP breach (see blockers) — it is the only `error`-level budget failing, and it is now a red CI gate rather than a silent one. See `.ai/next-action.md`.

## Current blockers

- **Mobile LCP exceeds budget**: ~4131 ms on `/` and ~2863 ms on `/menu/` against 2500 ms, and `/` scores 0.86 against the 0.90 performance floor. Measured against a Brotli-serving origin, so it is genuine and not a compression artifact. Cause is the render-blocking CSS. **Do not resolve by relaxing a threshold.**
- **`CLOUDFLARE_API_TOKEN` secret is unset**, so `Deploy Preview`/`Deploy to Production` fail. Needs repo-admin access. The Actions deploy path is _additionally_ broken (Pages command against a Workers build, `dist/` instead of `dist/client`, wrangler 3 vs 4) and redundant — Cloudflare's Git integration is what actually deploys.

Environment-only gaps (sandbox-specific):

- `wrangler pages dev`'s local runtime fails to start in at least one sandboxed agent environment (workerd module error) — use `pnpm build && pnpm serve:dist`, which is also what CI uses.
- Headless Chrome against a live Cloudflare Workers preview URL hits a proxy-TLS interstitial in that environment — audit the local served build instead; never disable certificate verification to work around it.
- Full `npx playwright test` needs a browser binary the pinned version doesn't match; pass a config overriding `launchOptions.executablePath` to the Chromium present in the sandbox. **Corrected claim:** this file previously said the CI `Playwright E2E Tests` job made that sandbox-only and "not a CI gap" — untrue. That job was `skipped` on every run (it depended on the failing preview deploy), so the suite ran nowhere at all, which is how 17 assertions drifted stale on `main`. Both gates now depend on `build` and do run.
- ~~`images.unsplash.com` blocked by the sandbox~~ — **resolved**: that hero fallback image is now self-hosted at `/images/hero-fallback.jpg`, and `images.unsplash.com` was removed from both `astro.config.mjs`'s `remotePatterns` and the CSP `img-src`.

## Recently resolved

- **Impressum/Datenschutz pages** (PR #20, merged) — real legal-compliance gap closed. Legal-form/UID/Firmenbuchnummer fields remain bracketed placeholders (business-owner-supplied facts, not agent-actionable, per explicit research documented in the PR).
- **Google Fonts self-hosted** — was loading from Google's servers (GDPR/IP-transmission exposure, per the LG München ruling, Az. 3 O 17493/20). Now `.woff2` files under `public/fonts/`, `@font-face` in `tokens.css`.
- **Google Maps consent-gated** — `MapEmbed.astro` implements the two-click pattern; no request to Google fires until the visitor clicks through.
- **Stale EU ODR platform reference removed** from Impressum — the EU Online Dispute Resolution platform was discontinued 2025-07-20 (Regulation (EU) 2024/3228); verified via multiple independent legal sources before removing.
- **Hero video double-load bug** — both mobile and desktop video files were fetched on every page view regardless of viewport (CSS `hidden`/`block` doesn't stop resource fetching). Fixed with a viewport-matched JS loader.
- **WCAG AA contrast fixes** — `--color-brand-gold` used as static text measured ~2:1 against light backgrounds (need 4.5:1); introduced `--color-brand-gold-ink` for text use, kept the original for decorative/icon use. `--color-text-tertiary` darkened (was a 4.1–4.3:1 near-miss).
- **Typography token scale realigned** — the custom `--text-*` scale had invented values matching nothing in real use; realigned to equal Tailwind's actual, disciplined 17-combination usage pattern (298 call sites, zero visual change).
- **Color tokenization** — 38 of 44 un-tokenized `stone-*`/`amber-*`/`zinc-*` call sites routed through proper tokens (Footer → `--color-text-tertiary`, bistro-theme components → 5 new bistro-scoped tokens). Remaining 6 amber accents verified as correctly context-specific, not a gap.
- **Contact page opening-hours alignment bug** — fixed via a real visual audit (Puppeteer screenshots), not just code review.
- **`/menu` performance regression**: image payload cut 80%, DOM size cut 28%. See `benchmarks/reports/MENU-IMAGE-FIX.okf.md` and `MENU-DOM-SIZE-FIX.okf.md`.
- **CSP bug**: was silently blocking the mobile menu and Maps consent-gate in production. Fixed via SHA-256 hash allowlisting; verify with `node scripts/checks/verify-csp-hashes.mjs` after any edit to inline-script-bearing components or a build-tooling dependency bump.
- **E2E coverage**: `/about`, `/catering`, `/contact` added, 76 → 134 total tests.
- **`public/images/` → `src/assets/` pipeline migration**: explicitly deferred, not done — requires a Keystatic CMS schema change the user chose to skip. See `.ai/memory/human-approvals.md`. Do not attempt without a fresh, explicit ask.
- **Spacing (75 half-step Tailwind utility instances)**: investigated, deliberately left as-is — defensible for compact UI (icon+text gaps), not drift. See `docs/design-system/SPACING_SYSTEM.md`.

## Latest known risks

- A 64KB `Footer.*.css` chunk is render-blocking on every route — investigated, legitimate fully-used Tailwind output (zero wasted bytes per Lighthouse), not a bug. No fix attempted.
- CSP hashes are NO LONGER committed — `src/integrations/csp-hashes.mjs` injects them into `dist/client/_headers` at build; `public/_headers` keeps an over-restrictive placeholder that fails closed. Verify with `pnpm check:csp`. Formerly pinned to exact minified byte output and can go stale on any Astro/Vite/esbuild version bump, not just a source edit — run `node scripts/checks/verify-csp-hashes.mjs` after dependency updates.
- ~~CI's `@axe-core/playwright` accessibility gate only runs against 2 of 7 routes~~ closed 2026-08-07 — all 7 routes now covered (`tests/impressum.spec.ts`, `tests/datenschutz.spec.ts` added).

## Last updated

Refreshed after the Impeccable-skill-install + design-system-audit work (PRs #43, #44) merged, and PR #20/legal-fix state was found stale and corrected. Prefer `node .ai/scripts/agent-status.mjs`'s live output over this static file when possible.
