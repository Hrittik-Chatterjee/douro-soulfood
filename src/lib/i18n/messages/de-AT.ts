/**
 * de-AT.ts — the UI-chrome dictionary, and the TYPE SOURCE for every other
 * locale's dictionary.
 *
 * Scope is deliberately narrow: chrome strings and `aria-label`s that would
 * otherwise be typed once per consumer (or worse, hardcoded inside an inline
 * `<script>` — see `nav.ts`'s module comment and the CSP payoff it describes).
 * This is NOT where page prose or CMS content lives; those stay in
 * Keystatic/`descriptionEn`-style suffix fields (`src/lib/i18n/content.ts`)
 * because a client must be able to edit them without a code change. A
 * client must NOT be able to accidentally break an `aria-label` or a
 * `data-open`-driving string, so this dictionary is code, not Keystatic.
 *
 * Flat, dotted keys — no nested objects — so `UIKey` (below, derived from
 * this file) stays a simple string union and a translated dictionary is a
 * flat object literal, not a tree a translator could restructure.
 */
export const deAT = {
  'nav.drawer.open': 'Navigationsmenü öffnen',
  'nav.drawer.close': 'Navigationsmenü schließen',
} as const;

export type UIKey = keyof typeof deAT;
