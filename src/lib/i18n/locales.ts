/**
 * locales.ts — the single registry of every locale this site knows about,
 * live or not.
 *
 * `LIVE_LOCALES` is the one gate that matters: it is the *absence* of an
 * entry, not a runtime check, that keeps a locale from shipping. Nothing in
 * this codebase should ever render a link, a <link rel="alternate">, or a
 * language-switcher entry for a locale that isn't in this array — see
 * `Base.astro`'s hreflang block and `LanguageSwitcher.astro`.
 *
 * Astro's own `i18n.locales` config (astro.config.mjs) is kept in lockstep
 * with `LIVE_LOCALES`, not with `LOCALE_REGISTRY` below — a locale only
 * enters astro.config.mjs once real pages exist for it (Phase 3 for `en`).
 * Declaring a locale there before its pages exist would let
 * `getRelativeLocaleUrl`/`getAbsoluteLocaleUrlList` generate URLs that
 * 404, which is worse than not having the code path at all.
 */

export type LocaleStatus = 'live' | 'planned';

export interface LocaleEntry {
  /** BCP-47 tag, matching astro.config.mjs's `i18n.locales` once live. */
  code: string;
  /** Human label, in the locale's OWN language (not translated). */
  label: string;
  status: LocaleStatus;
  /**
   * Why a `planned` locale isn't live yet — kept here so the reason travels
   * with the registry entry instead of living only in a PR description.
   * Required for `planned`, omitted for `live` (the code itself is the proof).
   */
  blockedBy?: string;
}

export const LOCALE_REGISTRY: readonly LocaleEntry[] = [
  { code: 'de-AT', label: 'Deutsch', status: 'live' },
  {
    code: 'en',
    label: 'English',
    status: 'planned',
    blockedBy:
      'No human-translated page prose exists yet (only descriptionEn on 39/43 dishes). ' +
      'Machine translation is explicitly excluded — see docs/i18n.md.',
  },
  {
    code: 'zh',
    label: '中文',
    status: 'planned',
    blockedBy: 'No Chinese content exists in any form. Registry entry only, per docs/i18n.md.',
  },
  {
    code: 'pt',
    label: 'Português',
    status: 'planned',
    blockedBy: 'No Portuguese content exists in any form. Registry entry only, per docs/i18n.md.',
  },
] as const;

/** Derived, not hand-maintained — this is what "live" actually means at runtime. */
export const LIVE_LOCALES: readonly string[] = LOCALE_REGISTRY.filter(
  (l) => l.status === 'live',
).map((l) => l.code);

export const DEFAULT_LOCALE = 'de-AT';

export function isLiveLocale(code: string): boolean {
  return LIVE_LOCALES.includes(code);
}

export function getLocaleEntry(code: string): LocaleEntry | undefined {
  return LOCALE_REGISTRY.find((l) => l.code === code);
}
