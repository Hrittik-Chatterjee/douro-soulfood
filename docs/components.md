---
okf_version: "0.2"
id: "docs/components"
type: "knowledge"
title: "Components Reference"
status: "approved"
created: "unknown"
updated: "unknown"
freshness: "current"
lifecycle: "active"
trust: "verified"
provenance: { source: "human", references: [] }
attestation: { method: "manual", checks: [] }
summary: "Full prop-level API reference for every component in the design system, organized by ui/sections/layout."
load_when: "Building or modifying any component."
token_budget: 1500
related: [".ai/packs/components.okf.md"]
---

# Components Reference

> API docs for all components in the D'ouro Soulfood design system. All components are `.astro` — no client-side JS framework is used anywhere in this codebase.
>
> Building a new component that's hard to get right from scratch (a11y-sensitive interactions like a combobox or modal)? See `docs/prebuilt-components.md` for the borrow-and-adapt protocol before hand-rolling one. If the component needs real client-side interactive state, see `docs/adr/react-islands.md` first — React is not installed in this repo and requires explicit approval.
>
> All new components must be previewable at `/dev/ui` in dev mode (see `CLAUDE.md`'s visual outcome protocol).

---

## UI Atoms (`src/components/ui/`)

### Button
**File:** `src/components/ui/Button.astro`
**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| href | string | — | Link destination |
| target | '_blank' \| '_self' | — | Added 2026-08-07 for external CTAs (Footer's order link); omit for internal links |
| rel | string | — | Added alongside `target` — pass `"noopener noreferrer"` with `target="_blank"` |
| variant | 'primary' \| 'secondary' \| 'ghost' | 'primary' | Visual style |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size variant |
| arrow | boolean | false | Show animated arrow icon |
| class | string | '' | Additional classes — appended after the component's own classes, so a same-category utility (e.g. `font-extrabold`) here correctly overrides the default (e.g. `font-semibold`) |

Consumers as of 2026-08-07: `FeatureCard.astro` (original), `PhotoGrid.astro`'s CTA, the homepage map section's "Jetzt bestellen" CTA, and `Footer.astro`'s order CTA — consolidated from hand-rolled `<a>` markup during a spacing-consistency pass to close tap-target and padding drift between otherwise-identical CTA buttons.

---

### AllergenBadge
**File:** `src/components/ui/AllergenBadge.astro`
Renders a single allergen code badge (e.g. "G/M"), used inside `MenuItemCard`.

### DietaryBadge
**File:** `src/components/ui/DietaryBadge.astro`
Renders a single dietary tag badge (vegan, vegetarian, gluten-free, spicy, halal, dairy-free), used inside `MenuItemCard`.

### CategoryIcon
**File:** `src/components/ui/CategoryIcon.astro`
Renders the vector icon for a menu category (appetizers, tacos, bowls, etc.) — used on both the home page's category grid and the menu page's category navigation.

### ReviewBadge
**File:** `src/components/ui/ReviewBadge.astro`
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| rating | number | Star rating (e.g. 4.8) |

Renders the star-rating badge shown on the home page below the hero.

### AllergenHeaderLegend
**File:** `src/components/ui/AllergenHeaderLegend.astro`
Renders the allergen code legend and bilingual (DE/EN) disclaimer shown at the top of the menu page.

### MapEmbed
**File:** `src/components/ui/MapEmbed.astro`
Consent-gated Google Maps embed ("two-click" pattern): renders a static placeholder card (address text + a "Karte anzeigen" button) by default, and only injects the real `<iframe>` after the visitor clicks through — no request to Google fires, and no visitor IP is sent, until they opt in. Used on the home page and `contact.astro`.
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| src | string | The Google Maps embed URL to load after consent |
| title | string | `<iframe>` accessible title |
| addressLabel | string | Address text shown on the placeholder card |
| class | string | Additional classes |

---

## Section Components (`src/components/sections/`)

### HeroSection
**File:** `src/components/sections/HeroSection.astro`
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| accent | string | Small accent label above the headline |
| headline | string | Main `<h1>` heading |
| subheadline | string | Supporting text |
| images | { src, alt, width, height }[] | Hero image(s) |
| ctaPrimary | { label, href } | Primary CTA button |
| ctaSecondary | { label, href } | Secondary CTA button |

The primary/secondary CTAs render inside a `hidden md:flex` container — not visible on mobile viewports by design.

### FeatureCard
**File:** `src/components/sections/FeatureCard.astro`
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| title | string | Card heading |
| description | string | Body text |
| image | { src, alt } | Feature image |
| cta | { label, href } | Action button |
| reverse | boolean | Flip image/text order |

### UserReviews
**File:** `src/components/sections/UserReviews.astro`
Renders the guest-reviews section on the home page.

### PhotoGrid
**File:** `src/components/sections/PhotoGrid.astro`
Heading + responsive photo grid (2 cols mobile, 3 cols desktop; 8 photos on mobile, 9 on desktop). Used on the home page for both "Beliebte Gerichte" (Popular Dishes) and "Galerie" — these previously duplicated the same markup inline; this component is the single shared implementation.
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| ariaLabel | string | `<section aria-label>` |
| eyebrow | string | Small uppercase label above the heading |
| title | string | Section `<h2>` |
| description | string? | Supporting text below the heading |
| items | { src, alt, width, height }[] | Photos to render via Astro `<Image>` |
| cta | { label, href }? | Optional CTA button below the grid (used by "Beliebte Gerichte", not "Galerie") |

### OurStorySection
**File:** `src/components/sections/OurStorySection.astro`
Founder-story block ("Wie D'ouro begann" on the home page). Not the same as the `OurStory.astro` removed in an earlier cleanup pass (that one was dead code with zero importers) — this is a fresh component, actually wired into `index.astro`.
**Props:** `ariaLabel`, `eyebrow`, `title`, `text`, `founderName`, `founderTitle` (all strings).

### FaqAccordion
**File:** `src/components/sections/FaqAccordion.astro`
Plain `<details>`-based accordion for the home page's FAQ section, reading from the `faq` content collection. Renders nothing if `items` is empty.
**Props:** `items: { question, answer }[]`, `ariaLabel`, `eyebrow`, `title`.

### MenuItemCard
**File:** `src/components/sections/MenuItemCard.astro`
Full-detail menu item card (used for most menu categories). Reads `siteSettings` directly for the order-online link. Composes `DietaryBadge` and `AllergenBadge`.

### MenuBistroCard
**File:** `src/components/sections/MenuBistroCard.astro`
Compact menu item card, used across most of `menu.astro`'s categories (quesadillas, tacos, bowls, drinks/bebidas, and more) — not limited to drinks. Supports `priceVariants` (non-alcoholic/alcoholic dual pricing) and `addOns`.
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| name | string | Dish/drink name |
| description | string | German description |
| descriptionEn | string? | English description |
| priceInCents | number | Base price in EUR cents |
| priceVariants | { nonAlcoholic?, alcoholic? } | EUR cents, for dual-price drinks |
| prepTime / prepTimeEn | string? | Prep time text |
| allergens | string[] | Allergen codes |
| addOns | { label, price }[] | Optional add-ons |
| imageSrc / imageAlt | string? | Optional image |
| available | boolean | Whether currently available |

---

## Layout Components (`src/components/layout/`)

### NavBar
**File:** `src/components/layout/NavBar.astro`
Desktop scroll-transition header plus the mobile capsule trigger (logo, "Speisekarte" link, hamburger button). Renders `MobileNavDrawer` and owns the scroll-transition `<script>`; the drawer's own open/close/focus-trap logic lives in `MobileNavDrawer.astro`.

### MobileNavDrawer
**File:** `src/components/layout/MobileNavDrawer.astro`
Full-screen mobile navigation overlay (`role="dialog"`, `aria-label="Navigationsmenü"`), split out of `NavBar.astro`. Talks to `NavBar`'s hamburger button (`#mobile-menu-btn`) by id rather than component subtree, since Astro doesn't scope `<script>` tags. Owns open/close, `Escape`-to-close, a Tab focus trap, and `inert`/`aria-hidden` toggling while closed.

### Footer
**File:** `src/components/layout/Footer.astro`
**Props:** `cta`, `address` (string array), `phone`, `phoneHref`, `copyrightName`, plus link arrays. Renders the location line inside a semantic `<address>` element.

### MobileBottomBar
**File:** `src/components/layout/MobileBottomBar.astro`
Persistent bottom action bar shown on mobile, rendered directly by `Base.astro` (not per-page). Reads phone/order-link from `siteSettings`.

---

## Layout Shell

### Base
**File:** `src/layouts/Base.astro`
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| title | string | Page title |
| description | string | **Required.** Meta description. Was optional with an English-prose default that four German pages silently shipped |
| image | string? | OG/Twitter image URL |
| imageAlt | string? | Alt text for the OG/Twitter image |
| canonical | string? | Canonical URL. **Don't pass it** — the default (`Astro.url.href`) produces the trailing-slash form the sitemap and JSON-LD already use |
| type | 'website' \| 'article' | OG type |
| noindex | boolean? | Emits `robots: noindex, nofollow` and skips structured data |
| breadcrumb | `{name,path}[]?` | Trail **excluding** "Startseite". Omit on the homepage — a one-item trail is noise |
| extraSchemaNodes | `object[]?` | Page-specific `@graph` nodes, e.g. `menuNode(...)` on `/menu`, `faqNode(...)` on `/` |

**Slots:** `nav`, `footer`, default, plus `head` for page-specific head tags.

Handles `<head>` (SEO meta, fonts, and the page's schema.org `@graph` built by `src/lib/seo/graph.ts`), global CSS import, and renders `MobileBottomBar` plus `nav`/`footer`/default slots. Does **not** import `NavBar`/`Footer` itself — each page imports and slots them individually.

---

## Class Composition

There is no `cn()` utility in this codebase (a previous `clsx`/`tailwind-merge`-based one was removed as dead code). Use Astro's native `class:list={[...]}` directive for conditional/merged classes, e.g.:

```astro
<div class:list={['base-class', { 'active-class': isActive }]}>
```
