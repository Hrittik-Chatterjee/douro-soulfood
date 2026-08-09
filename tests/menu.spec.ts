import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Menu page E2E tests — D'ouro Soulfood Bistro
 *
 * Verifies the /menu page renders correctly with:
 * - Page heading "Speisekarte"
 * - At least one menu category heading (e.g. Tacos, Bowls)
 * - At least one menu item with a Euro price
 *
 * Runs on both desktop and mobile viewports via config projects.
 */

test.describe('Menu page — content', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu');
  });

  test('menu page loads with correct heading', async ({ page }) => {
    const h1 = page.locator('h1', { hasText: 'Speisekarte' });
    await expect(h1).toBeVisible();
  });

  test('at least one menu category heading is visible', async ({ page }) => {
    // Category sections use id="category-{slug}" and contain h2 headings
    // e.g. "Tacos", "Bowls", "African Specials", "Sides & Extras", "Drinks"
    const categoryHeadings = page.locator('section[id^="category-"] h2');
    const count = await categoryHeadings.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('at least one menu item with price (€) is visible', async ({ page }) => {
    // Prices come from Intl.NumberFormat('de-AT', { style: 'currency' }), which
    // renders the amount BEFORE the symbol and separates them with a
    // NON-BREAKING space (U+00A0) — e.g. "8,90 €", not "€8,90". The regex
    // below accepts either space kind so it survives an Intl/ICU data change.
    //
    // Matched by rendered text rather than by utility class: this assertion used
    // to look for `span.font-bold.text-brand-gold`, and prices are neither
    // spans nor gold any more, so it silently matched zero elements.
    const priceRe = /\d+,\d{2}[\s ]*€/;
    const pricedCards = page.locator('article').filter({ hasText: priceRe });

    expect(await pricedCards.count()).toBeGreaterThanOrEqual(1);
    await expect(pricedCards.first()).toBeVisible();
    await expect(pricedCards.first()).toContainText(priceRe);
  });

  test('category navigation links are present', async ({ page }) => {
    // The category nav bar at the top of the menu page
    const categoryNav = page.locator('nav[aria-label="Menü-Kategorien"]');
    await expect(categoryNav).toBeVisible();

    // Each category link points to #category-{slug}
    const categoryLinks = categoryNav.locator('a[href^="#category-"]');
    const count = await categoryLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('clicking a category link scrolls to that section', async ({ page }) => {
    const firstCategoryLink = page
      .locator('nav[aria-label="Menü-Kategorien"] a[href^="#category-"]')
      .first();
    await expect(firstCategoryLink).toBeVisible();

    const href = await firstCategoryLink.getAttribute('href');
    expect(href).toBeTruthy();

    await firstCategoryLink.click();

    // Verify the target section exists and is now in view
    const targetSection = page.locator(`section${href}`);
    await expect(targetSection).toBeVisible();
  });

  test('menu items have names (h3) and descriptions', async ({ page }) => {
    // MenuItemCard renders item names as h3 elements
    const itemNames = page.locator('article h3');
    const count = await itemNames.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Each card should also have a description paragraph. Not class-pinned:
    // the previous `p.text-text-secondary` selector matched nothing, because
    // card descriptions carry `font-sans font-medium break-words min-w-0`.
    const descriptions = page.locator('article p');
    const descCount = await descriptions.count();
    expect(descCount).toBeGreaterThanOrEqual(1);
    await expect(descriptions.first()).not.toBeEmpty();
  });

  test('allergen notice section is visible', async ({ page }) => {
    // AllergenHeaderLegend renders "ALLERGENE / ALLERGENS:" as a label, not a
    // heading — and once per category block, so it legitimately appears 8 times
    // on the page. `.first()` keeps this out of strict-mode violation while
    // still proving the legend renders.
    const noticeSection = page.getByText('ALLERGENE / ALLERGENS:').first();
    await expect(noticeSection).toBeVisible();
  });

  test('NavBar is present on menu page', async ({ page }) => {
    const nav = page.locator('nav[data-nav]');
    await expect(nav).toBeVisible();
  });

  test('Footer is present on menu page', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});

test.describe('Menu page — accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu');
  });

  test('zero axe accessibility violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length > 0) {
      console.log(
        'Menu page accessibility violations:',
        JSON.stringify(
          results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodes: v.nodes.length,
          })),
          null,
          2,
        ),
      );
    }

    expect(results.violations).toEqual([]);
  });
});

/* ═══════════════════════════════════════════════════════════════
   SECTION: SEO & structured data
   ═══════════════════════════════════════════════════════════════ */

test.describe('Menu page — SEO & structured data', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/menu');
  });

  test('has a German meta description', async ({ page }) => {
    // This page used to inherit Base.astro's English default description on a
    // German site, because it passed none.
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /Speisekarte|Tacos|Bowls/);
  });

  test('has canonical URL with trailing slash', async ({ page }) => {
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://douro-soulfood.com/menu/',
    );
  });

  test('declares exactly one JSON-LD block', async ({ page }) => {
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  });

  test('JSON-LD includes a Menu node and a breadcrumb', async ({ page }) => {
    const content = await page.locator('script[type="application/ld+json"]').first().textContent();
    const parsed = JSON.parse(content!);
    const byType = (type: string) =>
      parsed['@graph'].find((node: { '@type': string }) => node['@type'] === type);

    const menu = byType('Menu');
    expect(menu).toBeDefined();
    expect(menu.hasMenuSection.length).toBeGreaterThan(0);

    const firstItem = menu.hasMenuSection[0].hasMenuItem[0];
    expect(firstItem['@type']).toBe('MenuItem');
    expect(firstItem.offers.priceCurrency).toBe('EUR');
    // Prices are stored as EUR cents and shown to visitors as de-AT "€18,90";
    // JSON-LD requires a plain decimal with a dot.
    expect(firstItem.offers.price).toMatch(/^\d+\.\d{2}$/);

    // Inner routes DO get a breadcrumb (unlike the homepage).
    const crumbs = byType('BreadcrumbList');
    expect(crumbs).toBeDefined();
    expect(crumbs.itemListElement).toHaveLength(2);
    expect(crumbs.itemListElement[1].item).toBe('https://douro-soulfood.com/menu/');
  });
});
