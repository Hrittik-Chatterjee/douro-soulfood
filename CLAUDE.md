# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Read `AGENTS.md` first, then `.ai/INDEX.md`.

`AGENTS.md` is the universal, agent-agnostic entrypoint for this repository (identity, prime directives, non-negotiable constraints, task loop, stop conditions). `.ai/INDEX.md` maps every deeper doc, its token budget, and when to load it — load only what your specific task needs from there.

Also load, as needed: `.ai/status.md` (or `node .ai/scripts/agent-status.mjs` for live data) for current repo state, `.ai/agents/README.md` for the agent role matrix, `.ai/commands/README.md` for the command registry, `.ai/hooks/README.md` for expected behavior at each stage.

The prior, full "Outcome-Driven AI SDLC Operator" policy that used to live in this file (component architecture policy, prebuilt-component protocol, visual outcome protocol, autonomous outcome backlog, execution loop, JSON report format) has been relocated to `.ai/packs/outcome-operator.okf.md` — nothing was deleted, only moved so this file can stay a short pointer per the Agent-Native Repo OS convention. See `.ai/decisions/agent-entrypoint-reconciliation.okf.md` for why.

## Commands

```bash
pnpm install                    # install deps (pnpm 9, Node >=22.12)
pnpm dev                        # wrangler pages dev on :8788 — Workers runtime, matches prod; use this, not astro dev
pnpm dev:astro                  # plain astro dev (faster HMR, but does not simulate the Cloudflare runtime)
pnpm build                      # astro build -> dist/
pnpm preview                    # preview the built dist/
pnpm format                     # prettier --write . (astro plugin included)
pnpm test:e2e                   # playwright tests (tests/) against wrangler dev on :8788, NOT astro dev
pnpm test:e2e:ui                # playwright UI mode
pnpm test:e2e -- tests/foo.spec.ts        # run a single test file
pnpm test:e2e -- -g "test name"           # run tests matching a title
pnpm lhci                       # Lighthouse CI (lighthouserc.js) — perf/a11y budget check
```

No separate lint script; `pnpm format` (Prettier) is the only formatting gate. TypeScript checking happens via `astro build` / editor tooling, not a standalone `tsc` script.

Playwright and Lighthouse both need a Chromium binary and may not run in a sandboxed environment — if a command can't execute, report `not_run` honestly per `AGENTS.md`'s verification rule; don't fabricate a pass.

## Architecture

- **Stack**: Astro 6 (static output) + Tailwind v4 + Keystatic CMS (Git-backed), deployed to Cloudflare Pages/Workers via `@astrojs/cloudflare`. No React or other client-JS framework is installed — see the "Non-negotiable constraints" in `AGENTS.md` before adding one.
- **Content flow**: content lives as JSON under `src/content/{menu-items,faq,settings}/`, editable through the Keystatic admin UI at `/keystatic` (config: `keystatic.config.ts`). Astro reads the same files through `src/content.config.ts` (zod-validated collections) for type-safe `getCollection()` calls in pages/components. **These two schema files are hand-synced, not generated from one another** — any content-shape change must be made in both.
- **Component layers** (`src/components/`): `ui/` — small atoms (Button, AllergenBadge, DietaryBadge, CategoryIcon, ReviewBadge); `sections/` — page-level composites (HeroSection, MenuItemCard, MenuBistroCard, UserReviews); `layout/` — chrome shared across pages (NavBar, Footer, MobileBottomBar). `src/lib/menu.ts` holds shared menu logic consumed by both.
- **Styling**: all colors/spacing/etc. come from CSS custom properties in `src/styles/tokens.css` (`var(--color-*)`) — no hardcoded hex values except literal flag-emoji SVG fills. Conditional classes use Astro's `class:list={[...]}`; there is no `cn()`/`clsx` helper in this repo.
- **Images**: `src/pages/**` uses Astro's `<Image>` component, not raw `<img>`, for page-level grids.
- **Ordering flow**: no cart/checkout in this codebase — the site's only "order" action hands off to an external Lieferando link.
- **Docs**: deeper technical/design/content decisions live in `docs/` (architecture, design-system, components, prd) and `.ai/decisions/*.okf.md` (settled calls — check before proposing to redo one). `.ai/INDEX.md` is the router into all of it.

## UI & Visual Stability Rules (DO NOT BREAK UI)

- **No Unrequested UI Resizing or Refactoring**: Never arbitrarily alter established component dimensions, heights, paddings, fonts, or component hierarchy (e.g., in `MobileBottomBar`, `NavBar`, `HeroSection`) unless explicitly instructed by the user.
- **Preserve Tested Component Sizing**:
  - `MobileBottomBar.astro`: Keep buttons at the compact `min-h-11` (44px) height and `text-sm` (14px) typography. Do not inflate buttons or alter their brand styling.
  - Maintain verified responsive breakpoints (`lg:hidden` on mobile/tablet bar, `lg:flex` on desktop nav).
- **Avoid Speculative "Improvements"**: Do not make speculative adjustments to touch targets, typography scales, or layouts under the guise of general audits without explicit user approval.
- **Visual Verification**: Before finishing any UI task, verify layout integrity across mobile (<768px), tablet (768–1023px), and desktop (1024px+) viewports.
