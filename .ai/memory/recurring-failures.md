# Recurring Failures

Environment/tooling failures seen more than once in this repo's session history — expected, not surprising, when they recur.

- ~~`Deploy Preview` GitHub Actions job fails on every PR~~ — **no longer recurs**: the `deploy-preview`/`deploy-production` jobs were deleted in PR #56 rather than fixed (they were redundant with Cloudflare's own Git integration, which deploys independently, and were separately broken regardless of the missing token). `.github/workflows/deploy.yml` is now a 3-job quality-gate-only pipeline; `Build`, `e2e-tests`, and `lighthouse` are all reliable per-PR signals with no known gap among them. See `docs/release.md`.
- **`wrangler pages dev` fails to start locally** in at least one sandboxed agent environment (`workerd` module resolution error). Recurs identically every time it's attempted in that environment — not worth re-attempting without first checking whether the environment has changed.
- **Playwright's browser binary is missing** in that same environment, so `npx playwright test` (full run) fails, while `npx playwright test --list` (no browser needed) succeeds. Use the `--list` fallback for static verification when a full run isn't possible.

## If a "recurring failure" stops recurring

If any of the above suddenly works (e.g. a future environment has a working Chromium binary), update this file to say so — don't keep treating a fixed limitation as still-broken.

- **Date**: 2026-08-06
- **Source**: manual entry via memory-append.mjs
- **Type**: recurring-failure
- **Insight**: A single Lighthouse run in this sandbox is not reliable evidence of a fix's magnitude — /menu's performance score varied 0.81-0.94 across 6 runs (3 before, 3 after an 80% image-payload reduction), with no clean before/after separation, and the original 0.64/8960ms reading could not be reliably reproduced even before the fix.
- **Evidence**: 6 real lighthouse CLI runs against astro preview this session, recorded in benchmarks/deltas/menu-image-optimization.json
- **Recommended behavior**: Always run Lighthouse 3+ times before treating a single score as ground truth for a regression or a fix's impact in this environment; report score ranges, not single numbers, when variance is this high
- **Status**: active

- **Date**: 2026-08-06
- **Source**: manual entry via memory-append.mjs
- **Type**: recurring-failure
- **Insight**: Reducing /menu's DOM size by a real, verified 28% (1526 -> 1092 elements, via a shared SVG symbol/use sprite for repeated flag icons) did not produce a cleanly separated Lighthouse performance score in this sandbox (0.77-0.89 after vs 0.81-0.94 before) -- confirming the earlier finding that this environment's Lighthouse measurement noise can swamp real, targeted optimizations.
- **Evidence**: 3 Lighthouse runs post-DOM-fix vs 3 runs post-image-fix, both recorded in benchmarks/reports/MENU-DOM-SIZE-FIX.okf.md
- **Recommended behavior**: Do not keep chasing a specific Lighthouse score number in this sandbox once a real, verified structural improvement has been made and the score still doesn't clearly move -- re-measure from an unrestricted environment before concluding further work is or isn't warranted
- **Status**: active

- **Date**: 2026-08-06
- **Source**: manual entry via memory-append.mjs
- **Type**: recurring-failure
- **Insight**: A CSP policy documented as a 'known SEO-only gap' (JSON-LD blocked) turned out on investigation to be a much more severe, currently-live functional bug: ALL inline scripts on the site were CSP-blocked, including the mobile hamburger menu toggle and the Google Maps consent-gate button -- both silently did nothing for real production visitors.
- **Evidence**: Headless-Chrome click test before the fix: clicking #mobile-menu-btn left #mobile-menu's data-open attribute at 'false'. After adding all 5 script hashes to public/\_headers: data-open became 'true' and the map consent-gate iframe loaded on click, zero CSP console violations.
- **Recommended behavior**: When a backlog item says a CSP/security gap only affects SEO or a narrow feature, verify that scope directly (grep for ALL inline <script> tags site-wide, not just the one named in the note) before assuming the blast radius is as documented -- the actual impact here was much larger than what was written down
- **Status**: active

- **Date**: 2026-08-06
- **Source**: manual entry via memory-append.mjs
- **Type**: recurring-failure
- **Insight**: Content added to a thin OKF pack (.ai/packs/security.okf.md) during a real fix expanded it past its own frontmatter token_budget without anyone re-checking node .ai/scripts/token-report.mjs afterward -- the pack grew from a 350-token pointer to a 686-token near-duplicate of docs/security.md's full narrative before this was caught.
- **Evidence**: node .ai/scripts/token-report.mjs before fix: security.okf.md 686 tokens vs 500 budget, OVER BUDGET; after trimming back to a pointer: 498/500, ok
- **Recommended behavior**: Run node .ai/scripts/token-report.mjs as a matter of course after editing any .ai/packs/_.okf.md file, not just when told to -- packs are meant to stay thin pointers to docs/_.md, and it is easy to accidentally duplicate full narrative content into them while documenting a fix in the moment
- **Status**: active

- **Date**: 2026-08-06
- **Source**: manual entry via memory-append.mjs
- **Type**: recurring-failure
- **Insight**: HeroSection.astro's two background videos (mobile 4.9MB + desktop 7.6MB) were both fetched by the browser on EVERY page load regardless of viewport, confirmed via real network-request capture in headless Chrome -- CSS hidden/block (display:none) only affects rendering, not whether the browser starts downloading a <video> resource with a static src attribute. This roughly doubled real bandwidth cost on every single homepage visit, mobile or desktop, and was never caught by prior Lighthouse runs since /menu was the only route benchmarked, not /.
- **Evidence**: Before fix: node network-capture test showed 2 video requests (both douroheromobile.mp4 AND douroherovideo.mp4) fetched on both a 375px and a 1440px viewport. After fix (viewport-matched JS loader, src set dynamically instead of statically): exactly 1 request per viewport, matching the visible video.
- **Recommended behavior**: When a component conditionally shows/hides two heavy same-purpose resources (video, iframe, etc.) via CSS breakpoint classes alone, verify with a real network-request capture (not just visual inspection) whether the hidden one is still being fetched -- CSS visibility and resource loading are two independent things browsers do not automatically couple for <video>/<audio>/<iframe> elements with a static src
- **Status**: active
