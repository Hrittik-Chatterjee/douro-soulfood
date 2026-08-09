# Current-State Audit (OUTCOME-000)

> Produced per `CLAUDE.md`'s `OUTCOME-000` — confirms or corrects the grounding truth against actual repo files. Every claim below was checked directly against the named file at the time of writing (`main`, commit `596b9fe` and earlier this session); nothing here is inferred from memory alone.

## 1. Stack — confirmed accurate
- `package.json`: `astro@^6.4.8`, `@astrojs/cloudflare@^13.0.0`, `@astrojs/sitemap@^3.0.0`, `@keystatic/astro@^5.2.0`, `@keystatic/core@^0.5.50`, `tailwindcss@^4.0.0`, `@tailwindcss/vite@^4.0.0`. `engines.node: ">=22.12.0"`. `packageManager: pnpm@9.15.9`.
- **No React** in `dependencies` or `devDependencies` — confirms `CLAUDE.md`'s premise that a React-island policy doesn't exist yet because React isn't installed at all (it was removed in an earlier cleanup pass; not merely "never added").
- `devDependencies`: `@axe-core/playwright`, `@playwright/test`, `wrangler`, `prettier` (+ `prettier-plugin-astro`), `typescript`. No unit-test runner (Vitest/Jest) exists.
- `astro.config.mjs`: `output: 'server'`, `@astrojs/cloudflare` adapter (`platformProxy: { enabled: true }`, `imageService: 'compile'`), `image.remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }]`, integrations `sitemap()` + `keystatic()`. No React integration registered.

## 2. Content model — confirmed accurate
- `keystatic.config.ts`: `storage.kind: 'local'`. Two collections (`menu_items`, `faq`) + one singleton (`settings`) — matches `docs/architecture.md`'s Content Architecture diagram exactly, field-for-field re-checked against `menu_items`' schema (title/slug, description, descriptionEn, price in EUR cents, image, category enum incl. `seafood`/`sides`/`desserts` not currently used by any live content but present as valid enum values, subCategory for drinks).
- `src/content.config.ts` was not re-read line-by-line in this audit pass (already verified in sync during this session's earlier work — no changes to either schema file happened since); flagged here as "trust but recheck if either file changes."

## 3. Design system — confirmed accurate
- `src/styles/tokens.css` is the single source of design tokens (`--color-brand-gold`, `--radius-*`, `--ease-spring`, etc.), referenced via `var(--...)`. Confirmed zero hardcoded hex colors outside legitimate flag-SVG fills (re-verified in a prior audit pass this session, unchanged since).
- Light theme is default (`<html lang="de-AT" class="light">` in `Base.astro`) — confirmed.

## 4. Known issues — status corrected from `CLAUDE.md`'s stated list
`CLAUDE.md`'s `<known_issues>` block was written referencing a **prior** state of this repo. As of this audit, three of the six are already resolved:

| Issue | `CLAUDE.md` claim | Actual current state |
|---|---|---|
| `DOC-01` | "Missing output-driven docs: personas, user flows, test plan, security, release, analytics, performance budget." | `docs/personas.md`, `docs/user-flows.md`, `docs/test-plan.md`, `docs/security.md`, `docs/release.md` **already exist** (merged this session). Only `docs/analytics.md` and `docs/performance-budget.md` are genuinely still missing. |
| `ARCH-02` | "No formal React island policy." | Still true — this audit's own `OUTCOME-002` addresses it. |
| `UI-01` | "No visual component preview route." | Still true — this audit's own `OUTCOME-004` addresses it. |
| `A11Y-01` | "Missing skip-to-main-content link." | **Already fixed.** `Base.astro` has a `sr-only`/`focus:not-sr-only` skip link targeting `<main id="main-content">`, with a Playwright test covering it. |
| `IMG-01` | "Some pages still use raw img tags instead of Astro Image." | **Already fixed.** `index.astro` and `menu.astro` have zero raw `<img>` tags — all converted to Astro `<Image>` with real per-file pixel dimensions. |
| `CMS-01` | "Some homepage sections are hardcoded and not componentized." | **Already fixed.** FAQ accordion, photo grids (Popular Dishes + Galerie, deduplicated into one shared component), and the "Our Story" section are all extracted into `src/components/sections/{FaqAccordion,PhotoGrid,OurStorySection}.astro`. |

**Implication for the backlog below**: `OUTCOME-005`, `OUTCOME-006`, and `OUTCOME-007` are satisfied by existing work, verified against this audit's own acceptance criteria rather than re-implemented from scratch (re-doing already-correct work would be pure noise, contradicting `CLAUDE.md`'s own "smallest correct change" directive).

## 5. Routes — confirmed accurate
`src/pages/`: `index.astro`, `menu.astro`, `about.astro`, `catering.astro`, `contact.astro` — 5 real routes at the time of this audit, all `export const prerender = true`. (`impressum.astro` and `datenschutz.astro` were added later, bringing it to 7.) `keystatic()` integration adds SSR-only `/keystatic` and `/api/keystatic` routes. No other routes exist prior to this audit (this backlog's `OUTCOME-004` adds `/dev/ui`).

## 6. Outstanding, not part of this backlog
- `impressum.astro`/`datenschutz.astro` exist only on the still-unmerged `claude/impressum-datenschutz` branch (PR #20), blocked on business-owner legal facts — unrelated to this backlog, unchanged.
- `Base.astro`'s inline JSON-LD script is a documented (in `docs/security.md`), unfixed CSP/nonce gap — unrelated to this backlog, unchanged.
