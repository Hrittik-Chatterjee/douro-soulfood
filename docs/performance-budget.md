---
okf_version: "0.2"
id: "docs/performance-budget"
type: "knowledge"
title: "Performance Budget"
status: "approved"
created: "unknown"
updated: "unknown"
freshness: "current"
lifecycle: "active"
trust: "verified"
provenance: { source: "ai", references: [".lighthouserc.cjs"] }
attestation: { method: "manual", checks: ["values copied verbatim from .lighthouserc.cjs"] }
summary: "Real, enforced Lighthouse thresholds and Core Web Vitals budgets, sourced directly from .lighthouserc.cjs."
load_when: "Any change touching JS/images/page weight, or a React island proposal."
token_budget: 700
related: [".ai/packs/performance.okf.md"]
---

# Performance Budget

## Machine Contract
doc_id: PERFBUDGET-01
status: approved
outputs:
  - `.lighthouserc.cjs` thresholds
  - `.github/workflows/deploy.yml`'s `lighthouse` job gate

## 1. Context
`.lighthouserc.cjs` already encodes real, enforced budgets — this document doesn't invent new numbers, it explains the ones that exist so future changes are evaluated against them deliberately rather than by accident. Verified directly against `.lighthouserc.cjs`'s `assert.assertions` block.

## 2. Inputs
- `.lighthouserc.cjs`'s current thresholds (see §3 — copied verbatim, not approximated).
- `.github/workflows/deploy.yml`'s `lighthouse` job, which runs `lhci autorun` against the live preview URL for `/`, `/menu`, `/about`, `/catering`, `/contact` and **fails the build** (not just warns) on any `error`-level assertion.
- The site's architectural baseline: zero client-JS framework by default (`docs/architecture.md`), which is why these budgets are achievable without heroics — any change that adds meaningful client JS (a React island, per the new `docs/adr/react-islands.md`) is the most likely way to threaten them.

## 3. Required Outputs — the actual enforced budget
| Metric | Threshold | Severity |
|---|---|---|
| Performance score | ≥ 0.90 | error (blocks CI) |
| Accessibility score | ≥ 0.92 | error (blocks CI) |
| Best Practices score | ≥ 0.90 | warn |
| SEO score | ≥ 0.92 | error (blocks CI) |
| First Contentful Paint | < 1800ms | error |
| Largest Contentful Paint | < 2500ms | error |
| Cumulative Layout Shift | < 0.1 | error |
| Total Blocking Time | < 200ms | error |
| Time to Interactive | < 3500ms | warn |
| Speed Index | < 3000ms | warn |

Pages covered: `/`, `/menu`, `/about`, `/catering`, `/contact` (per both `.lighthouserc.cjs`'s local `collect.url` list and `deploy.yml`'s `--collect.url` flags — **new pages must be added to both, kept in sync**, per `docs/test-plan.md`'s §4 acceptance criteria on this exact point).

## 4. Constraints
- **Total Blocking Time's 200ms budget is the tightest real constraint on adding any React island.** A single unnecessarily-hydrated component can consume this budget alone. Per `docs/adr/react-islands.md`, `client:visible` over `client:load` and justifying every island's JS cost exist specifically to protect this number.
- Do not raise any `error`-level threshold to "fix" a failing build — fix the actual regression. Lowering a budget to make CI pass defeats the budget's purpose.
- `uses-optimized-images`/`uses-responsive-images`/`offscreen-images` are `warn`-level today (not blocking) — this is a known, accepted gap tracked separately in the image-optimization work (`docs/audit/image-audit.md`), not something this document silently promotes to `error` without a corresponding fix landing first.

## 5. Acceptance Criteria
- Given a new page is added under `src/pages/`, when it ships, then it must be added to both `.lighthouserc.cjs` and `deploy.yml`'s Lighthouse URL lists in the same change.
- Given a React island is proposed (per `docs/adr/react-islands.md`), when implemented, then its Lighthouse impact on Total Blocking Time must be checked before merging — a regression past 200ms on any of the 5 audited pages is a blocker, not a warning to note later.
- Given CI's Lighthouse job fails, when investigated, then the fix must address the actual metric regression, never the threshold itself.

## 6. Agent Execution Rules
- MUST: treat this document's thresholds as sourced from `.lighthouserc.cjs`, not invented — if `.lighthouserc.cjs` changes, update this document in the same change.
- MUST: evaluate any new client-side JavaScript (React islands, third-party scripts) against the Total Blocking Time budget before merging.
- MUST NOT: weaken an `error`-level Lighthouse assertion to unblock a failing PR.
- MUST NOT: add a new route without adding it to both Lighthouse URL lists.
