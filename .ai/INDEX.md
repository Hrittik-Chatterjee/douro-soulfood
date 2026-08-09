# .ai/INDEX.md — Doc Map and Loading Guide

Read `AGENTS.md` first. This file is the second thing to read, always. It tells you what exists and when to load it — not the content itself.

## Doc map

| Doc | Path | Load when | Token budget |
|---|---|---|---|
| Full outcome-loop policy | `.ai/packs/outcome-operator.okf.md` | Running the outcome loop, executing a specific `OUTCOME-XXX`, or needing the full component/React-island/prebuilt policy in one place | ~2800 |
| Repo overview | `.ai/packs/repo-overview.okf.md` | First task in a session, or unsure what the site does | ~400 |
| Architecture | `.ai/packs/architecture.okf.md` → `docs/architecture.md` | Rendering strategy, content flow, component hierarchy, build pipeline questions | ~300 (pack) + full doc if needed |
| Design system | `.ai/packs/design-system.okf.md` → `docs/design-system.md` → `docs/design-system/` (component contracts, accessibility playbook, audit template) and `docs/ui/` (enterprise checklist lens: surface roles, component-state completeness, WCAG 2.2 target-size specifics — same tokens, different lens, kept separate by explicit choice) | Any styling/token work | ~300 + full doc |
| Content/CMS | `.ai/packs/content-cms.okf.md` → `keystatic.config.ts`, `src/content.config.ts` | Any Keystatic schema or content-collection change | ~300 + schema files |
| Components | `.ai/packs/components.okf.md` → `docs/components.md` | Building/modifying any component | ~300 + full doc |
| Accessibility | `.ai/packs/accessibility.okf.md` → `docs/agent.md`'s a11y section | Any UI change | ~300 |
| Performance | `.ai/packs/performance.okf.md` → `docs/performance-budget.md` | Any change touching JS/images/page weight | ~300 + full doc |
| Security | `.ai/packs/security.okf.md` → `docs/security.md` | Third-party scripts, CSP, consent, embeds | ~300 + full doc |
| Testing | `.ai/packs/testing.okf.md` → `docs/test-plan.md` | Writing/updating tests | ~300 + full doc |
| React islands | `.ai/packs/react-islands.okf.md` → `docs/adr/react-islands.md` | Any interactive-component decision | ~300 + full doc |
| Prebuilt components | `.ai/packs/prebuilt-components.okf.md` → `docs/prebuilt-components.md` | Borrowing an external component pattern | ~300 + full doc |
| Visual outcomes | `.ai/packs/visual-outcomes.okf.md` → `src/pages/dev/ui.astro` | Any UI component change needing visual verification | ~300 |
| SEO | `.ai/packs/seo.okf.md` → `docs/seo.md` | Meta tags, structured data, canonical/sitemap, llms.txt, image alt | ~300 + full |

## Where things live
- **Active tasks**: `.ai/tasks/active/` — in-progress outcome tasks, OKF format.
- **Backlog**: `.ai/tasks/backlog/` — not-yet-started tasks.
- **Completed task reports**: `.ai/tasks/completed/` — OKF outcome reports, one per finished task.
- **Decisions**: `.ai/decisions/*.okf.md` — settled architectural calls. Read before proposing to change something that might already be a deliberate decision.
- **Patterns**: `.ai/patterns/*.okf.md` — how to build the next instance of something this repo already does well (a new section component, a new content collection, etc.).
- **Snippets**: `.ai/snippets/*.astro` — copy-paste starting points, plain code, no OKF frontmatter (code is never OKF-formatted, per policy).
- **Memory**: `.ai/memory/` — constraints learned the hard way, anti-patterns, recurring failures, human-approval log.
- **Benchmarks**: `benchmarks/` (baseline/current/deltas/reports) — see `benchmarks/README.md`.
- **Evals**: `evals/` (lighthouse/accessibility/playwright/bundle/image/seo/ai) — see `evals/README.md`.
- **Specs**: `specs/` (components/flows/content/pages) — structural specs, seeded empty, populate as needed.

## Loading rules (see `.ai/context-budget.md` for full detail)
1. Never load a full `docs/*.md` file speculatively — load its `.ai/packs/*.okf.md` pointer first; only open the full doc if the pack's summary doesn't answer the question.
2. Never load `.ai/packs/outcome-operator.okf.md` for a routine task — `AGENTS.md` alone covers routine constraints.
3. Never re-read files already read this session unless they may have changed.
4. Route by task type via `.ai/routing.md` rather than guessing what's relevant.
