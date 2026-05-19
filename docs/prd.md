# PRD: D'ouro Soulfood Bistro — Website

> **Version:** 0.1.0
> **Status:** Active Development
> **Client:** D'ouro Soulfood Bistro, Salzburg, Austria
> **Stack:** Astro 6 + TinaCMS + Cloudflare Pages

---

## 1. Product Overview

A premium restaurant website for D'ouro Soulfood Bistro — a Brazilian/Latin/African fusion restaurant at Auerspergstraße 10, 5020 Salzburg, Austria. Owner: Angela (Brazilian roots).

**Design DNA:** Systematic clone of talkintacos.net's structure, rebuilt with a unique Apple iOS-inspired design system using Aceternity UI motion patterns. Dark-theme dominant with warm Brazilian gold accents.

**Goal:** Drive online orders, showcase the menu, build brand presence in Salzburg's food scene.

---

## 2. Target Audience

- **Primary:** Salzburg locals (German & English speakers) aged 22-45
- **Secondary:** Tourists visiting Salzburg looking for non-traditional Austrian cuisine
- **Tertiary:** Foodora/delivery platform users discovering the brand

---

## 3. Core Pages (MVP)

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Hero carousel, gallery, featured dishes, about section, location card, FAQ |
| Menu | `/menu` | Full menu with categories, prices, dietary tags |
| About | `/about` | Angela's story, Brazilian roots, philosophy |
| Catering & Events | `/catering` | Catering services, event booking form |
| Contact | `/contact` | Location map, hours, phone, reservation link |

---

## 4. Section Inventory (Home Page)

Mapped from talkintacos.net, adapted for D'ouro:

1. **Sticky Nav** — Glass morphism, logo left, links center, CTA right
2. **Hero Carousel** — Full-bleed food photography with gradient overlay, tagline, dual CTA (Pickup/Delivery)
3. **Food Gallery Grid** — 2×3 (mobile) / 3×3 grid, lightbox on click, hover zoom
4. **Feature Card — Catering** — Split image+text with backdrop blur card
5. **Feature Card — Story** — Split reverse, Angela's story
6. **Featured Menu Scroll** — Horizontal scroll of signature dishes
7. **Gift Cards / Specials** — Alternating image+text section
8. **FAQ Accordion** — Known dishes, hours, dietary accommodations
9. **Location Card** — Map, address, hours, order CTA
10. **Footer** — Social links, legal, quick nav

---

## 5. Content Management (TinaCMS)

All content editable via TinaCMS admin at `/admin`:

- **Pages:** Hero text, section content, CTAs
- **Menu Items:** Name, description, price, image, dietary tags, category
- **Gallery Images:** Upload, reorder, alt text
- **FAQ:** Question/answer pairs
- **Hours:** Operating hours per day
- **Site Settings:** Logo, social links, contact info, SEO defaults

---

## 6. Technical Requirements

| Requirement | Spec |
|-------------|------|
| Framework | Astro 6.x (Node 22+) |
| CMS | TinaCMS (Git-backed, self-hosted option) |
| Hosting | Cloudflare Pages (free tier) |
| Styling | Tailwind CSS v4 + custom design system |
| Components | Aceternity UI-inspired (Apple iOS motion) |
| i18n | German (primary) + English |
| Performance | Lighthouse 95+ all categories |
| Accessibility | WCAG 2.1 AA minimum |
| CSP | Astro 6 built-in CSP enabled |
| Images | Astro Image optimization, WebP/AVIF |
| Analytics | Cloudflare Web Analytics (cookie-free) |

---

## 7. SEO Requirements

- Schema.org `Restaurant` structured data
- OpenGraph + Twitter cards per page
- Canonical URLs
- Sitemap.xml via @astrojs/sitemap
- `robots.txt` with proper directives
- Local SEO: Google Business Profile alignment
- Meta descriptions for all pages
- Alt text for all images

---

## 8. Performance Targets

- **LCP:** < 1.5s
- **FID:** < 50ms
- **CLS:** < 0.05
- **TTI:** < 2.0s
- **Bundle:** < 100KB JS total (Astro islands)
- **Images:** Lazy-loaded with blur placeholders

---

## 9. Third-Party Integrations

| Service | Purpose |
|---------|---------|
| Foodora | Delivery link-out |
| Google Maps | Location embed |
| Cloudflare Analytics | Privacy-first analytics |
| TinaCMS Cloud / Self-hosted | Content management |

---

## 10. Success Metrics

- Direct online orders increase 30% in first 3 months
- Organic search traffic from "restaurant salzburg" cluster
- Lighthouse score 95+ sustained
- Content updates by client without developer intervention
