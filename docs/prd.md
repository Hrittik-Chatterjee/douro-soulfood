---
okf_version: "0.2"
id: "docs/prd"
type: "knowledge"
title: "PRD: D'ouro Soulfood Bistro — Website"
status: "approved"
created: "unknown"
updated: "unknown"
freshness: "current"
lifecycle: "active"
trust: "verified"
provenance: { source: "human", references: [] }
attestation: { method: "manual", checks: [] }
summary: "Product overview, target audience, core pages, homepage section inventory, Keystatic content model, technical requirements, SEO/performance targets, third-party integrations."
load_when: "Product-scope questions, new page/feature decisions, understanding what the site is for."
token_budget: 1200
related: [".ai/packs/repo-overview.okf.md"]
---

# PRD: D'ouro Soulfood Bistro — Website

> **Version:** 0.2.0
> **Status:** Active Development
> **Client:** D'ouro Soulfood Bistro, Salzburg, Austria
> **Stack:** Astro 6 + Keystatic CMS + Cloudflare Pages

---

## 1. Product Overview

A restaurant website for D'ouro Soulfood Bistro — a Brazilian/Latin/African fusion restaurant at Auerspergstraße 10, 5020 Salzburg, Austria. Owner: Angela (Brazilian roots).

**Design DNA:** Apple iOS-inspired light-theme design system with warm Brazilian gold/terracotta accents. Structural layout conventions reference talkintacos.net; all colors, fonts, and content are D'ouro's own.

**Goal:** Drive online orders, showcase the menu, build brand presence in Salzburg's food scene.

---

## 2. Target Audience

- **Primary:** Salzburg locals (German & English speakers) aged 22-45
- **Secondary:** Tourists visiting Salzburg looking for non-traditional Austrian cuisine
- **Tertiary:** Lieferando delivery-platform users discovering the brand

---

## 3. Core Pages (MVP)

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Hero, review badge, category grid, popular dishes gallery, catering/reviews feature cards, "Our Story", photo gallery, FAQ accordion, location/map |
| Menu | `/menu` | Full menu with categories, prices, dietary tags, allergen legend |
| About | `/about` | Angela's story, Brazilian roots, philosophy |
| Catering & Events | `/catering` | Catering services, private events |
| Contact | `/contact` | Address, phone, hours (sourced from Keystatic settings), map, route-planning CTA |

---

## 4. Section Inventory (Home Page)

Reflects what `src/pages/index.astro` actually renders — mostly hand-written inline sections, not separate reusable components:

1. **NavBar** — scroll-transition header with a coupled mobile drawer
2. **Hero** — single image (optional video), headline, dual CTA (`HeroSection.astro`)
3. **Review Badge** — star rating strip below the hero
4. **Category Grid** — icon-linked scroll to menu categories
5. **Popular Dishes** — photo grid of featured items, using `PhotoGrid.astro`
6. **Feature Cards** — catering + reviews, using `FeatureCard.astro`
7. **Our Story** — Angela's lockdown origin story, using `OurStorySection.astro`
8. **Photo Gallery** — plain grid, no lightbox, using `PhotoGrid.astro` (same component as Popular Dishes)
9. **FAQ Accordion** — plain `<details>`-based accordion, using `FaqAccordion.astro`
10. **Location/Map** — address, hours, consent-gated Google Maps embed (static placeholder until the visitor clicks "Karte anzeigen")
11. **Footer** — social links, legal, quick nav

---

## 5. Content Management (Keystatic)

Content editable via the Keystatic admin at `/keystatic`:

- **Menu Items** (collection): name (DE/EN), description, price, image, category, sub-category, dietary tags, allergens, prep time, add-ons, price variants, display order, featured, available
- **FAQ** (collection): question/answer pairs, display order
- **Site Settings** (singleton): site name, tagline, phone, email, address, city, postal code, country, Google Maps URL, Lieferando order URL, logo, OG image, social links, operating hours

The home page's copy (hero headline, story text, gallery images) is currently hardcoded in `index.astro`, not CMS-managed — there was previously a "Home Page" Keystatic singleton, but it was unused (nothing read it) and has been removed. If homepage content needs to become CMS-editable, that's a deliberate follow-up requiring new source images and a copy decision, not a small fix.

---

## 6. Technical Requirements

| Requirement | Spec |
|-------------|------|
| Framework | Astro 6.x (Node 22.12+) |
| CMS | Keystatic (Git-backed, local storage mode) |
| Hosting | Cloudflare Pages (free tier) |
| Styling | Tailwind CSS v4 + custom design token system |
| i18n | German (primary) + English (some fields) |
| Accessibility | Playwright + `@axe-core/playwright` accessibility assertions in E2E tests |
| Security headers | CSP, HSTS, X-Frame-Options, etc. via `public/_headers` |
| Images | Astro `<Image>` used by menu-card/feature components; raw `<img>` still used in page-level image grids |
| Analytics | None currently configured |

---

## 7. SEO Requirements

- Schema.org `Restaurant` structured data (`Base.astro`)
- OpenGraph + Twitter cards per page
- Canonical URLs
- Sitemap.xml via `@astrojs/sitemap`
- `robots.txt` with `/keystatic/` disallowed
- Meta descriptions for all pages

---

## 8. Performance Targets

- Lighthouse CI runs against `/`, `/menu`, `/about`, `/catering`, `/contact` (`.lighthouserc.cjs`, `.github/workflows/deploy.yml`)
- No client-side JS framework — this is a fully static/prerendered site, keeping JS payload minimal by construction

---

## 9. Third-Party Integrations

| Service | Purpose |
|---------|---------|
| Lieferando | Delivery/order link-out (migrated from Foodora) |
| Google Maps | Consent-gated location embed (Contact page + home page location section) |

---

## 10. Success Metrics

- Direct online orders via the Lieferando link
- Organic search traffic from "restaurant salzburg" cluster
- Content updates by client without developer intervention (Menu Items, FAQ, Settings are all Keystatic-editable today)
