import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { settings, addressInline, hours, orderUrl } from '@/lib/site';
import { formatHoursSummary } from '@/lib/hours';
import { categoryConfig, getSortedGroupedMenu } from '@/lib/menu';

/**
 * /llms.txt — a plain-text orientation file for AI agents and answer engines.
 *
 * WHY AN ENDPOINT AND NOT A STATIC public/llms.txt
 * ------------------------------------------------
 * The useful content here (address, phone, opening hours, menu categories) all
 * lives in Keystatic. A static file would be a second, hand-maintained copy that
 * silently goes stale the first time the client edits her hours — the same drift
 * class the CSP hash generator exists to prevent.
 *
 * `prerender = true` means this is written to disk at build time, so it costs no
 * Worker invocation. (`robots.txt` stays a static file precisely because it has
 * no CMS dependency — the distinction is whether the content is derived.)
 *
 * Everything below is a fact already visible on the site. Nothing is invented:
 * notably there is no reservation form, so this states that booking is by phone,
 * which is what the FAQ says.
 */
export const prerender = true;

export const GET: APIRoute = async () => {
  const allItems = await getCollection('menu_items');
  const { sortedCategories } = getSortedGroupedMenu(allItems);

  const categories = sortedCategories
    .map(([slug, items]) => `- ${categoryConfig[slug]?.label ?? slug} (${items.length} Gerichte)`)
    .join('\n');

  const body = `# ${settings.site_name}

> ${settings.tagline}. Afro-lateinamerikanisches Bistro in Salzburg, Österreich. Gegründet von Angela, die alle Gerichte selbst kocht.

Alle Inhalte dieser Website sind auf Deutsch (de-AT). Die Speisekarte führt zusätzlich englische Gerichtbeschreibungen.

## Auf einen Blick

- **Was:** Restaurant und Bistro. Brasilianische, lateinamerikanische und afrikanische Küche.
- **Wo:** ${addressInline}, ${settings.country}
- **Öffnungszeiten:** ${formatHoursSummary(hours)} (Zeitzone Europe/Vienna)
- **Telefon:** ${settings.phone}
- **E-Mail:** ${settings.email}
- **Preisniveau:** €€
- **Bestellen/Liefern:** über Lieferando — ${orderUrl}
- **Abholung:** ja, direkt im Bistro
- **Reservierung:** telefonisch unter ${settings.phone} oder ohne Voranmeldung vorbeikommen. Es gibt kein Online-Reservierungsformular.
- **Vegane und vegetarische Gerichte:** ja, mehrere Optionen auf der Speisekarte gekennzeichnet.

## Speisekarte

${categories}

Preise und Allergenangaben stehen bei jedem Gericht auf /menu/.

## Seiten

- [Startseite](/) — Überblick, beliebte Gerichte, Standort, FAQ
- [Speisekarte](/menu/) — alle Gerichte mit Preisen, Allergenen und Kennzeichnung für vegane/vegetarische/glutenfreie Optionen
- [Über uns](/about/) — Angelas Geschichte und die Werte hinter dem Bistro
- [Catering & Events](/catering/) — Firmenevents und private Feiern
- [Kontakt](/contact/) — Adresse, Telefon, Öffnungszeiten, Anfahrt
- [Impressum](/impressum/) — Offenlegung gemäß §5 ECG und §25 Mediengesetz (nur auf Deutsch, rechtlich verbindlich)
- [Datenschutz](/datenschutz/) — Datenschutzerklärung gemäß DSGVO (nur auf Deutsch, rechtlich verbindlich)

## Hinweise

- Es gibt keinen Warenkorb und keinen Checkout auf dieser Website. Bestellungen laufen ausschließlich über den externen Lieferando-Link.
- Google Maps wird erst nach ausdrücklicher Zustimmung geladen (Zwei-Klick-Lösung).
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
