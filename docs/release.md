---
okf_version: '0.2'
id: 'docs/release'
type: 'knowledge'
title: 'Release Process'
status: 'approved'
created: 'unknown'
updated: 'unknown'
freshness: 'current'
lifecycle: 'active'
trust: 'verified'
provenance: { source: 'ai', references: ['.github/workflows/deploy.yml'] }
attestation: { method: 'manual', checks: ['verified line-by-line against deploy.yml'] }
summary: 'Real 5-job CI/CD pipeline, branch behavior, and the known pre-existing Deploy Preview CI gap (missing CLOUDFLARE_API_TOKEN).'
load_when: 'CI failures, deployment questions.'
token_budget: 800
related: ['okf/audit/current-state.okf.md']
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
3. **Playwright E2E Tests** (`e2e-tests`, needs **`build`**): downloads the `dist/` artifact and runs the full suite (`tests/*.spec.ts`) against it, served locally by `scripts/serve-dist.mjs` (started automatically by `playwright.config.ts`). Needs no credential and works on fork PRs.
4. **Lighthouse CI** (`lighthouse`, needs **`build`**): downloads the artifact, serves it with `scripts/serve-dist.mjs`, and runs `lhci autorun` over `/`, `/menu/`, `/about/`, `/catering/`, `/contact/` per `.lighthouserc.cjs`.
   - Both gates deliberately depend on `build`, **not** `deploy-preview`. They used to depend on the deploy, which is why they were skipped on every run (see below). Do not reintroduce that dependency: it makes the gates unreachable whenever a deploy credential is missing, and it silently converts "red" into "skipped".
5. **Deploy Production** (`deploy-production`, needs `[e2e-tests, lighthouse]`, `if: github.ref == 'refs/heads/main'` only): re-deploys the same `dist/` artifact to the production Cloudflare Pages target (`--branch=main`), then curls `https://douro-soulfood.com` to sanity-check it responds.

### Branch/environment behavior

- **Any branch, any push**: gets Build, then Deploy Preview, E2E, and Lighthouse **in parallel** (all three consume only the build artifact). Feature branches stop here — no production promotion.
- **`main` only**: additionally gets Deploy Production, gated on E2E + Lighthouse both passing.
- **Concurrency**: one deployment per branch (`concurrency.group: deploy-${{ github.ref }}`), in-progress runs on the same branch are cancelled by a new push — no queued pile-up.

### Known, verified environment gap

- **`Deploy Preview` fails on every PR** due to a missing `CLOUDFLARE_API_TOKEN` repository secret — pre-existing and non-code-related. Configuring it needs repo-admin access.
- **The cascade this used to cause is fixed.** `e2e-tests` and `lighthouse` no longer `needs: deploy-preview`, so they are no longer skipped when the deploy fails. Both are now reliable per-PR signals alongside `Build`. Historically they were skipped on _every_ run, which is why 17 E2E assertions went stale on `main` and why Lighthouse produced no result in 90+ runs — the pipeline reported no failures because nothing ran.
- **The Actions deploy path is separately broken, and dormant.** Even with a valid token, both deploy jobs would fail: they run `wrangler pages deploy` (a Pages command) against a **Workers** build — `@astrojs/cloudflare` emits `dist/server/wrangler.json` with `main: entry.mjs` and `assets.directory: "../client"` — they pass `dist/`, which contains only `client/` and `server/` and so has no root `index.html` (and would place `_headers` at `/client/_headers`, disabling the CSP), and the action installs `wrangler@3.90.0` while the repo pins `^4.92.0`.
- **What actually deploys the site** is Cloudflare's own Git integration, which builds and deploys every branch independently of this workflow. That makes the Actions deploy jobs redundant as well as broken; deleting them (keeping `build` plus the two gates) is the recommended cleanup, and is why a red `Deploy Preview` does not block a release.

## 3. Constraints

- Never remove `--project-name=douro-soulfood` from any `wrangler pages deploy` invocation — this is the single most consequential mistake possible in this pipeline (stray CF Pages project creation).
- `deploy-production` only fires on `main` — there is no manual production-promotion path other than merging to `main` (the workflow does support `workflow_dispatch` for manual re-triggers, but that re-runs the same branch-gated logic, it doesn't bypass it).
- `NODE_VERSION: '22'` and `PNPM_VERSION: '9.15.9'` (both pinned in `deploy.yml`'s `env` block) must match `package.json`'s `packageManager` field — drift here has caused CI failures in this repo's history (see the "chore: final cleanup pass" commit fixing the CI Node version pin).

## 4. Acceptance Criteria

- Given a PR is opened, when CI runs, then `Build`, `Playwright E2E Tests`, and `Lighthouse CI` are all reliable per-PR signals and must be read as real results. Only `Deploy Preview`/`Deploy to Production` failing on the missing token is expected and non-blocking.
- Given a PR merges to `main`, when the pipeline completes, then production at `https://douro-soulfood.com` should reflect the merge within the workflow's total runtime (Build + Preview + E2E + Lighthouse + Production, each with its own `timeout-minutes`).
- Given the `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` secrets are eventually configured, when the next PR runs, then `Deploy Preview` should go green and this document's "Known, verified environment gap" section should be updated to reflect that (per `CLAUDE.md`'s doc-sync convention).

## 5. Agent Execution Rules

- MUST: treat `Build`, `e2e-tests`, and `lighthouse` as real per-PR signals. Only `Deploy Preview`/`Deploy to Production` may be discounted, and only for the diagnosed token gap. **Never dismiss an `e2e-tests` or `lighthouse` failure as "the known CI gap"** — that reasoning was valid only while they were skipped, and it is exactly how 17 stale assertions survived on `main`.
- MUST: verify a CI failure's root cause (read the actual job log) before classifying it as "the known gap" — a failure that looks similar but has a different actual cause is not automatically safe to ignore.
- MUST NOT: strip or bypass `--project-name` flags, `timeout-minutes` limits, or the `needs:` job-dependency gating as a way to "fix" a CI failure faster. In particular, do not re-point `e2e-tests`/`lighthouse` at `deploy-preview`: that is what made both gates unreachable.
