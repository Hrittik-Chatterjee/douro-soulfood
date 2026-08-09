import { z } from 'astro/zod';
import rawSettings from '@/content/settings/default.json';
import { parseHours, type ParsedHours } from '@/lib/hours';

/**
 * site.ts — the ONLY module that reads `src/content/settings/default.json`.
 *
 * That file is the Keystatic `settings` singleton: client-authored, and (unlike
 * the `menu_items` and `faq` collections) it has no Astro content-collection
 * schema, so nothing validated it. Six modules imported the raw JSON directly
 * and re-derived values like `tel:` hrefs independently.
 *
 * Validating here means a malformed CMS edit fails the build with a precise
 * message instead of rendering `undefined` into a meta tag or a JSON-LD node.
 *
 * NOTE: this is deliberately NOT a second source of truth. The JSON file
 * remains authoritative and client-editable; this module only parses and derives.
 */

/** Optional-but-present-in-CMS strings arrive as `""`, which must not be
 *  treated as a value (an empty `sameAs` URL is worse than no `sameAs`). */
const optionalText = z.string().transform((v) => v.trim()).optional();

const settingsSchema = z.object({
  site_name: z.string().min(1),
  tagline: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  address_line1: z.string().min(1),
  address_line2: optionalText,
  city: z.string().min(1),
  postal_code: z.string().min(1),
  country: z.string().min(1),
  google_maps_url: optionalText,
  lieferando_url: optionalText,
  logo: z.string().min(1),
  og_image: optionalText,
  social: z
    .object({
      instagram: optionalText,
      facebook: optionalText,
      tiktok: optionalText,
      tripadvisor: optionalText,
    })
    .partial()
    .default({}),
  hours: z.array(z.object({ day: z.string().min(1), time: z.string().min(1) })).default([]),
});

const parsed = settingsSchema.safeParse(rawSettings);

if (!parsed.success) {
  throw new Error(
    'src/content/settings/default.json failed validation — a CMS edit likely ' +
      'removed or emptied a required field:\n' +
      parsed.error.issues.map((i) => `  • ${i.path.join('.') || '(root)'}: ${i.message}`).join('\n'),
  );
}

export const settings = parsed.data;

/** BCP-47 tag for the site's primary language. Austrian German. */
export const SITE_LANGUAGE = 'de-AT';

/** `og:locale` uses underscores, not hyphens. */
export const OG_LOCALE = 'de_AT';

/** Digits and a leading `+` only — `tel:` must not contain spaces. */
export const phoneHref = `tel:${settings.phone.replace(/[^+\d]/g, '')}`;

/** Address lines for display, skipping the optional (usually empty) line 2. */
export const addressLines: string[] = [
  settings.address_line1,
  settings.address_line2,
  `${settings.postal_code} ${settings.city}`,
].filter((line): line is string => Boolean(line && line.length > 0));

/** Single-line address, e.g. for the footer. */
export const addressInline = `${settings.address_line1}, ${settings.postal_code} ${settings.city}`;

/** ISO 3166-1 alpha-2, which schema.org's `addressCountry` prefers. */
export const COUNTRY_CODE = 'AT';

export const orderUrl = settings.lieferando_url || 'https://www.lieferando.at/en/menu/douro';

/**
 * Only social profiles that actually have a URL. Three of the four are empty
 * strings in the CMS today, and emitting those as schema.org `sameAs` would
 * assert profiles that don't exist.
 */
export function socialLinks(): string[] {
  return Object.values(settings.social ?? {}).filter(
    (url): url is string => typeof url === 'string' && url.startsWith('http'),
  );
}

/** Absolute URL against the configured `site`. Trailing-slash form, matching
 *  Astro's `build.format: 'directory'` output and the sitemap. */
export function absoluteUrl(path: string, site: URL | undefined): string {
  const base = site ?? new URL('https://douro-soulfood.com/');
  return new URL(path, base).href;
}

/** Opening hours, parsed once. See `src/lib/hours.ts` for why. */
export const hours: ParsedHours = parseHours(settings.hours);
