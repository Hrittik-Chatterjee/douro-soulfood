# Human Preferences

Explicit, stated preferences from the repo owner — not agent-inferred guesses about what they probably want. Distinct from `.ai/decisions/*.okf.md` (settled architectural calls) and `.ai/memory/human-approvals.md` (one-off approvals for a specific action) — this file is for standing style/process preferences that should shape _how_ future work gets done, not _what_ gets built.

## Preferences observed this session

- **Prefers full, real execution over partial/token-saving shortcuts** when explicitly asked to "run the full loop" or "execute Phases X through Y" — evidenced by repeated requests to complete entire multi-phase master prompts rather than a subset, across several rounds this session.
- **Wants explicit, self-answered Socratic checks treated as decisions**, not re-litigated — when a master prompt included a "Socratic check" question and the user immediately answered their own question in the same message, that answer was correctly treated as the operative instruction, not something requiring a follow-up confirmation.
- **Values honest reporting of environment limitations over forced success** — multiple master prompts in this session explicitly instructed "do not fake benchmark results," and the one time a real blocker was hit (Chrome/proxy interstitial), reporting it honestly and trying a legitimate alternative (rather than giving up or fabricating) was the correct call, consistent with the prompts' own stated values.
- **Wants merges/PR management driven by an established CI-check bar once established** (all of `Build`, `e2e-tests`, `lighthouse` passing — there is no known-gap job to exclude anymore since the broken deploy jobs were deleted in PR #56) rather than re-litigating the same question on every single PR — evidenced by later requests ("merge PR #X too") issued tersely once the pattern was set.
- **CRITICAL, standing: do not merge/push to `main` without explicit per-instance permission, ideally after the user has visually verified the site via a URL.** Stated verbatim: "Without me verifying the website visually (you give me url to check website UI), deploy shouldnt happen — it should happen only after my permission." This exists because Cloudflare's Git integration auto-deploys every push to `main` to production with no approval gate in between (see `docs/release.md`) — merging is deploying, on this repo, today. A prior blanket permission to merge PRs does NOT itself satisfy this — treat it as a separate, always-required check before any push/merge to `main`, not superseded by the "established CI-check bar" preference above (that preference governs _which CI result_ is trusted, not _whether to merge without asking_).

## How to use this file

When a new preference is stated explicitly by the human (not inferred), add it here via LEARN, with the evidence (which request/session it came from).
