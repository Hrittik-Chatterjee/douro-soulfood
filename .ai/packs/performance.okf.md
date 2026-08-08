---
okf_version: "0.2"
id: "pack/performance"
type: "knowledge"
title: "Performance"
status: "approved"
created: "unknown"
updated: "unknown"
freshness: "current"
lifecycle: "active"
trust: "verified"
provenance:
  source: "repo"
  references: ["docs/performance-budget.md", ".lighthouserc.cjs"]
attestation:
  method: "agent"
  checks: ["values copied verbatim from .lighthouserc.cjs, not approximated"]
summary: "Lighthouse thresholds enforced in CI: performance>=0.90, accessibility>=0.92, SEO>=0.92 (all error-level, block CI), TBT<200ms is the tightest real budget for any client JS."
load_when: "Any change touching JS, images, or page weight; any React island proposal."
token_budget: 350
related: ["docs/performance-budget.md", ".lighthouserc.cjs"]
---

# Performance Budget

Enforced in `.github/workflows/deploy.yml`'s `lighthouse` job against `/`, `/menu`, `/about`, `/catering`, `/contact`: performance ≥0.90, accessibility ≥0.92, SEO ≥0.92 (all `error`-level, block CI), best-practices ≥0.90 (`warn`). FCP <1800ms, LCP <2500ms, CLS <0.1, TBT <200ms (all `error`-level).

**TBT's 200ms budget is the single tightest constraint on any future React island** — a small amount of hydrated JS can consume it alone. `client:visible` over `client:load`, always.

New routes must be added to both `.lighthouserc.cjs` and `deploy.yml`'s `--collect.url` flags together.

Known accepted gap: images referenced from `public/images/` (not `src/assets/`) pass through Astro's `<Image>` unprocessed — no format/compression gain, only correct `width`/`height`/`decoding="async"`. Documented in `docs/audit/image-audit.md`, not a live regression.

**Fixed**: `HeroSection.astro`'s two hero videos (4.9MB + 7.6MB) both loaded on every visit regardless of viewport — CSS `hidden`/`block` doesn't stop fetching. Fixed with a viewport-matched JS loader; verified only 1 loads per viewport, none under `prefers-reduced-motion: reduce`.

**Full detail**: `docs/performance-budget.md`.
