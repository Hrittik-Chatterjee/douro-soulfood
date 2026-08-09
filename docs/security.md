---
okf_version: "0.2"
id: "docs/security"
type: "knowledge"
title: "Security"
status: "approved"
created: "unknown"
updated: "unknown"
freshness: "current"
lifecycle: "active"
trust: "verified"
provenance: { source: "ai", references: ["public/_headers", "src/components/ui/MapEmbed.astro"] }
attestation: { method: "manual", checks: ["CSP copied verbatim from public/_headers", "node scripts/checks/verify-csp-hashes.mjs passes", "real headless-Chrome click test confirms mobile menu + map consent-gate work with zero CSP violations"] }
summary: "Real CSP, GDPR consent-gate patterns already shipped (self-hosted fonts, two-click Maps). The inline-script/CSP gap is now fixed (was: unfixed) — turned out to also silently break the mobile menu and Maps consent-gate button in production, not just JSON-LD/SEO as originally scoped."
load_when: "Third-party scripts, embeds, consent, CSP changes."
token_budget: 800
related: [".ai/packs/security.okf.md"]
---

# Security

## Machine Contract
doc_id: SECURITY-01 | status: approved | outputs: `public/_headers`, GDPR-relevant components (`MapEmbed.astro`, self-hosted fonts in `src/styles/tokens.css`/`src/layouts/Base.astro`), Impressum/Datenschutz content (`src/pages/impressum.astro`/`datenschutz.astro`, currently on unmerged PR #20)

## 1. Context & Inputs
This site has no authentication, no user accounts, no database, and no server-side data processing beyond Keystatic's own admin routes (`/keystatic`, `/api/keystatic`) — the attack surface is small and mostly about response headers, third-party requests, and Austrian/EU privacy compliance for a public marketing site. Verified against `public/_headers` (the actual, current CSP), the `MapEmbed.astro` consent-gate implementation, and the self-hosted-fonts change (both shipped in earlier work this session, not hypothetical).

## 2. Required Outputs
### Current, verified security posture
- **HTTP security headers** (`public/_headers`): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Strict-Transport-Security` with `includeSubDomains`, and a CSP: `default-src 'self'; script-src 'self' 'sha256-...' (one per inline script, INJECTED AT BUILD TIME — see §"Inline-script hashes" below); style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; frame-src https://maps.google.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'`. Note `img-src` no longer allowlists `images.unsplash.com`: the one remote image is now self-hosted.
- **No unconsented third-party requests fire on page load.** Google Fonts are self-hosted (`public/fonts/`, `@font-face` in `src/styles/tokens.css`) instead of loaded from `fonts.googleapis.com`/`fonts.gstatic.com`. Google Maps only loads after an explicit click through `MapEmbed.astro`'s two-click pattern. Both were real fixes to a real problem (the underlying issue behind the 2022 Munich Google Fonts ruling: loading fonts/embeds from Google leaks visitor IP before consent) — not preemptive hardening.
- **No `set:html` XSS surface.** The only `set:html` usage in the codebase is `Base.astro`'s JSON-LD `<script>`, and its input is a locally-constructed object passed through `JSON.stringify` — no user or CMS-supplied data flows into it.
- **Keystatic admin access**: the CMS's own docs describe `/keystatic` and `/api/keystatic` as SSR routes (not prerendered, per `docs/architecture.md`'s Rendering Strategy diagram) — access control for who can reach the admin UI is Keystatic's/the hosting platform's responsibility, not something this codebase implements itself (local storage mode, per `docs/prd.md` §6).

### Fixed: inline-script/CSP gap (was "known, verified, unfixed")
CSP's `script-src` directive applies to all `<script>` elements regardless of `type`, including non-executable ones like JSON-LD, unless a nonce/hash/`'unsafe-inline'` is present. Investigating this surfaced that the actual blast radius was much larger than originally scoped: **not just `Base.astro`'s JSON-LD, but all 4 of the site's page-interactivity scripts** (`NavBar.astro`'s mobile-menu toggle and scroll behavior, `MapEmbed.astro`'s consent-gate click handler, an opening-hours indicator script) are auto-inlined by Astro rather than externalized, and were all being silently CSP-blocked too. **Concretely: the mobile hamburger menu did not open, and the Google Maps "Karte anzeigen" button did not load the map — both broken in production**, not just a structured-data/SEO issue.

**Fix**: each inline script is allowed by its exact SHA-256 content hash in `script-src`. Originally those hashes were committed by hand, which worked only while a single JSON-LD block was byte-identical on every page. **That assumption is now deliberately dead** — see below. Verified with a real headless-Chrome test: clicking the hamburger button now sets `#mobile-menu`'s `data-open` to `true`, clicking "Karte anzeigen" now loads the iframe, and zero CSP violations appear in the console.

### Inline-script hashes are generated, not committed

Hashes are **no longer maintained by hand**. `src/integrations/csp-hashes.mjs` runs on `astro:build:done`, hashes every inline `<script>` in the real build output, and injects the result into **`dist/client/_headers`** — the copy Cloudflare actually serves. `public/_headers` holds a deliberately over-restrictive `script-src 'self'` placeholder.

**Why this had to change.** The page JSON-LD is now derived from Keystatic content (`openingHoursSpecification`, menu prices). That means a routine CMS edit — the client changing an opening hour — alters the rendered bytes and invalidates a committed hash. A CSP-blocked script produces **no build error, no test failure and no visible symptom**; Playwright still reads the DOM node fine. The only signal is a console violation in the visitor's browser. Hand-maintained hashes would have handed a content editor a way to silently break her own structured data.

**Fails closed.** The placeholder is more restrictive than the real policy, and the hook only ever widens it. If the hook doesn't run, inline scripts are blocked — loud, obvious breakage — rather than the policy silently becoming permissive. The build also aborts if the placeholder is missing (verified: exits 1).

**Astro's own `security.csp` was evaluated and rejected.** It emits a `<meta http-equiv="content-security-policy">`, and `frame-ancestors` is ignored in a meta-delivered policy per spec, so the header can't be dropped. Two policies are enforced independently, so the header's `default-src 'self'` would keep blocking inline scripts regardless.

**Still required in CI**: `pnpm build && pnpm check:csp`. `scripts/checks/verify-csp-hashes.mjs` reads the shipped `dist/client/_headers` and re-derives the hashes **independently** — it does not share extraction code with the generator, because two implementations agreeing is the actual signal. Do not refactor them together.

## 3. Constraints
- Any new third-party integration (analytics, a chat widget, a payment processor) must go through the same two-click-consent evaluation `MapEmbed.astro` already models — default to not loading, load only on explicit user action, document the data flow in this file.
- CSP changes must stay minimal and specific: `public/_headers`' `frame-src` was deliberately narrowed to exactly `https://maps.google.com` (not `*.google.com`) after confirming that's the only origin `MapEmbed.astro` ever injects — new entries need the same "what actually loads, verified, not assumed" discipline.
- Business/legal facts that can't be verified (the Impressum's legal form, UID/Kleinunternehmer status, Firmenbuchnummer — see the unmerged `claude/impressum-datenschutz` branch, PR #20) must stay as explicit placeholders, never a plausible-looking guess. An honest placeholder is safer than a wrong specific-looking number in a legal document.

## 4. Acceptance Criteria
- Given a new external script/embed is proposed, when evaluated, then it must either load only after explicit consent (matching `MapEmbed.astro`) or be justified as strictly necessary with no alternative (matching why Cloudflare/Keystatic's own infrastructure isn't consent-gated).
- Given the CSP is modified, when changed, then `pnpm build` + a manual check of what actually loads in the built output should confirm the new directive matches real, current usage — not aspirational future usage.
- Given any inline `<script>` is added, changed, or removed anywhere in the codebase (or a build-tooling dependency is bumped), when the CSP is next verified, then `node scripts/checks/verify-csp-hashes.mjs` must pass — a missing hash is a real, silent production regression (confirmed: it broke the mobile menu and Maps consent-gate before this fix), not a cosmetic warning.

## 5. Agent Execution Rules
- MUST: treat any change that causes an unconsented third-party network request as a regression, even if it "just" restores previously-removed behavior (this happened once already in this session's history — a branch briefly lost the Maps consent-gate fix by merging `main` at the wrong point, caught and corrected before merge).
- MUST: research external security/browser-behavior claims before acting on them (as done here for the CSP/JSON-LD finding) rather than asserting from memory.
- MUST NOT: insert unverified specific-looking legal/business facts (VAT numbers, registration numbers) into `impressum.astro` or anywhere else — placeholder-with-explanation beats a plausible guess.
- MUST NOT: weaken the CSP (e.g., adding `'unsafe-inline'` to `script-src`) as a quick fix for a future CSP-hash mismatch — recompute and add the correct hash via `scripts/checks/verify-csp-hashes.mjs` instead.
