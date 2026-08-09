import { deAT, type UIKey } from './messages/de-AT';
import { DEFAULT_LOCALE } from './locales';

export type { UIKey } from './messages/de-AT';

/**
 * Non-default locales are typed as a PARTIAL dictionary on purpose: a
 * half-translated locale must still type-check (a translator works through
 * keys incrementally), while `scripts/checks/verify-i18n.mjs` is what stops a
 * partial locale from being added to `LIVE_LOCALES` — the type system and the
 * live-ness gate are deliberately two different mechanisms.
 */
export type UIDictionary = Partial<Record<UIKey, string>>;

const DICTIONARIES: Record<string, UIDictionary> = {
  [DEFAULT_LOCALE]: deAT,
};

/**
 * Resolves `key` for `locale`, falling back to the German original for any
 * locale that doesn't have it (an unmapped locale, or a live-but-incomplete
 * one). Never returns the raw key — a raw key leaking onto the page is worse
 * than seeing German, and would be a confusing regression for the one locale
 * (de-AT) every visitor sees today.
 */
export function t(key: UIKey, locale: string = DEFAULT_LOCALE): string {
  return DICTIONARIES[locale]?.[key] ?? deAT[key];
}
