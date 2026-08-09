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
summary: 'Real 3-job CI pipeline (build, e2e-tests, lighthouse) and how production deploys actually happen (Cloudflare Git integration, independent of Actions).'
load_when: 'CI failures, deployment questions.'
token_budget: 800
related: ['okf/audit/current-state.okf.md']
---

# Release Process

## Machine Contract

doc_id: RELEASE-01 | status: approved | outputs: `.github/workflows/deploy.yml`, `wrangler.toml`, Cloudflare Pages/Workers project `douro-soulfood`

## 1. Context & Inputs

Reflects the actual CI pipeline defined in `.github/workflows/deploy.yml` — a 3-job GitHub Actions workflow (`build` → `e2e-tests`, `lighthouse` in parallel), verified line-by-line against the workflow file, not assumed from convention. **This workflow does not deploy anything.** Production deployment is handled entirely by Cloudflare's own Git integration ("Workers Builds"), which watches this repository directly and builds/deploys every push using credentials stored on Cloudflare's side — independent of GitHub Actions, and not controlled by any repo secret.

## 2. Required Outputs

### Pipeline stages (in order, per job dependency graph)

1. **Build** (`build` job, all branches): `pnpm install --frozen-lockfile` → `pnpm build` → uploads `dist/` as a workflow artifact (1-day retention) so downstream jobs don't rebuild.
2. **Playwright E2E Tests** (`e2e-tests`, needs `build`): downloads the `dist/` artifact and runs the full suite (`tests/*.spec.ts`) against it, served locally by `scripts/serve-dist.mjs` (started automatically by `playwright.config.ts`). Needs no credential and works on fork PRs.
3. **Lighthouse CI** (`lighthouse`, needs `build`): downloads the artifact, serves it with `scripts/serve-dist.mjs`, and runs `lhci autorun` over `/`, `/menu/`, `/about/`, `/catering/`, `/contact/` per `.lighthouserc.cjs`.

Both gates depend on `build` only, run in parallel, and are reliable per-PR signals — nothing skips or short-circuits them.

### Branch/environment behavior

- **Any branch, any push**: gets Build, then E2E and Lighthouse **in parallel** (both consume only the build artifact). This workflow's job is quality gating, not promotion — it has no branch-specific behavior at all.
- **Concurrency**: one CI run per branch (`concurrency.group: ci-${{ github.ref }}`), in-progress runs on the same branch are cancelled by a new push — no queued pile-up.

### How production actually deploys

- **Cloudflare's Git integration ("Workers Builds")** deploys every push to `main` automatically, independent of this workflow, using Cloudflare-side credentials. It shows up as its own check ("Workers Builds: douro-soulfood") on PRs and commits, separate from the three Actions jobs above.
- **There is currently no manual-approval gate on this.** Merging to `main` deploys to production immediately once Cloudflare's build finishes — there is no staging/preview-then-promote step in front of it today. If a gate is ever wanted, Cloudflare's own docs describe one: setting the project's Build → Deploy command to `npx wrangler versions upload` builds and versions every push **without** promoting it to the active deployment, leaving promotion as a separate manual step. That is a Cloudflare-dashboard-only setting (Workers & Pages → project → Settings → Build), not something this repo or its CI controls.
- **Actions used to also attempt a deploy, and it was removed.** Earlier versions of this workflow had `deploy-preview`/`deploy-production` jobs running `wrangler pages deploy`, gated on a `CLOUDFLARE_API_TOKEN` secret that was never configured, so they failed on every run. They were deleted rather than fixed, because a valid token alone wouldn't have made them correct: they ran a **Pages** command against what `@astrojs/cloudflare` actually emits — a **Workers** build (`dist/server/wrangler.json`, `main: entry.mjs`) — passed `dist/` instead of `dist/client` (which has no root `index.html`, and would place `_headers` at the wrong path, silently disabling the CSP), and pinned `wrangler` 3.x against a repo on `^4.92.0`. Running two independent, half-working deploy paths against one project was a footgun; the one that already works (Cloudflare's Git integration) is enough.
- **The two quality gates deliberately do not depend on a deploy.** They used to depend on the (broken) preview deploy, which meant they were skipped on every single run — the gates existed but never once executed, which is how 17 E2E assertions drifted stale on `main` unnoticed and why Lighthouse never produced a result in 90+ runs. Reading the build artifact instead makes them credential-free, fork-safe, faster, and tied to the exact bytes that were built.

## 3. Constraints

- `NODE_VERSION: '22'` and `PNPM_VERSION: '9.15.9'` (both pinned in `deploy.yml`'s `env` block) must match `package.json`'s `packageManager` field — drift here has caused CI failures in this repo's history.
- This workflow has `permissions: contents: read` only — no `deployments: write`/`statuses: write`, since it no longer creates GitHub Deployments. Don't widen this without a reason tied to an actual job need.
- Do not reintroduce a dependency from `e2e-tests`/`lighthouse` on any deploy job. That is what made both gates unreachable in the pipeline this replaced.

## 4. Acceptance Criteria

- Given a PR is opened, when CI runs, then `Build`, `Playwright E2E Tests`, and `Lighthouse CI` are all reliable per-PR signals and must be read as real results — there is no credential-gap job to discount anymore.
- Given a PR merges to `main`, when Cloudflare's own Git integration finishes its build, then production at `https://douro-soulfood.com` reflects the merge — independent of, and not blocked by, this repo's GitHub Actions run.
- Given someone wants a manual-approval gate before production, when they change the Cloudflare dashboard's Build → Deploy command to `npx wrangler versions upload`, then pushes to `main` build and version but no longer auto-promote, and a separate manual promotion step is required. This requires Cloudflare dashboard access and is not achievable by editing anything in this repo.

## 5. Agent Execution Rules

- MUST: treat `Build`, `e2e-tests`, and `lighthouse` as real per-PR signals — there is no known gap to discount them for anymore.
- MUST: remember that a green run of this workflow does not mean nothing deployed, and a merge to `main` deploys to production via Cloudflare regardless of what this workflow reports. Don't describe merging to `main` as safe-by-default without accounting for that.
- MUST NOT: reintroduce `wrangler pages deploy`/`deploy-preview`/`deploy-production` jobs into this workflow as a "fix" for anything — that path is redundant with Cloudflare's Git integration and was structurally broken (wrong Cloudflare product, wrong artifact path, wrong wrangler major version) independent of the missing token.
- MUST NOT: strip or bypass `timeout-minutes` limits or the `needs:` job-dependency gating as a way to "fix" a CI failure faster.
