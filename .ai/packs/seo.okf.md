---
okf_version: "0.2"
id: "pack/seo"
type: "knowledge"
title: "SEO"
status: "approved"
created: "unknown"
updated: "2026-08-09"
freshness: "current"
lifecycle: "active"
trust: "verified"
provenance:
  source: "repo"
  references: ["docs/seo.md", "src/lib/seo/graph.ts", "src/layouts/Base.astro"]
attestation:
  method: "agent"
  checks: ["parsed the built @graph on / and /menu/", "check:csp + check:hours pass", "lhci seo=100"]
summary: "One schema.org @graph per page, built by src/lib/seo/graph.ts from Keystatic settings. Base.astro owns the head; description is REQUIRED. Inline-JSON-LD CSP hashes are generated at build, never committed. Canonical is trailing-slash. No i18n/hreflang yet — de-AT only."
load_when: "Meta tags, structured data, canonical/sitemap changes, llms.txt, or crawl-budget questions."
token_budget: 350
related: ["docs/seo.md", ".ai/packs/security.okf.md"]
---

# SEO

**Full detail: `docs/seo.md`.** This file is only the pointer.

`Base.astro` owns the `<head>` and builds the `@graph` itself; pages pass just `breadcrumb` and `extraSchemaNodes`. `description` is **required** — it used to default to English prose that four German pages shipped.

Exactly ONE `ld+json` per page (a testable invariant). `Restaurant` is declared once at `…/#restaurant` and referenced by `@id`, replacing 7 hardcoded copies; values come from `src/lib/site.ts`, hours via `src/lib/hours.ts`. Plus `Menu`/`Offer` on `/menu`, `FAQPage` on `/`, `BreadcrumbList` on inner routes only.

**CSP coupling — read before touching structured data**: hashes are *generated* at build (`src/integrations/csp-hashes.mjs`) because CMS-derived JSON-LD makes committed hashes a silent-breakage trap. Always `pnpm build && pnpm check:csp`. See `.ai/packs/security.okf.md`.

Canonical is trailing-slash; don't hand-set it per page. `/llms.txt` is generated from Keystatic, not static.

**Not done**: no i18n, no `hreflang`. Crawl budget still fine.
