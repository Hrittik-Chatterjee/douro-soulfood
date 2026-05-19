# Architecture: D'ouro Soulfood

> **Version:** 0.1.0

---

## Stack Decision Matrix

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Astro 6 | Content-first, island architecture, Cloudflare-native |
| UI Islands | React 19 | Aceternity components, Framer Motion, ecosystem |
| Styling | Tailwind CSS v4 | Design token integration, JIT, tree-shaking |
| CMS | TinaCMS | Git-backed, visual editing, Astro-native support |
| Hosting | Cloudflare Pages | Free tier, edge CDN, zero cold starts |
| Images | Astro Image | Auto WebP/AVIF, responsive srcset |
| Analytics | CF Web Analytics | Cookie-free, GDPR-compliant, zero JS |
| Maps | Google Maps Embed | Static map image for performance |

---

## Rendering Strategy

```
┌─────────────────────────────────────────┐
│  Astro 6 — Hybrid Output               │
│                                         │
│  Static (prerendered):                  │
│  ├── / (home)                           │
│  ├── /menu                              │
│  ├── /about                             │
│  ├── /catering                          │
│  ├── /contact                           │
│  └── /admin (TinaCMS)                   │
│                                         │
│  SSR (on-demand): none for MVP          │
│                                         │
│  Client Islands (React):               │
│  ├── HeroCarousel (client:visible)      │
│  ├── FoodGallery lightbox (client:idle) │
│  ├── MenuFilter (client:visible)        │
│  ├── FAQAccordion (client:idle)         │
│  └── MobileMenu (client:idle)           │
└─────────────────────────────────────────┘
```

---

## Content Architecture

```
TinaCMS Collections
├── pages          → Home, About, Catering, Contact content
├── menu_items     → Dish name, description, price, image, tags, category
├── gallery        → Image uploads with alt text and ordering
├── faq            → Question/answer pairs
├── settings       → Site-wide: logo, hours, contact, social links
└── specials       → Promotions, seasonal offers
```

### Content Flow
```
Editor → TinaCMS Admin (/admin)
  → Saves to Git (markdown/JSON in src/content/)
  → Triggers Cloudflare Pages build
  → Live in ~30 seconds
```

---

## Component Hierarchy

```
Base.astro (layout)
├── GlassNav.astro
│   ├── Logo
│   ├── NavLinks
│   ├── MobileMenuToggle
│   └── OrderCTA (Button)
│
├── <slot /> (page content)
│   │
│   ├── HeroCarousel.tsx (React island)
│   ├── SectionContainer.astro
│   │   └── FoodGallery.tsx (React island)
│   ├── FeatureCard.astro
│   ├── MenuScroll.tsx (React island)
│   ├── FAQAccordion.tsx (React island)
│   └── LocationCard.astro
│
└── Footer.astro
    ├── QuickNav
    ├── SocialLinks
    └── Legal
```

---

## Build Pipeline

```
npm run build
  │
  ├── 1. tinacms build
  │     └── Generates GraphQL client + content index
  │
  ├── 2. astro build
  │     ├── Reads content collections
  │     ├── Pre-renders all pages to HTML
  │     ├── Tree-shakes unused Tailwind
  │     ├── Optimizes images (WebP/AVIF)
  │     ├── Generates sitemap.xml
  │     └── Outputs to dist/
  │
  └── 3. Cloudflare Pages
        ├── Serves from edge (300+ PoPs)
        ├── Applies CF Web Analytics
        └── CDN caches static assets
```

---

## Performance Budget

| Metric | Budget | Strategy |
|--------|--------|----------|
| HTML | < 30KB gzip | Astro pre-renders, minimal DOM |
| CSS | < 15KB gzip | Tailwind purge + token-only custom |
| JS | < 100KB total | Islands only, no full-page hydration |
| Images | WebP < 200KB each | Astro Image srcset + lazy |
| Fonts | < 50KB | Inter subset, WOFF2 only |
| LCP | < 1.5s | Preload hero, inline critical CSS |
| CLS | < 0.05 | Explicit image dimensions |

---

## Directory Conventions

- `src/components/ui/` — Design system atoms (Button, Card, Badge, Input, etc.)
- `src/components/sections/` — Page sections (Hero, Gallery, FAQ, etc.)
- `src/components/layout/` — Nav, Footer, SEO head
- `src/content/` — CMS-managed content (markdown, JSON)
- `src/layouts/` — Page layouts
- `src/pages/` — Route files
- `src/styles/` — Global CSS, design tokens
- `public/` — Static assets (fonts, images, favicon)
- `tina/` — TinaCMS configuration
- `docs/` — Project documentation for humans and AI agents
