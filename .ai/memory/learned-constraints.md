# Learned Constraints

Real constraints discovered through actual work in this repo, not assumed.

- `wrangler pages dev`'s local runtime fails to start in at least one sandboxed agent environment used with this repo (`Uncaught Error: No such module "wrangler:modules-watch"`) — a pre-existing environment issue, unrelated to any code change. Fall back to `pnpm dev:astro` (plain Astro dev, no Cloudflare runtime emulation) for live verification when this happens.
- Playwright's browser binary is also confirmed missing in that same environment — `npx playwright test --list` (no browser required) is the available static-verification fallback.
- Astro's frontmatter compiler requires `import` statements to appear before any top-level `if`/`return` guard clause in a page's frontmatter — putting a `return new Response(...)` guard before imports produces a confusing "Unterminated string literal" esbuild error that has nothing obviously to do with import order. Always put imports first.
- Astro's `<Image>` component, when given a `public/`-relative string `src` (not an `src/assets/` import), passes the file through unprocessed — no format conversion/recompression, but does still add correct `width`/`height`/`decoding="async"`. This is the established, accepted behavior across every `<Image>` usage in this codebase, not a bug specific to any one component.
- `@astrojs/sitemap` doesn't know about a page's own runtime guards (e.g. a `import.meta.env.DEV` check) — it walks `src/pages/` directly. A dev-only route still needs an explicit `filter` in the sitemap integration config to actually stay out of `sitemap.xml`.
- `.jfif` files are valid JPEG content but not an extension Astro's image pipeline recognizes automatically — pass `format="jpeg"` explicitly.

- **Date**: 2026-08-06
- **Source**: manual entry via memory-append.mjs
- **Type**: constraint
- **Insight**: agent-status.mjs, command-lint.mjs, hook-lint.mjs, and agent-scorecard.mjs all ran clean on first try because their target files (.ai/commands/*.md, .ai/hooks/*.hook.md) were written with the exact field-name conventions the lint specs expect.
- **Evidence**: node .ai/scripts/command-lint.mjs -> 15/15 pass; node .ai/scripts/hook-lint.mjs -> 13/13 pass, both on first run
- **Recommended behavior**: when authoring new command/hook spec files, keep using the exact bold-field-name convention (**Field**: ...) so the lint scripts keep working without special-casing
- **Status**: active

- **Date**: 2026-08-06
- **Source**: manual entry via memory-append.mjs
- **Type**: constraint
- **Insight**: Playwright test EXECUTION (not --list) fails in this sandbox with a browser-binary version mismatch: the pinned @playwright/test wants chromium_headless_shell-1223, but only chromium-1194 and chromium_headless_shell-1194 are pre-installed at /opt/pw-browsers. This is narrower than the earlier-recorded 'Playwright browser binary is missing' note -- a binary IS present and DOES work for Lighthouse CLI (see benchmarks/reports/MENU-IMAGE-FIX.okf.md), just not at the revision this Playwright version expects for its own test runner.
- **Evidence**: npx playwright test tests/about.spec.ts --project=desktop -> Error: browserType.launch: Executable doesn't exist at /opt/pw-browsers/chromium_headless_shell-1223/...
- **Recommended behavior**: Use npx playwright test --list to verify new specs collect/parse correctly (this always works, no browser needed) and verify content assertions by grep/reading the built dist/ HTML output directly, rather than assuming full test execution is available in this sandbox
- **Status**: active

- **Date**: 2026-08-06
- **Source**: manual entry via memory-append.mjs
- **Type**: constraint
- **Insight**: iOS/macOS Safari's Low Power Mode unconditionally blocks ALL <video autoplay> playback, even with the correct muted+playsinline+autoplay attributes -- verified via web research (Apple developer forums, 2026), and there is no way for a website to detect Low Power Mode is active (Apple deliberately doesn't expose this, to avoid a fingerprinting vector). The only real mitigation is: always set a poster image on the <video>, and always call .play() via JS with a .catch() that silently no-ops on rejection -- the poster then remains visibly correct instead of a black box, with no error.
- **Evidence**: Verified via https://milkmidi.medium.com/html-autoplay-video-and-ios-low-power-mode-818dbdc982a0 and https://wojtek.im/journal/safari-autoplay-not-working-in-low-power-mode -- applied to HeroSection.astro: both mobile and desktop <video> now have a poster attribute (mobile previously had none) and the loader script's .play() call has a .catch(() => {}) for graceful silent fallback.
- **Recommended behavior**: Any new autoplaying <video> element in this repo must always include a poster attribute and must call .play() via JS with error handling -- never rely on the autoplay HTML attribute alone reliably working on Apple devices
- **Status**: active

- **A hand-maintained CSP hash list and CMS-derived inline content are incompatible.** Once JSON-LD is built from Keystatic, a routine content edit changes the rendered bytes and invalidates a committed hash. A CSP-blocked script has no build error, no test failure and no visible symptom — Playwright still reads the DOM node — only a console violation in the visitor's browser. Generate the hashes at build (`src/integrations/csp-hashes.mjs`) and keep the placeholder more restrictive than the real policy so a missing hook fails closed.
- **`astro build` does not type-check `.astro` component props.** Making a prop required is an editor/`tsc` signal only; it will NOT fail the build. `@astrojs/check` is needed for that, which is a new dependency decision.
- **Astro's `security.csp` cannot replace a header CSP here.** It emits `<meta http-equiv>`, and `frame-ancestors` is ignored in a meta-delivered policy per spec. Two policies are also enforced independently, so a header `default-src 'self'` keeps blocking inline scripts no matter what the meta allows.
- **Matching a localized `Intl` weekday string against CMS day labels is a silent failure.** `Intl.DateTimeFormat('de-AT', {weekday:'long'})` compared to `hours[].day` works only while the formatting locale happens to be German. Resolve by ISO day index instead, and keep human-readable strings out of inline scripts entirely (pass them via `data-*`) so the script stays byte-identical across locales and doesn't multiply CSP hashes.
