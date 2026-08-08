---
okf_version: "0.2"
id: "docs/release"
type: "knowledge"
title: "Release Process"
status: "approved"
created: "unknown"
updated: "unknown"
freshness: "current"
lifecycle: "active"
trust: "verified"
provenance: { source: "ai", references: [".github/workflows/deploy.yml"] }
attestation: { method: "manual", checks: ["verified line-by-line against deploy.yml"] }
summary: "Real 5-job CI/CD pipeline, branch behavior, and the known pre-existing Deploy Preview CI gap (missing CLOUDFLARE_API_TOKEN)."
load_when: "CI failures, deployment questions."
token_budget: 800
related: ["okf/audit/current-state.okf.md"]
---

# Release Process

## Machine Contract
doc_id: RELEASE-01 | status: approved | outputs: `.github/workflows/deploy.yml`, `wrangler.toml`, Cloudflare Pages project `douro-soulfood`

## 1. Context & Inputs
Reflects the actual CI/CD pipeline defined in `.github/workflows/deploy.yml` — a 5-job GitHub Actions workflow (Build → Deploy Preview → E2E Tests → Lighthouse CI → Deploy Production), verified line-by-line against the workflow file, not assumed from convention. There is no separate staging environment beyond Cloudflare Pages' per-branch preview deploys.

## 2. Required Outputs
### Pipeline stages (in order, per job dependency graph)
1. **Build** (`build` job, all branches): `pnpm install --frozen-lockfile` → `pnpm build` → uploads `dist/` as a workflow artifact (3-day retention) so downstream jobs don't rebuild.
2. **Deploy Preview** (`deploy-preview`, all branches): downloads the `dist/` artifact, deploys to Cloudflare Pages via `wrangler pages deploy dist/ --project-name=douro-soulfood` (branch-scoped, gets a unique preview URL). **The `--project-name` flag is load-bearing** — omitting it creates a stray, disconnected CF Pages project instead of deploying to the existing one.
3. **Playwright E2E Tests** (`e2e-tests`, needs `deploy-preview`): runs the full Playwright suite (`tests/*.spec.ts`) against the just-deployed preview URL, not against a local server.
4. **Lighthouse CI** (`lighthouse`, needs `deploy-preview`): runs `lhci autorun` against the preview URL for `/`, `/menu`, `/about`, `/catering`, `/contact` per `.lighthouserc.cjs`'s thresholds.
5. **Deploy Production** (`deploy-production`, needs `[e2e-tests, lighthouse]`, `if: github.ref == 'refs/heads/main'` only): re-deploys the same `dist/` artifact to the production Cloudflare Pages target (`--branch=main`), then curls `https://douro-soulfood.com` to sanity-check it responds.

### Branch/environment behavior
- **Any branch, any push**: gets Build → Deploy Preview → E2E → Lighthouse. Feature branches stop here — no production promotion.
- **`main` only**: additionally gets Deploy Production, gated on E2E + Lighthouse both passing.
- **Concurrency**: one deployment per branch (`concurrency.group: deploy-${{ github.ref }}`), in-progress runs on the same branch are cancelled by a new push — no queued pile-up.

### Known, verified environment gap
- **The `Deploy Preview` job has failed on every PR observed in this session's history** due to a missing `CLOUDFLARE_API_TOKEN` repository secret — verified as a pre-existing, non-code-related CI gap, not something any single PR's changes caused. This cascades: `e2e-tests`/`lighthouse` both `needs: deploy-preview`, so they get skipped (not failed) whenever preview deploy fails. Only the `Build` job's pass/fail is currently a reliable per-PR signal; `Deploy Preview` red is expected until the secret is configured by someone with repo-admin access (this is outside any single code change's ability to fix).

## 3. Constraints
- Never remove `--project-name=douro-soulfood` from any `wrangler pages deploy` invocation — this is the single most consequential mistake possible in this pipeline (stray CF Pages project creation).
- `deploy-production` only fires on `main` — there is no manual production-promotion path other than merging to `main` (the workflow does support `workflow_dispatch` for manual re-triggers, but that re-runs the same branch-gated logic, it doesn't bypass it).
- `NODE_VERSION: '22'` and `PNPM_VERSION: '9.15.9'` (both pinned in `deploy.yml`'s `env` block) must match `package.json`'s `packageManager` field — drift here has caused CI failures in this repo's history (see the "chore: final cleanup pass" commit fixing the CI Node version pin).

## 4. Acceptance Criteria
- Given a PR is opened, when CI runs, then `Build` passing is the reliable per-PR signal; `Deploy Preview`/`e2e-tests`/`lighthouse` failing due to the missing token is expected and not blocking, per the documented gap above.
- Given a PR merges to `main`, when the pipeline completes, then production at `https://douro-soulfood.com` should reflect the merge within the workflow's total runtime (Build + Preview + E2E + Lighthouse + Production, each with its own `timeout-minutes`).
- Given the `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` secrets are eventually configured, when the next PR runs, then `Deploy Preview` should go green and this document's "Known, verified environment gap" section should be updated to reflect that (per `CLAUDE.md`'s doc-sync convention).

## 5. Agent Execution Rules
- MUST: treat `Build` job status as the real per-PR signal in this repo until the `CLOUDFLARE_API_TOKEN` gap is closed; do not block a merge decision on `Deploy Preview`/`e2e-tests`/`lighthouse` failing for that specific, already-diagnosed reason.
- MUST: verify a CI failure's root cause (read the actual job log) before classifying it as "the known gap" — a failure that looks similar but has a different actual cause is not automatically safe to ignore.
- MUST NOT: strip or bypass `--project-name` flags, `timeout-minutes` limits, or the `needs:` job-dependency gating as a way to "fix" a CI failure faster.
