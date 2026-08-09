# Task Routing

Route by task type. Load only the listed packs — not everything.

| Task type | Load |
|---|---|
| UI task (new/changed component, layout, styling) | `.ai/packs/design-system.okf.md`, `.ai/packs/components.okf.md`, `.ai/packs/visual-outcomes.okf.md` |
| CMS/content task (Keystatic schema, content collections) | `.ai/packs/content-cms.okf.md`, `.ai/packs/architecture.okf.md` |
| Performance task (page weight, images, JS budget) | `.ai/packs/performance.okf.md`, `benchmarks/README.md` |
| Accessibility task | `.ai/packs/accessibility.okf.md`, `.ai/packs/testing.okf.md` |
| Security task (CSP, third-party scripts, consent) | `.ai/packs/security.okf.md` |
| React island task | `.ai/packs/react-islands.okf.md`, `.ai/packs/performance.okf.md`, `.ai/packs/components.okf.md`, `.ai/decisions/no-global-react.okf.md` |
| Prebuilt component task | `.ai/packs/prebuilt-components.okf.md`, `.ai/packs/design-system.okf.md`, `.ai/packs/visual-outcomes.okf.md` |
| Benchmark task | `.ai/packs/performance.okf.md`, `benchmarks/README.md`, `evals/README.md` |
| SEO task | `.ai/packs/seo.okf.md`, `docs/seo.md`, `.ai/packs/security.okf.md` (structured data is coupled to the CSP hash generator — not obvious, don't skip) |
| Docs-only task | The specific `docs/*.md` file being changed, plus its pack if one exists — nothing else |
| First task in a new session | `.ai/packs/repo-overview.okf.md`, `okf/audit/current-state.okf.md` |

If a task spans multiple types (e.g. a React island that's also a performance concern), load the union of the relevant rows — don't load every pack "to be safe."

## Role sequences by task type

Per `.ai/agents/README.md` — typical role sequence for common task shapes (skip a role if the task genuinely doesn't touch its concern):

| Task type | Typical role sequence |
|---|---|
| New component | Context Librarian → Spec Writer (if no spec) → Implementer → Design System Guardian → Accessibility Guardian → QA Verifier → Docs Guardian |
| CMS/content change | Context Librarian → CMS/Content Guardian → Implementer → QA Verifier → Docs Guardian |
| Performance work | Context Librarian → Performance Engineer → Benchmark Analyst → Implementer → QA Verifier |
| Bug fix | Context Librarian → Implementer (root-cause first) → QA Verifier |
| Docs-only | Context Librarian → Docs Guardian |
| Multi-step feature | Orchestrator (sequences the rest) → Spec Writer → Implementer → relevant guardians → QA Verifier → Docs Guardian → Memory Curator (if a new lesson surfaced) |
| CI/merge decision | Release Guardian |
| Security-sensitive change | Security Guardian → Implementer → QA Verifier |

## Command-to-hook mapping

Each `.ai/commands/*.md` command implicitly applies certain `.ai/hooks/*.hook.md` checkpoints:

| Command | Applies hooks |
|---|---|
| START TASK | `task-intake`, `context-selection` |
| PLAN TASK | `spec-gate`, `pattern-reuse`, `safety-gate` |
| IMPLEMENT TASK | `code-change`, `truth-verification` |
| VERIFY TASK | `verification` |
| BENCH RUN / BENCH COMPARE | `benchmark` |
| DOC SYNC | `docs-sync`, `truth-verification` |
| LEARN | `memory-capture` |
| Any command's conclusion | `final-report` |
