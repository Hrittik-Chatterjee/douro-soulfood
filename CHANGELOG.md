# Changelog

## [Unreleased]

### Added
- SEO layer for the German site: one schema.org `@graph` per page
  (`src/lib/seo/graph.ts`) with a single `Restaurant` entity referenced by
  `@id`, plus `WebSite`/`WebPage`, `BreadcrumbList` on inner routes,
  `Menu`/`MenuItem`/`Offer` on `/menu` and `FAQPage` on the homepage — all
  sourced from Keystatic rather than hardcoded. See `docs/seo.md`.
- `/llms.txt`, generated from the CMS (not a static file, so it can't drift
  from real opening hours) for AI and answer engines
- `src/lib/site.ts` — the single, zod-validated reader of the settings
  singleton, so a malformed CMS edit fails the build instead of rendering
  `undefined` into a meta tag
- `src/lib/hours.ts` — the one place German day labels are understood; feeds
  both the visible hours summary and `openingHoursSpecification`, so they
  can't disagree
- `pnpm check:csp` and `pnpm check:hours`
- i18n infrastructure (Phase 2 — de-AT remains the only *live* locale; no
  English/Chinese/Portuguese content ships in this change). `LIVE_LOCALES`
  (`src/lib/i18n/locales.ts`) is the single gate a future locale flips to go
  live; `astro.config.mjs`'s `i18n` config and the sitemap's `i18n.locales`
  map both derive from it, so with one live locale `hreflang`/`<xhtml:link>`
  structurally cannot appear yet — verified against the installed
  `@astrojs/sitemap` source, not assumed. `src/lib/nav.ts` de-duplicates the
  primary nav (previously hand-typed independently in `NavBar.astro` and
  `Footer.astro`); `src/lib/i18n/ui.ts` replaces two hardcoded German
  `aria-label` strings that lived inside `MobileNavDrawer.astro`'s inline
  `<script>`. `pnpm check:i18n` fails the build if a live locale is missing
  UI-string keys. See `docs/i18n.md`.

### Changed
- **CSP inline-script hashes are now generated at build**
  (`src/integrations/csp-hashes.mjs`) instead of committed. Necessary because
  JSON-LD is CMS-derived: a client editing an opening hour would invalidate a
  pinned hash and break scripts with no build error, no test failure and no
  visible symptom. `public/_headers` keeps an over-restrictive placeholder so a
  missing hook fails closed. See `docs/security.md`.
- The one remote image (`images.unsplash.com`) is now self-hosted;
  `remotePatterns` and the CSP `img-src` allowlist were dropped accordingly

### Fixed
- Four pages (`/menu`, `/about`, `/catering`, `/contact`) shipped an
  **English** meta description on a German site, inherited from an optional
  default. `description` is now a required `Base` prop and all seven pages pass
  real German copy.
- The homepage advertised three different URLs for itself (canonical without a
  trailing slash; sitemap and JSON-LD with). All three now agree.
- `ReviewBadge` emitted an orphan `AggregateRating` microdata entity that
  declared no subject and duplicated the JSON-LD rating; removed.
- 18 images were alt'd `"Spezialität 1…9"` / `"Showcase 1…3"`. Replaced with
  descriptions written after opening each file — most of the gallery is
  interior/exterior photography, not dishes, so the old text was wrong as well
  as unhelpful.
- CMS menu photos can now carry authored alt text (`imageAlt`, added to both
  content schemas); `MenuItemCard` previously dropped `descriptionEn` entirely
  for the 11 categories it renders.
- Migrated CMS from TinaCMS to Keystatic
- Rewrote homepage copy to German
- Migrated delivery link-out from Foodora to Lieferando
- Security: bumped Astro/Keystatic for CVE fixes, added HTTP security
  headers, general dependency hygiene
- Design tokens: added a type scale, z-index scale, named breakpoints,
  and a tokenized "bistro" menu palette
- Repo-wide structure cleanup: removed dead components and orphaned
  content, sorted components into `ui/`/`sections/`/`layout/`,
  extracted menu page logic into `src/lib/`, synced the Keystatic and
  Astro content schemas, wired the Settings singleton into the Contact
  page, removed the unused React integration, fixed drifted docs and
  tests to match the shipped site

## [0.1.0] - 2026-05-06

### Added
- Astro 6 + TinaCMS + Tailwind v4 + Cloudflare Pages stack
- Apple iOS-inspired design system with D'ouro brand colors
- Glass navigation, Button, FeatureCard, Footer components
- 5 page routes: Home, Menu, About, Catering, Contact
- TinaCMS schema: settings, home, menu_items, faq collections
- AI agent docs: prd, design-system, architecture, agent, components
- CI/CD with Lighthouse auditing
- GitHub issue/PR templates, CODEOWNERS
