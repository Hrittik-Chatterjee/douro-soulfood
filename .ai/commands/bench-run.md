# Command: BENCH RUN

**Aliases**: "Bench run", "Collect a real benchmark"

**Purpose**: collect real performance metrics for the current repo state — the Benchmark Analyst role's job.

**Inputs required**: none (defaults to all 7 real routes) or a specific route.

**Context to load**: `benchmarks/reports/PERF-POST-MIGRATION.okf.md` for the proven collection method and its caveats.

**Actions to perform**:
1. `pnpm build`.
2. `pnpm preview` (backgrounded) to serve the built site locally.
3. Run Lighthouse via the pre-installed Chromium (`CHROME_PATH=/opt/pw-browsers/chromium-*/chrome-linux/chrome npx lighthouse http://localhost:4321/{route} --quiet --output=json --output-path=evals/lighthouse/current/{route}.json --chrome-flags="--headless --no-sandbox"`) for each route.
4. Extract scores/CWV metrics into `benchmarks/current/metrics.json`.
5. Stop the preview server.

**Outputs produced**: `benchmarks/current/metrics.json`, raw Lighthouse JSON under `evals/lighthouse/current/`.

**Stop/ask conditions**: if Lighthouse/Chromium fails in the current environment, try the `astro preview` fallback (documented as working) before giving up; if that also fails, report `not_run` with the exact error — never invent numbers.

**Example usage**: "Bench run against all 5 routes."
