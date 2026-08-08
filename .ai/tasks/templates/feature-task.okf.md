---
okf_version: "0.2"
id: "task/{stable-id}"
type: "task"
title: "Feature: {short description}"
status: "draft"
created: "{ISO date or unknown}"
updated: "{ISO date or unknown}"
freshness: "current"
lifecycle: "experimental"
trust: "draft"
provenance: { source: "{repo|human|ai|mixed}", references: [] }
attestation: { method: "{manual|script|ci|agent}", checks: [] }
summary: "{1-3 sentence summary of the feature}"
load_when: "{when an agent should read this}"
token_budget: 600
related: []
---

# Feature: {short description}

## Task ID
`{stable-id}`

## Outcome
{What the user can do after this feature ships, stated concretely.}

## Type
feature

## Priority
{P0|P1|P2}

## Which persona/flow does this serve?
{Reference `.ai/packs/repo-overview.okf.md` → `docs/personas.md`/`docs/user-flows.md`. A feature that doesn't map to a real persona/flow needs justification before proceeding.}

## Required context
{Files/packs needed — for a new page, include the SEO/performance packs since Lighthouse URL lists need updating too.}

## Constraints
{Design system, accessibility, performance budget, Keystatic schema sync if content is involved.}

## Acceptance criteria
- Given {context}, when {user action}, then {result}.

## Evidence required
{Build passes, new/updated tests, `/dev/ui` visual check if UI is involved, Lighthouse URL list updated if a new route was added.}

## Benchmark impact
{New route → must be added to `.lighthouserc.cjs` + `deploy.yml`. New JS → check against TBT budget.}

## Stop/ask conditions
{Task-specific — e.g. "if this requires a new Keystatic field, confirm the schema change doesn't break existing content before implementing."}
