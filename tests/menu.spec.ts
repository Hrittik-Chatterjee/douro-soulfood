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
    // MenuItemCard renders prices as "€14,90" via Intl.NumberFormat('de-AT')
    // The price element uses class "text-brand-gold" with font-bold
    const priceElements = page.locator('span.font-bold.text-brand-gold');
    const count = await priceElements.count();

    // At least one price should be present
    expect(count).toBeGreaterThanOrEqual(1);

    // Verify at least one contains the Euro sign
    let foundEuroPrice = false;
    for (let i = 0; i < count; i++) {
      const text = await priceElements.nth(i).textContent();
      if (text?.includes('€')) {
        foundEuroPrice = true;
        break;
      }
    }
    expect(foundEuroPrice).toBe(true);
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
    const firstCategoryLink = page.locator('nav[aria-label="Menü-Kategorien"] a[href^="#category-"]').first();
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

    // Each card should also have a description paragraph
    const descriptions = page.locator('article p.text-text-secondary');
    const descCount = await descriptions.count();
    expect(descCount).toBeGreaterThanOrEqual(1);
  });

  test('allergen notice section is visible', async ({ page }) => {
    const noticeSection = page.locator('h3', { hasText: 'Hinweis' });
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
          2
        )
      );
    }

    expect(results.violations).toEqual([]);
  });
});
