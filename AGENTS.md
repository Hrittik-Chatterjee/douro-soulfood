# AGENTS.md — D'ouro Soulfood Bistro

Universal entrypoint for any AI coding agent (Claude Code, Cursor, Windsurf, Cline, Copilot, or any other). Read this file first, in full, before touching anything else.

## Repo identity
Astro 6 + Tailwind v4 + Keystatic CMS restaurant marketing site for D'ouro Soulfood Bistro (Salzburg, Austria), deployed to Cloudflare Pages. No accounts, no cart, no contact form — the site's only "order" flow hands off to Lieferando.

## Prime directives
1. Outcome before output — define "done" before implementing.
2. Read before writing — never invent a repo fact; verify against the actual file.
3. Docs before/with code — if the governing doc is missing or wrong, fix it in the same change, not a follow-up.
4. Smallest correct change — no speculative abstractions, no unrequested refactors.
5. Verify before done — run `pnpm build` at minimum; report exact failures, never fake a pass.

## Non-negotiable constraints
- Astro components by default. No React/client-JS framework is installed. React-as-island requires explicit user approval — see `.ai/decisions/no-global-react.okf.md` and `docs/adr/react-islands.md`.
- Design tokens only — `var(--color-*)` etc. from `src/styles/tokens.css`. Zero hardcoded hex (except literal flag-emoji SVG fills).
- `class:list={[...]}` for conditional classes. No `cn()`/`clsx` helper exists — don't reintroduce one.
- `keystatic.config.ts` and `src/content.config.ts` define the same content shapes independently — keep them hand-synced on any schema change.
- Astro `<Image>` for all `src/pages/` image usage (achieved as of IMG-01/CMS-01) — don't reintroduce raw `<img>` in page-level grids.
- No unrequested UI resizing or layout changes — keep verified component dimensions and typography (e.g. `MobileBottomBar`'s compact `min-h-11` and `text-sm`) intact unless explicitly instructed.

## Where to read next (load only what the task needs)
- `.ai/INDEX.md` — full doc map, token budgets, routing by task type. **Load this second, always.**
- `.ai/status.md` (or `node .ai/scripts/agent-status.mjs` for live data) — current repo state, active tasks, latest benchmark, known blockers.
- `.ai/next-action.md` — the single most valuable next step, if you don't already have a task.
- `.ai/routing.md` — which domain pack(s) to load for your specific task type.
- `.ai/context-budget.md` — how much to load, when to stop.
- `.ai/agents/README.md` — the 14-role agent matrix, if your task benefits from adopting a specific role's checklist.
- `.ai/commands/README.md` — the 15-command registry (agent-bootstrap, start-task, verify-task, bench-run, etc.) — prefer an existing command's spec over improvising a workflow.
- `.ai/hooks/README.md` — the 13 hook specs describing expected agent behavior at each stage (session start, before/after code changes, verification, memory capture, etc.).
- `.ai/decisions/*.okf.md` — settled architectural decisions; don't re-litigate without new information.
- `.ai/memory/anti-patterns.md` and `.ai/memory/recurring-failures.md` — known mistakes made in this repo before; don't repeat them.

## Task execution loop
1. Ingest: read the relevant files + governing doc.
2. Spec: create/update the doc first if missing or stale.
3. Plan: list exact files to change, identify risk.
4. Implement: smallest correct change.
5. Verify: `pnpm build` (+ `pnpm test:e2e`/`pnpm lhci` where practical — both may fail to execute in a sandboxed environment lacking a Chromium binary; report `not_run` honestly if so, never fabricate a result).
6. Reflect: no hardcoded colors, no unjustified React, no raw `<img>` where `<Image>` is safe, Keystatic/Astro schema still in sync, docs updated.
7. Report: state what changed, what was verified, what wasn't, and why.

## Stop and ask conditions
1. Adding a React dependency without prior explicit approval for that specific component.
2. A borrowed component's license is unclear (see `docs/prebuilt-components.md`).
3. A visual change risks materially altering brand identity.
4. A Keystatic schema change could affect existing client content.
5. A test failure suggests a deeper architectural issue, not a local bug.
6. The task requires touching deployment secrets or Cloudflare account settings.
7. The request conflicts with the performance budget (`docs/performance-budget.md`) or accessibility rules.

## Required report format
End every non-trivial task with: what changed (files), what was verified (real commands run, real output), what wasn't verifiable and why, and any risk or follow-up worth flagging. Don't claim a check passed if it wasn't actually run.
