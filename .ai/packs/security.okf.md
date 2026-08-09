---
okf_version: "0.2"
id: "pack/security"
type: "knowledge"
title: "Security"
status: "approved"
created: "unknown"
updated: "unknown"
freshness: "current"
lifecycle: "active"
trust: "verified"
provenance:
  source: "repo"
  references: ["docs/security.md", "public/_headers"]
attestation:
  method: "agent"
  checks: ["CSP copied verbatim from public/_headers", "verify-csp-hashes.mjs passes", "real headless-Chrome click test: menu/map both work, zero CSP violations"]
summary: "No unconsented third-party request fires anywhere — fonts self-hosted, Maps two-click-gated (MapEmbed.astro). CSP script-src covers every inline script by exact SHA-256 hash, no 'unsafe-inline'. Hashes are GENERATED at build time into dist/client/_headers, not committed — CMS-derived JSON-LD makes hand-maintained hashes a silent-breakage trap."
load_when: "Third-party scripts, embeds, consent flows, or CSP changes."
token_budget: 500
related: ["docs/security.md", "public/_headers", "scripts/checks/verify-csp-hashes.mjs"]
---

# Security

CSP lives in `public/_headers` — read it there, not a copy here. No `'unsafe-inline'` for scripts; `frame-ancestors 'none'`; `frame-src` Maps only; `img-src 'self' data:`.

Any new third-party integration must go through the same two-click-consent pattern `MapEmbed.astro` already implements — default to not loading, load only on explicit user action.

**Inline scripts are allowed by SHA-256 hash, never `'unsafe-inline'`.** Hashes are **generated at build** (`src/integrations/csp-hashes.mjs`) into `dist/client/_headers`; `public/_headers` keeps an over-restrictive placeholder so a missing hook fails closed. Committing hashes is no longer safe: JSON-LD is CMS-derived, so a client editing an opening hour would invalidate a pinned hash and break scripts with no build error and no test failure. Keep `pnpm check:csp` in CI; it re-derives independently — don't merge it with the generator.

**Full detail, including why this mattered**: `docs/security.md`.
