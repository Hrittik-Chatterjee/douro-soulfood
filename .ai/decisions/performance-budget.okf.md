---
okf_version: "0.2"
id: "decision/performance-budget"
type: "decision"
title: "Lighthouse thresholds are enforced, error-level, and not to be weakened to unblock CI"
status: "approved"
created: "unknown"
updated: "unknown"
freshness: "current"
lifecycle: "stable"
trust: "verified"
provenance: { source: "repo", references: [".lighthouserc.cjs"] }
attestation: { method: "agent", checks: ["values copied verbatim from .lighthouserc.cjs"] }
summary: "Performance>=0.90, accessibility>=0.92, SEO>=0.92, plus Core Web Vitals budgets, are error-level CI gates. Never lower a threshold to make a failing PR pass — fix the actual regression."
load_when: "A Lighthouse CI failure, or any change that might affect page weight/JS/images."
token_budget: 200
related: [".ai/packs/performance.okf.md", "docs/performance-budget.md"]
---

# Decision: Performance budget is a real gate, not a suggestion

`.lighthouserc.cjs`'s `error`-level assertions fail the build, not just warn. This is intentional and settled. If a change regresses a metric past threshold, the fix is to address the regression (remove/defer the JS, fix the image, etc.), never to edit `.lighthouserc.cjs`'s numbers downward.
