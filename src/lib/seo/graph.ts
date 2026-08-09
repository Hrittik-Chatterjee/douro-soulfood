import {
  settings,
  SITE_LANGUAGE,
  COUNTRY_CODE,
  hours,
  socialLinks,
  absoluteUrl,
  orderUrl,
} from '@/lib/site';
import { toOpeningHoursSpecification } from '@/lib/hours';

/**
 * graph.ts — builds ONE schema.org `@graph` per page.
 *
 * WHY A SINGLE @graph
 * -------------------
 * The `Restaurant` node used to live in `Base.astro`, which meant all 7 pages
 * each declared their own complete, unlinked copy of the business — 7 rival
 * entities describing the same restaurant. A `@graph` fixes that properly: the
 * business is declared once with a stable `@id`, and every other node points at
 * that `@id` instead of redescribing it.
 *
 * It also makes "exactly one <script type=application/ld+json> per page" a
 * testable invariant, which is worth having given the CSP hashing (see
 * `src/integrations/csp-hashes.mjs`).
 *
 * GROUND RULES
 * ------------
 * - Every value comes from `src/lib/site.ts` (i.e. from Keystatic). Nothing is
 *   hardcoded here, so a CMS edit can't leave the markup asserting stale facts.
 * - Nothing is asserted that isn't visible on the page, and nothing is invented.
 *   Fields awaiting confirmed business facts (`geo`, `acceptsReservations`,
 *   customer `Review`s) are deliberately absent rather than guessed — see
 *   `docs/seo.md`.
 */

/**
 * Google's aggregate rating, as already displayed by `ReviewBadge` on the
 * homepage (which is what satisfies Google's "must be visible" requirement).
 *
 * Carried over verbatim from the previous hardcoded `Base.astro` block so this
 * refactor doesn't silently drop an existing signal. Two open questions for the
 * business before this should be considered settled — see `docs/seo.md`:
 *   1. Are 4.8 / 978 still current?
 *   2. Is marking up a third-party (Google) aggregate as the restaurant's own
 *      `aggregateRating` acceptable under Google's review-snippet policy?
 * If it stays, these belong in the Keystatic `settings` singleton so they can be
 * refreshed without a code change.
 */
const AGGREGATE_RATING = { value: '4.8', count: '978', best: '5' };

/** Stable `@id`s. Fragment-on-homepage is the conventional pattern. */
const ids = (site: URL | undefined) => ({
  restaurant: `${absoluteUrl('/', site)}#restaurant`,
  website: `${absoluteUrl('/', site)}#website`,
  logo: `${absoluteUrl('/', site)}#logo`,
  menu: `${absoluteUrl('/menu/', site)}#menu`,
});

export interface PageGraphOptions {
  /** `Astro.site` */
  site: URL | undefined;
  /** Absolute canonical URL of the current page. */
  url: string;
  /** Page title as rendered (without the brand prefix). */
  name: string;
  description: string;
  /** Absolute URL of the page's primary image. */
  image: string;
  /** Breadcrumb trail excluding "Home" — empty on the homepage. */
  breadcrumb?: { name: string; path: string }[];
  /** Extra nodes (Menu, FAQPage, …) appended to the graph. */
  extraNodes?: Record<string, unknown>[];
}

/**
 * The business itself. One canonical description, referenced by `@id` elsewhere.
 * `Restaurant` is a subtype of `LocalBusiness`, so this covers both.
 */
function restaurantNode(site: URL | undefined) {
  const id = ids(site);
  const sameAs = socialLinks();
  const openingHours = toOpeningHoursSpecification(hours);

  return {
    '@type': 'Restaurant',
    '@id': id.restaurant,
    name: settings.site_name,
    description: settings.tagline,
    url: absoluteUrl('/', site),
    telephone: settings.phone,
    email: settings.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address_line1,
      addressLocality: settings.city,
      postalCode: settings.postal_code,
      addressCountry: COUNTRY_CODE,
    },
    logo: {
      '@type': 'ImageObject',
      '@id': id.logo,
      url: absoluteUrl(settings.logo, site),
    },
    image: absoluteUrl(settings.logo, site),
    servesCuisine: ['Brazilian', 'Latin American', 'African'],
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    inLanguage: SITE_LANGUAGE,
    // Only include optional facts when the CMS actually has them.
    ...(openingHours.length > 0 ? { openingHoursSpecification: openingHours } : {}),
    ...(settings.google_maps_url ? { hasMap: settings.google_maps_url } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    hasMenu: id.menu,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: AGGREGATE_RATING.value,
      reviewCount: AGGREGATE_RATING.count,
      bestRating: AGGREGATE_RATING.best,
    },
    // The only ordering path is the external Lieferando handoff.
    potentialAction: {
      '@type': 'OrderAction',
      target: { '@type': 'EntryPoint', urlTemplate: orderUrl },
    },
  };
}

function webSiteNode(site: URL | undefined) {
  const id = ids(site);
  return {
    '@type': 'WebSite',
    '@id': id.website,
    url: absoluteUrl('/', site),
    name: settings.site_name,
    inLanguage: SITE_LANGUAGE,
    publisher: { '@id': id.restaurant },
  };
}

function webPageNode(options: PageGraphOptions, hasBreadcrumb: boolean) {
  const id = ids(options.site);
  return {
    '@type': 'WebPage',
    '@id': `${options.url}#webpage`,
    url: options.url,
    name: options.name,
    description: options.description,
    isPartOf: { '@id': id.website },
    about: { '@id': id.restaurant },
    inLanguage: SITE_LANGUAGE,
    primaryImageOfPage: options.image,
    ...(hasBreadcrumb ? { breadcrumb: { '@id': `${options.url}#breadcrumb` } } : {}),
  };
}

/**
 * Markup-only breadcrumbs: there is no visible breadcrumb UI, which is a
 * supported and common arrangement. Omitted on the homepage, where a
 * single-item trail carries no information.
 */
function breadcrumbNode(options: PageGraphOptions) {
  const trail = [{ name: 'Startseite', path: '/' }, ...(options.breadcrumb ?? [])];
  return {
    '@type': 'BreadcrumbList',
    '@id': `${options.url}#breadcrumb`,
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, options.site),
    })),
  };
}

export function buildPageGraph(options: PageGraphOptions) {
  const hasBreadcrumb = (options.breadcrumb ?? []).length > 0;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      restaurantNode(options.site),
      webSiteNode(options.site),
      webPageNode(options, hasBreadcrumb),
      ...(hasBreadcrumb ? [breadcrumbNode(options)] : []),
      ...(options.extraNodes ?? []),
    ],
  };
}

/* ---------------------------------------------------------------------------
 * Page-specific nodes
 * ------------------------------------------------------------------------- */

export interface MenuSectionInput {
  name: string;
  items: {
    name: string;
    description?: string;
    /** EUR cents, as stored in Keystatic. */
    priceInCents: number;
    image?: string;
    dietary?: string[];
    available?: boolean;
  }[];
}

/**
 * schema.org has no `RestrictedDiet` member for "spicy" or "dairy-free", so
 * those tags are dropped rather than mapped to invented IRIs.
 */
const DIET_IRI: Record<string, string> = {
  vegan: 'https://schema.org/VeganDiet',
  vegetarian: 'https://schema.org/VegetarianDiet',
  'gluten-free': 'https://schema.org/GlutenFreeDiet',
  halal: 'https://schema.org/HalalDiet',
};

/**
 * `Offer.price` must be a plain decimal with a `.` separator — NOT the de-AT
 * `€18,90` shown to visitors. Same source value, two different formatters.
 */
function priceFromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function menuNode(sections: MenuSectionInput[], site: URL | undefined) {
  const id = ids(site);
  return {
    '@type': 'Menu',
    '@id': id.menu,
    name: 'Speisekarte',
    url: absoluteUrl('/menu/', site),
    inLanguage: SITE_LANGUAGE,
    hasMenuSection: sections.map((section) => ({
      '@type': 'MenuSection',
      name: section.name,
      hasMenuItem: section.items.map((item) => {
        const diets = (item.dietary ?? []).map((tag) => DIET_IRI[tag]).filter(Boolean);
        return {
          '@type': 'MenuItem',
          name: item.name,
          ...(item.description ? { description: item.description } : {}),
          ...(item.image ? { image: absoluteUrl(item.image, site) } : {}),
          ...(diets.length > 0 ? { suitableForDiet: diets } : {}),
          offers: {
            '@type': 'Offer',
            price: priceFromCents(item.priceInCents),
            priceCurrency: 'EUR',
            availability:
              item.available === false
                ? 'https://schema.org/SoldOut'
                : 'https://schema.org/InStock',
          },
        };
      }),
    })),
  };
}

/**
 * `FAQPage` from the visible accordion. Honest expectation: Google restricted
 * FAQ rich results to authoritative government/health sites, so this will not
 * produce a SERP accordion. It remains valid markup and materially helps
 * AI/answer-engine extraction, which is the same reason `public/llms.txt` exists.
 */
export function faqNode(
  items: { question: string; answer: string }[],
  pageUrl: string,
) {
  return {
    '@type': 'FAQPage',
    '@id': `${pageUrl}#faq`,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
