---
okf_version: "0.2"
id: "pack/repo-overview"
type: "knowledge"
title: "Repo Overview"
status: "approved"
created: "unknown"
updated: "unknown"
freshness: "current"
lifecycle: "active"
trust: "verified"
provenance:
  source: "repo"
  references: ["docs/prd.md", "okf/audit/current-state.okf.md"]
attestation:
  method: "agent"
  checks: ["cross-checked against docs/prd.md and the current-state audit"]
summary: "D'ouro Soulfood Bistro — Astro 6 + Tailwind v4 + Keystatic restaurant marketing site, Salzburg. No accounts/cart/contact-form; only conversion flow hands off to Lieferando."
load_when: "First task in a new session, or when unsure what the site is/does."
token_budget: 350
related: ["docs/prd.md", "okf/audit/current-state.okf.md"]
---

# Repo Overview

D'ouro Soulfood Bistro — a Brazilian/Latin/African fusion restaurant website at Auerspergstraße 10, Salzburg, Austria. Owner: Angela. Goal: drive online orders (via a Lieferando link-out), showcase the menu, build local brand presence.

**7 real routes**: `/`, `/menu`, `/about`, `/catering`, `/contact`, `/impressum`, `/datenschutz`, all prerendered, wrapped by `src/layouts/Base.astro`. **No accounts, no cart, no checkout, no contact form** — verified, not assumed.

**Content**: Keystatic-managed `menu_items` and `faq` collections, plus a `settings` singleton (address/phone/hours/social) — editable at `/keystatic` without a developer.

**Full detail**: `docs/prd.md`.
