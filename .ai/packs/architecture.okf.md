---
okf_version: "0.2"
id: "pack/architecture"
type: "knowledge"
title: "Architecture"
status: "approved"
created: "unknown"
updated: "unknown"
freshness: "current"
lifecycle: "active"
trust: "verified"
provenance:
  source: "repo"
  references: ["docs/architecture.md", "astro.config.mjs"]
attestation:
  method: "agent"
  checks: ["cross-checked against astro.config.mjs and current component tree"]
summary: "Astro 6, output:'server' with @astrojs/cloudflare adapter; all 5 real routes prerendered; Keystatic content flow; component hierarchy under src/components/{layout,sections,ui}/."
load_when: "Rendering strategy, content flow, component hierarchy, or build pipeline questions."
token_budget: 350
related: ["docs/architecture.md"]
---

# Architecture

Astro 6, `output: 'server'` + `@astrojs/cloudflare` adapter (`imageService: 'compile'`) — all 7 real routes prerendered (incl. /impressum, /datenschutz) to static HTML at build time; only `/keystatic` and `/api/keystatic` are SSR. No client-JS framework registered.

Content flow: Keystatic admin → commits JSON to `src/content/` → Cloudflare Pages build → live in ~30s. `keystatic.config.ts` and `src/content.config.ts` are two independent schema definitions of the same shapes — keep hand-synced.

Component layout: `src/components/layout/` (Nav, Footer, MobileBottomBar), `src/components/sections/` (page composites — HeroSection, FeatureCard, PhotoGrid, FaqAccordion, OurStorySection, MenuItemCard, MenuBistroCard), `src/components/ui/` (atoms).

**Full detail**: `docs/architecture.md`.
