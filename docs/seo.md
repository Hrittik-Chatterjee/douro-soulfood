---
okf_version: "0.2"
id: "docs/seo"
type: "knowledge"
title: "SEO: D'ouro Soulfood"
status: "approved"
created: "2026-08-09"
updated: "2026-08-09"
freshness: "current"
lifecycle: "active"
trust: "verified"
provenance:
  source: "repo"
  references: ["src/lib/seo/graph.ts", "src/layouts/Base.astro", "src/integrations/csp-hashes.mjs"]
attestation:
  method: "agent"
  checks: ["parsed the built @graph on / and /menu/", "pnpm check:csp and check:hours pass", "lhci: seo=100, a11y=100, best-practices=100, agentic-browsing=100 on /"]
summary: "How SEO works in this repo: Base.astro's head contract, the one-@graph-per-page rule, the build-time CSP hash coupling, trailing-slash canonicals, generated llms.txt, and the facts still awaiting business confirmation."
load_when: "Meta tags, structured data, canonical/sitemap changes, llms.txt, image alt text."
token_budget: 1200
related: [".ai/packs/seo.okf.md", "docs/security.md", "docs/i18n.md", "src/lib/site.ts", "src/lib/hours.ts"]
---

# SEO: D'ouro Soulfood

Single locale today: **de-AT**. `astro.config.mjs` does have `i18n` and sitemap `i18n` config (Phase 2, see `docs/i18n.md`), but with one live locale it structurally cannot emit `hreflang` or `<xhtml:link>` — verified, not assumed. No `og:locale:alternate` either. See `docs/i18n.md` before adding a locale.

## The head contract (`src/layouts/Base.astro`)

Every page goes through `Base`. Props:

| Prop | Required | Notes |
|---|---|---|
| `title` | yes | Rendered as `D'ouro Soulfood Bistro \| {title}` |
| `description` | **yes** | Required on purpose — see below |
| `image` / `imageAlt` | no | Defaults to `/images/og-default.jpg` (1200×630) |
| `canonical` | no | **Leave it alone.** Defaults to `Astro.url.href` |
| `noindex` | no | Emits `robots: noindex, nofollow` and skips structured data |
| `breadcrumb` | no | Trail **excluding** "Startseite"; omit on the homepage |
| `extraSchemaNodes` | no | Page-specific `@graph` nodes |
| `<slot name="head">` | — | For page-specific head tags (e.g. an LCP preload) |

`description` used to be optional with an **English-prose default**, and `/menu`, `/about`, `/catering` and `/contact` all silently shipped it on a `lang="de"` site. It is now required so that omitting it is a visible mistake.

⚠️ **`astro build` does not type-check `.astro` props.** "Required" is enforced by your editor and `tsc`, not by the build. Making it a build gate needs `@astrojs/check`, a new dev dependency — see `.ai/decisions/stack.okf.md` before adding it.

## Structured data: one `@graph` per page

Built by `src/lib/seo/graph.ts`. **Exactly one `<script type="application/ld+json">` per page** — asserted in `tests/home.spec.ts` and `tests/menu.spec.ts`.

- `Restaurant` `@id …/#restaurant` — declared **once** and referenced by `@id` from `WebPage.about`. It previously lived in `Base.astro` and was therefore emitted as 7 rival copies with address and phone hardcoded. Now sourced from `src/lib/site.ts` (Keystatic), including `openingHoursSpecification`, `hasMap`, `hasMenu`, `email`, `logo`, `inLanguage` and `sameAs` (empty social strings are dropped rather than emitted as broken URLs).
- `WebSite` `…/#website`, `WebPage` `{url}#webpage`.
- `BreadcrumbList` on the six inner routes; **omitted on the homepage**, where a one-item trail carries no information. There is no visible breadcrumb UI — markup-only is a supported arrangement.
- `Menu` → `MenuSection` → `MenuItem` + `Offer` on `/menu`, derived from the same grouped collection the page renders.
- `FAQPage` on `/`, mirroring the visible accordion.

Two things to know when editing this:

**Prices.** Storage is EUR cents (`1890`). Visitors see de-AT `€18,90`. JSON-LD `Offer.price` must be `"18.90"` — a plain decimal with a dot. Two formatters, one source value.

**`suitableForDiet`.** Only `vegan`, `vegetarian`, `gluten-free` and `halal` map to real schema.org `RestrictedDiet` members. `spicy` and `dairy-free` have none and are dropped — do not invent IRIs for them.

**Honest expectation on `FAQPage`:** Google restricted FAQ rich results to authoritative government/health sites, so this will not produce a SERP accordion. It is still valid markup and materially helps AI/answer-engine extraction — the same reason `/llms.txt` exists. Don't sell it as a rich result.

## The CSP coupling (read this before touching JSON-LD)

Inline scripts are allowed by exact SHA-256 hash with no `'unsafe-inline'`, and **the hashes are generated at build**, not committed. Because the JSON-LD is CMS-derived, a client editing an opening hour changes the rendered bytes; a committed hash would go stale and browsers would block the script with **no build error, no test failure and no visible symptom**. Full rationale in `docs/security.md`.

Practical rule: after any change that touches rendered markup, run `pnpm build && pnpm check:csp`.

Structured data costs hashes: `BreadcrumbList` is per-page-unique, so every page's `@graph` is a distinct inline block. The count went 7 → 13.

## Canonical URLs

**Trailing slash.** `build.format` is unset → Astro's `directory` default, so `Astro.url.href` yields `…/menu/`, and the sitemap `<loc>` and JSON-LD `url` already agreed on that form. The homepage used to hand-set the slashless variant, leaving one page advertising three different URLs for itself. Don't pass `canonical` per page.

## Sitemap and robots

`@astrojs/sitemap` with a `filter` that excludes `/dev/`. That filter is load-bearing: a route's own runtime 404 guard does **not** keep it out of the sitemap. `public/robots.txt` stays a static file — it has no CMS dependency.

## `/llms.txt`

Generated by `src/pages/llms.txt.ts` (`prerender = true`, so no Worker cost), **not** a static file — its content (address, hours, phone, menu categories) all comes from Keystatic, and a static copy would drift the first time the client edits her hours. Lighthouse's `llms-txt` audit passes.

## Images

Alt text must describe the photo, not restate the filename. 18 images were previously alt'd `"Spezialität 1…9"` / `"Showcase 1…3"`; those were replaced with descriptions written after opening each file — most of the gallery turned out to be interior/exterior shots rather than dishes, so the old text was factually wrong too.

CMS menu photos can carry authored alt text via the optional `imageAlt` field, which exists in **both** `src/content.config.ts` and `keystatic.config.ts` (hand-synced — see `.ai/decisions/keystatic-sync.okf.md`). Consumers fall back to the dish title.

## Awaiting business confirmation

Deliberately **not** asserted, because guessing would be worse than omitting:

- **`geo` coordinates** — must be confirmed against the real Maps pin, not inferred from the street address.
- **`acceptsReservations`** — a "Reservieren" chip exists but there is no reservation form; the FAQ says booking is by phone. Asserting a capability that doesn't exist is worse than omitting the field.
- **`aggregateRating` (4.8 / 978)** — carried over verbatim from the previous hardcoded block so this work didn't silently drop a live signal. Two open questions: is it current, and is marking up a third-party (Google) aggregate as the restaurant's own `aggregateRating` acceptable under Google's review-snippet policy? If it stays, move the numbers into the Keystatic settings singleton so they can be refreshed without a code change.
- **`Review` markup** for the three testimonials in `UserReviews.astro` — **not emitted**. The names are hardcoded in source; if they're placeholders, marking them up is fabricated structured data and a manual-action risk. Confirm provenance first, and move them into Keystatic with attribution if they're real.

## Verification

```bash
pnpm build && pnpm check:csp     # every inline script covered by the SHIPPED _headers
pnpm check:hours                 # every CMS day label maps to a schema.org DayOfWeek
grep -c 'application/ld+json' dist/client/menu/index.html   # must be 1
grep 'rel="canonical"' dist/client/index.html               # trailing slash
```

Manual, and required before calling structured-data work done: run the built `@graph` for `/` and `/menu/` through Google's Rich Results Test and `validator.schema.org`. That is the only real check on `suitableForDiet` IRIs, the closed-Sunday `openingHoursSpecification` convention, and `Offer.price` formatting.
