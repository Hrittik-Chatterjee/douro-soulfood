---
okf_version: "0.2"
id: "docs/architecture"
type: "knowledge"
title: "Architecture: D'ouro Soulfood"
status: "approved"
created: "unknown"
updated: "unknown"
freshness: "current"
lifecycle: "active"
trust: "verified"
provenance: { source: "human", references: [] }
attestation: { method: "manual", checks: [] }
summary: "Stack decision matrix, rendering strategy, content architecture, component hierarchy, build pipeline, directory conventions."
load_when: "Structural/rendering/build-pipeline questions."
token_budget: 1200
related: [".ai/packs/architecture.okf.md"]
---

# Architecture: D'ouro Soulfood

> **Version:** 0.2.0

---

## Stack Decision Matrix

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Astro 6 | Content-first, Cloudflare-native, zero-JS by default |
| Styling | Tailwind CSS v4 | Design token integration via `@theme`, JIT |
| CMS | Keystatic | Git-backed, visual editing, Astro-native support |
| Hosting | Cloudflare Pages / Workers | Free tier, edge CDN, zero cold starts |
| Images | Astro `<Image>` | `imageService: 'compile'` is used across `MenuItemCard`, `MenuBistroCard`, `FeatureCard`, `PhotoGrid`, and the `menu.astro` showcase rows — zero raw `<img>` remain in `index.astro`/`menu.astro` as of the IMG-01 fix. Note: since source files live in `public/images/` (not `src/assets/`), Astro's image service passes them through unprocessed (correct `width`/`height`/`decoding="async"`, no format/compression gain) — see `docs/audit/image-audit.md`. |
| Maps | Google Maps Embed, consent-gated | Two-click `MapEmbed.astro` component: static placeholder by default, real iframe only loads after the visitor clicks through (no request to Google before consent) |
| Client JS | None by default; React-as-island only, tightly scoped | See `docs/adr/react-islands.md` — Astro + vanilla `<script>` is the default for all interactivity (mobile nav drawer, Maps consent gate, today's-hours widget all use this pattern); React is not installed and requires an explicit, approved ADR-scoped exception before any dependency is added |

---

## Rendering Strategy

```
┌─────────────────────────────────────────┐
│  Astro 6 — output: 'server'             │
│  (Cloudflare adapter, SSR-capable)      │
│                                         │
│  Prerendered (export const prerender    │
│  = true on every page):                │
│  ├── / (home)                           │
│  ├── /menu                              │
│  ├── /about                             │
│  ├── /catering                          │
│  └── /contact                           │
│                                         │
│  SSR (not prerendered):                 │
│  ├── /keystatic/[...params]  (admin UI) │
│  └── /api/keystatic/[...params] (API)   │
│                                         │
│  Client Islands: none — no React/JS     │
│  framework integration is registered    │
└─────────────────────────────────────────┘
```

All real pages are prerendered to static HTML at build time; only Keystatic's own admin routes run server-side.

---

## Content Architecture

```
Keystatic Collections
├── menu_items     → Dish name, description (DE/EN), price, image, category,
│                     sub-category, dietary tags, allergens, prep time,
│                     add-ons, price variants, order, featured, available
└── faq            → Question/answer pairs, display order

Keystatic Singletons
└── settings       → Site name, contact info, address, hours, social links,
                      Lieferando order URL
```

### Content Flow
```
Editor → Keystatic Admin (/keystatic)
  → Commits JSON to Git (src/content/menu-items/, src/content/faq/,
    src/content/settings/)
  → Triggers Cloudflare Pages build
  → Live in ~30 seconds
```

`keystatic.config.ts` (the CMS schema) and `src/content.config.ts` (Astro's typed content-collection schema) are two independent definitions of the same data shapes and must be kept in sync by hand.

---

## Component Hierarchy

```
Base.astro (layout)
├── NavBar.astro (src/components/layout/)
│   ├── Logo
│   ├── Desktop nav links
│   └── Mobile drawer (full-screen overlay + hamburger toggle)
│
├── <slot /> (page content, e.g. index.astro)
│   ├── HeroSection.astro       (src/components/sections/)
│   ├── ReviewBadge.astro        (src/components/ui/)
│   ├── CategoryIcon.astro        (src/components/ui/)
│   ├── FeatureCard.astro          (src/components/sections/)
│   ├── UserReviews.astro           (src/components/sections/)
│   ├── PhotoGrid.astro              (src/components/sections/, used twice:
│   │   Popular Dishes + Galerie)
│   ├── OurStorySection.astro         (src/components/sections/)
│   ├── FaqAccordion.astro             (src/components/sections/)
│   └── inline sections (map/location — hand-written markup in
│       index.astro, composing the MapEmbed.astro component)
│
├── MenuItemCard.astro / MenuBistroCard.astro  (src/components/sections/,
│   used on menu.astro)
├── AllergenBadge.astro / DietaryBadge.astro / AllergenHeaderLegend.astro
│   (src/components/ui/)
│
├── MobileBottomBar.astro (src/components/layout/, rendered by Base.astro
│   directly, present on every page)
│
└── Footer.astro (src/components/layout/)
```

---

## Build Pipeline

```
pnpm build (= astro build)
  │
  ├── Reads content collections (getCollection('menu_items'),
  │   getCollection('faq')) + settings singleton (direct JSON import)
  ├── Pre-renders all 7 real routes to static HTML
  ├── Bundles Keystatic's admin UI/API as SSR routes
  ├── Tree-shakes unused Tailwind utilities
  ├── Compiles/optimizes images via the Cloudflare adapter's image service
  ├── Generates sitemap.xml (@astrojs/sitemap)
  └── Outputs to dist/ (dist/client static assets + dist/server Worker)
        │
        └── Cloudflare Pages
              ├── Serves static assets from the edge
              ├── Runs the Worker for /keystatic and /api/keystatic
              └── public/_headers applies security headers (CSP, HSTS, etc.)
```

---

## Directory Conventions

- `src/components/ui/` — Design system atoms (Button, AllergenBadge, DietaryBadge, CategoryIcon, ReviewBadge, AllergenHeaderLegend)
- `src/components/sections/` — Page composites (HeroSection, FeatureCard, UserReviews, MenuItemCard, MenuBistroCard)
- `src/components/layout/` — Nav, Footer, MobileBottomBar
- `src/content/` — Keystatic-managed content (menu-items/, faq/, settings/)
- `src/lib/` — Shared logic (menu.ts: category config + filter/sort/group pipeline)
- `src/layouts/` — Page layouts (Base.astro)
- `src/pages/` — Route files
- `src/styles/` — Global CSS, design tokens
- `public/` — Static assets (images, favicon, `_headers`)
- `docs/` — Project documentation for humans and AI agents
