/**
 * content.ts — resolves a locale-suffixed CMS field without any consumer
 * ever naming the storage field directly.
 *
 * Content is NOT stored locale-keyed (`{ 'de-AT': '...', en: '...' }`) —
 * it's stored as a base field plus optional `<Field>En` suffix fields
 * (`description` / `descriptionEn`), matching how `content.config.ts` and
 * `keystatic.config.ts` already define the 43 live menu items. Migrating
 * that shape was explicitly out of scope for this rollout; this accessor
 * is what makes that possible without leaking the storage detail past this
 * one file. A future locale-keyed migration is a change to the map below
 * plus the two schema files — never a change to every call site.
 *
 * Only fields with a real localized variant today are mapped. FAQ
 * `question`/`answer` have no `questionEn`/`answerEn` yet (Phase 3 entry
 * criterion, per docs/i18n.md) — `localized()` falls back to the base
 * field for those, which is correct: it's the same fallback a missing
 * translation gets.
 */

export type LocalizableRecord = Record<string, unknown>;

/** entity kind -> locale -> which suffixed field holds that locale's copy. */
const FIELD_MAP: Record<string, Record<string, string>> = {
  menuItem: { en: 'descriptionEn' },
};

/**
 * Reads `baseField` on `entry` for `locale`, falling back to the base field
 * itself when no localized variant exists (unmapped kind, unmapped locale, or
 * the CMS-editable localized field is empty/unset). Never throws — a missing
 * translation degrades to the German original, not a blank string.
 */
export function localized(
  entry: LocalizableRecord,
  baseField: string,
  locale: string,
  kind: keyof typeof FIELD_MAP = 'menuItem',
): string {
  const base = entry[baseField];
  const baseStr = typeof base === 'string' ? base : '';

  const localizedField = FIELD_MAP[kind]?.[locale];
  if (!localizedField) return baseStr;

  const value = entry[localizedField];
  return typeof value === 'string' && value.trim() !== '' ? value : baseStr;
}
