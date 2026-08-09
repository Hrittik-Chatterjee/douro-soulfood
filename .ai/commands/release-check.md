# Command: RELEASE CHECK

**Aliases**: "Release check", "Is this safe to merge"

**Purpose**: assess CI status and merge safety for a PR — the Release Guardian role's job.

**Inputs required**: a PR number, or "the current branch."

**Context to load**: `docs/release.md`.

**Actions to perform**:

1. Check the PR's CI check runs (`Build`, `Playwright E2E Tests`, `Lighthouse CI` — all three are real, reliable signals; there is no known credential-gap job to discount).
2. For any failure, read the actual job log before classifying it.
3. For real failures on a PR the agent owns: fix or explain why not, per the PR-stewardship posture.
4. If merging to `main`: remember Cloudflare's Git integration deploys on every push to `main` independently of this CI, with no manual-approval gate in between — check whether the user has asked for pre-merge visual verification before merging to `main`.
5. State the merge recommendation.

**Outputs produced**: a checklist of what passed/failed, and a merge go/no-go.

**Stop/ask conditions**: a real, unresolved CI failure on a PR being merged; any request to force-push or bypass a check.

**Example usage**: "Release check PR #33 before we merge it."
