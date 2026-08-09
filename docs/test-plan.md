---
okf_version: '0.2'
id: 'docs/test-plan'
type: 'knowledge'
title: 'Test Plan'
status: 'approved'
created: 'unknown'
updated: 'unknown'
freshness: 'current'
lifecycle: 'active'
trust: 'verified'
provenance:
  { source: 'ai', references: ['tests/home.spec.ts', 'tests/menu.spec.ts', '.lighthouserc.cjs'] }
attestation:
  { method: 'manual', checks: ['cross-checked against real test files and Lighthouse config'] }
summary: 'Real test coverage (Playwright + axe-core, 76 tests) and documented gaps (zero tests for about/catering/contact, no unit-test layer).'
load_when: 'Writing or updating tests.'
token_budget: 800
related: ['.ai/packs/testing.okf.md']
---

# Test Plan

## Machine Contract

doc_id: TESTPLAN-01 | status: approved | outputs: `tests/*.spec.ts`, `.lighthouserc.cjs`, `.github/workflows/deploy.yml`'s `e2e-tests`/`lighthouse` jobs

## 1. Context & Inputs

Reflects the actual test suite as it exists today: `tests/home.spec.ts` and `tests/menu.spec.ts` (Playwright + `@axe-core/playwright`), `.lighthouserc.cjs` (Lighthouse CI), and no other test layer — there is no unit-test runner, no component-test setup, and no `astro check`/type-checking step in this repo (confirmed: no `@astrojs/check` dependency in `package.json`). `pnpm build`'s own diagnostics (Astro's build-time type/schema checking, which validates every content JSON file against its zod schema in `content.config.ts`) is the only compile-time gate that exists.

## 2. Required Outputs

### Coverage that exists today

- **`tests/home.spec.ts`**: content/visibility assertions (H1, CTAs, review badge, featured dishes, "Unsere Geschichte", footer address, skip-link), NavBar presence/links, mobile hamburger-drawer open/close/focus-trap/`Escape`, the Maps consent gate (iframe absent pre-click, present post-click), one repo-wide axe-core accessibility pass, and SEO meta tag assertions (title, description, canonical, JSON-LD).
- **`tests/menu.spec.ts`**: heading/category presence, price formatting, category-nav anchor scrolling, item name/description presence, allergen notice visibility, NavBar/Footer presence, one axe-core pass.
- **`.lighthouserc.cjs`**: performance/accessibility/best-practices/SEO score thresholds (0.9/0.92/0.9/0.92) plus Core Web Vitals budgets (FCP <1.8s, LCP <2.5s, CLS <0.1, TBT <200ms), run against `/`, `/menu`, `/about`, `/catering`, `/contact` in CI (`.github/workflows/deploy.yml`'s `lighthouse` job).

### Coverage gaps (verified absent, not assumed)

- **Zero test files exist for `/about`, `/catering`, or `/contact`** — Lighthouse audits them, but nothing asserts their content or runs axe-core against them specifically.
- **No test asserts `/impressum` or `/datenschutz` resolve** — both are linked from `Footer.astro` but, as of this writing, only exist on the not-yet-merged `claude/impressum-datenschutz` branch (PR #20). A test asserting these links 200 would correctly fail until that PR merges — this is expected, not a bug to silently work around.
- **No test asserts `MobileBottomBar`'s call/order buttons** point at the correct `tel:`/Lieferando href.
- **No unit tests exist anywhere** — `src/lib/menu.ts`'s filter/sort/group pipeline has real branching logic (category config lookups, drink sub-category grouping) that is only exercised indirectly through `menu.astro`'s rendered output in `tests/menu.spec.ts`, not directly.

## 3. Constraints

- Playwright runs two projects only — `desktop` (1440×900) and `mobile` (375×812, iPhone UA) — both on Chromium (`playwright.config.ts`); no WebKit/Firefox, to avoid extra browser installs in CI.
- `playwright.config.ts` **auto-starts `scripts/serve-dist.mjs`** on `127.0.0.1:8788` via `webServer`, so `pnpm build && npx playwright test` is the whole local workflow. Set `BASE_URL` to test an already-running server or a deployed preview instead, which suppresses the auto-start. Outside CI, `reuseExistingServer` leaves a server you already have on 8788 alone.
- The served output is `dist/client`, i.e. the real built HTML (every route is prerendered). What this does **not** reproduce is `_headers` — CSP, caching, and security headers are applied by Cloudflare at the edge, so no spec may assert them; `pnpm check:csp` covers the CSP instead.
- Selectors use `aria-label`, `id`, and semantic HTML — never `data-testid` (none exist in this codebase, and adding them would be a convention change, not a small fix).
- **Do not pin assertions to Tailwind utility classes.** A colour utility is not a behavioural contract: 17 assertions once silently matched zero elements after `text-brand-gold` became `text-brand-gold-ink` in a contrast fix, and a locator that matches nothing asserts nothing. Prefer accessible names, roles, and rendered text.
- Menu prices render as `8,90 €` — amount first, symbol last, separated by a **non-breaking space (U+00A0)** — because they come from `Intl.NumberFormat('de-AT', { style: 'currency' })`. Match with a regex that accepts either space kind, never the literal `'€8,90'`.
- `wrangler pages dev` does not start in every environment (`No such module wrangler:modules-watch`), which is why the suite no longer depends on it.

## 4. Acceptance Criteria

- Given a new interactive component is added (a modal, a consent gate, a toggle), when it ships, then it needs a Playwright test asserting its before/after state — the drawer and `MapEmbed` tests are the reference pattern.
- Given a new page is added under `src/pages/`, when it ships, then it should be added to the route list in `.lighthouserc.cjs` — **one place now**. The workflow no longer duplicates the URLs as `--collect.url` flags, which removes the drift that once left `/catering` missing from both. Paths need a trailing slash (`trailingSlash: 'always'`), or the audit measures a 301 hop.
- Given `pnpm build` fails on content-schema validation, when investigated, then check `keystatic.config.ts` vs. `src/content.config.ts` for drift first — this is the most common real cause in this codebase's history.

## 5. Agent Execution Rules

- MUST: run `npx playwright test --list` after any test-file edit to confirm it parses, even when full execution isn't possible in-sandbox.
- MUST: add or update a Playwright test for any new user-facing interactive behavior (per `CLAUDE.md`'s execution-loop step 4/5).
- MUST NOT: claim a test suite "passes" without either a real CI run or an explicit statement that only static listing/parsing was verified in-sandbox.
- MUST NOT: add `data-testid` attributes as a shortcut — match the existing `aria-label`/`id`/semantic-HTML selector convention.
