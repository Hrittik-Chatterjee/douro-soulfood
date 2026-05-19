import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Home page E2E tests — D'ouro Soulfood Bistro
 *
 * Tests run at BOTH desktop (1440×900) and mobile (375×812) viewports
 * via the playwright.config.ts project matrix.
 *
 * Selectors use aria-label, data-*, id, and semantic HTML —
 * no data-testid attributes needed (none exist in the codebase).
 */

/* ═══════════════════════════════════════════════════════════════
   SECTION: Content & Visibility
   ═══════════════════════════════════════════════════════════════ */

test.describe('Home page — content & visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('H1 "Afro-Latin Soul in the Heart of Salzburg" is visible', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('Afro-Latin Soul in the Heart of Salzburg');
  });

  test('primary CTA "Visit Us Today" is visible and navigates to /contact', async ({ page }) => {
    const primaryCta = page.locator('a[href="/contact"]', { hasText: 'Visit Us Today' });
    await expect(primaryCta).toBeVisible();

    await primaryCta.click();
    await expect(page).toHaveURL(/\/contact/);
  });

  test('secondary CTA "See Our Menu" navigates to /menu', async ({ page }) => {
    const secondaryCta = page.locator('a[href="/menu"]', { hasText: 'See Our Menu' });
    await expect(secondaryCta).toBeVisible();

    await secondaryCta.click();
    await expect(page).toHaveURL(/\/menu/);
  });

  test('4.8 star review badge is visible', async ({ page }) => {
    // ReviewBadge component uses aria-label containing the rating
    const reviewBadge = page.locator('[aria-label*="4.8"]');
    await expect(reviewBadge).toBeVisible();

    // Verify the numeric rating text
    const ratingText = page.locator('span.font-semibold.text-brand-gold', { hasText: '4.8' });
    await expect(ratingText).toBeVisible();
  });

  test('featured menu section shows "Bestsellers" heading', async ({ page }) => {
    const bestsellersLabel = page.locator('span.text-brand-gold', { hasText: 'Bestsellers' });
    await expect(bestsellersLabel).toBeVisible();

    // The section has an h2 with the featured dishes heading
    const featuredHeading = page.locator('h2', { hasText: 'The Dishes Everyone Comes Back For' });
    await expect(featuredHeading).toBeVisible();
  });

  test('"See Full Menu" CTA links to /menu', async ({ page }) => {
    const fullMenuCta = page.locator('a[href="/menu"]', { hasText: 'See Full Menu' });
    await expect(fullMenuCta).toBeVisible();
  });

  test('Our Story section contains Angela\'s lockdown origin story', async ({ page }) => {
    const storySection = page.locator('section[aria-label="Our Story"]');
    await expect(storySection).toBeVisible();

    // Verify the key narrative text
    await expect(storySection.locator('h2', { hasText: "How D'ouro Began" })).toBeVisible();
    await expect(
      storySection.locator('p', { hasText: /D'ouro started during lockdown/ })
    ).toBeVisible();
  });

  test('Footer contains address "Auerspergstraße 10"', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('address', { hasText: 'Auerspergstraße 10' })).toBeVisible();
  });
});

/* ═══════════════════════════════════════════════════════════════
   SECTION: Navigation Bar
   Desktop-specific nav link click tests only run on desktop,
   since those links are hidden on mobile (md:flex breakpoint).
   ═══════════════════════════════════════════════════════════════ */

test.describe('Home page — NavBar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('NavBar is present with correct aria-label', async ({ page }) => {
    const nav = page.locator('nav[data-nav]');
    await expect(nav).toBeVisible();
    await expect(nav).toHaveAttribute('aria-label', 'Hauptmenü');
  });

  test('brand name "D\'ouro" is visible in NavBar', async ({ page }) => {
    const brand = page.locator('nav[data-nav] span.text-brand-gold.font-display', { hasText: "D'ouro" });
    await expect(brand).toBeVisible();
  });

  test('all desktop nav links are present in DOM', async ({ page }) => {
    const nav = page.locator('nav[data-nav]');

    // Expected nav links (German labels from NavBar defaults)
    const expectedLinks = [
      { label: 'Speisekarte', href: '/menu' },
      { label: 'Catering', href: '/catering' },
      { label: 'Über uns', href: '/about' },
      { label: 'Kontakt', href: '/contact' },
    ];

    for (const link of expectedLinks) {
      const navLink = nav.locator(`a[href="${link.href}"]`, { hasText: link.label }).first();
      await expect(navLink).toBeAttached();
    }
  });

  // Desktop-only: nav links are hidden on mobile (md:flex breakpoint)
  test('desktop nav link to /menu is clickable and navigates', async ({ page, browserName, isMobile }) => {
    test.skip(isMobile, 'Desktop nav links hidden on mobile viewport');

    const menuLink = page.locator('nav[data-nav] a[href="/menu"]', { hasText: 'Speisekarte' }).first();
    await expect(menuLink).toBeVisible();
    await menuLink.click();
    await expect(page).toHaveURL(/\/menu/);
  });

  test('desktop nav link to /contact is clickable and navigates', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop nav links hidden on mobile viewport');

    const contactLink = page.locator('nav[data-nav] a[href="/contact"]', { hasText: 'Kontakt' }).first();
    await expect(contactLink).toBeVisible();
    await contactLink.click();
    await expect(page).toHaveURL(/\/contact/);
  });
});

/* ═══════════════════════════════════════════════════════════════
   SECTION: Mobile-specific tests
   Only run in the "mobile" project (viewport ≤ 768px)
   ═══════════════════════════════════════════════════════════════ */

test.describe('Home page — mobile menu', () => {
  test.skip(({ isMobile }) => !isMobile, 'Mobile-only tests');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hamburger menu button exists on mobile viewport', async ({ page }) => {
    // The mobile menu button is only visible at md: breakpoint and below
    const hamburgerBtn = page.locator('button#mobile-menu-btn');
    await expect(hamburgerBtn).toBeVisible();
    await expect(hamburgerBtn).toHaveAttribute('aria-label', 'Navigationsmenü öffnen');
  });

  test('clicking hamburger opens mobile navigation overlay', async ({ page }) => {
    const hamburgerBtn = page.locator('button#mobile-menu-btn');
    const mobileMenu = page.locator('div#mobile-menu');

    // Initially closed
    await expect(mobileMenu).toHaveAttribute('data-open', 'false');

    // Click to open
    await hamburgerBtn.click();

    // Now open
    await expect(mobileMenu).toHaveAttribute('data-open', 'true');
    await expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'true');

    // Mobile nav links should be visible inside the overlay
    const mobileNav = mobileMenu.locator('nav[aria-label="Mobile Navigation"]');
    await expect(mobileNav).toBeVisible();
  });

  test('mobile navigation links are clickable inside overlay', async ({ page }) => {
    const hamburgerBtn = page.locator('button#mobile-menu-btn');
    await hamburgerBtn.click();

    const mobileMenu = page.locator('div#mobile-menu');
    const menuLink = mobileMenu.locator('a[href="/menu"]', { hasText: 'Speisekarte' });
    await expect(menuLink).toBeVisible();
    await menuLink.click();
    await expect(page).toHaveURL(/\/menu/);
  });

  test('closing hamburger menu restores collapsed state', async ({ page }) => {
    const hamburgerBtn = page.locator('button#mobile-menu-btn');
    const mobileMenu = page.locator('div#mobile-menu');

    // Open
    await hamburgerBtn.click();
    await expect(mobileMenu).toHaveAttribute('data-open', 'true');

    // Close by clicking again
    await hamburgerBtn.click();
    await expect(mobileMenu).toHaveAttribute('data-open', 'false');
    await expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'false');
  });
});

/* ═══════════════════════════════════════════════════════════════
   SECTION: Accessibility (axe-core)
   Runs on both desktop and mobile projects
   ═══════════════════════════════════════════════════════════════ */

test.describe('Home page — accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('zero axe accessibility violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging if any
    if (results.violations.length > 0) {
      console.log(
        'Accessibility violations:',
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

/* ═══════════════════════════════════════════════════════════════
   SECTION: SEO & Meta
   ═══════════════════════════════════════════════════════════════ */

test.describe('Home page — SEO meta tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page has correct title', async ({ page }) => {
    const title = await page.title();
    expect(title).toContain('Afro-Latin');
  });

  test('page has meta description', async ({ page }) => {
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /Brazilian.*African.*Salzburg/);
  });

  test('page has canonical URL', async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', 'https://douro-soulfood.com');
  });

  test('page has Schema.org Restaurant JSON-LD', async ({ page }) => {
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Parse and verify it's valid JSON with Restaurant type
    const content = await jsonLd.first().textContent();
    const parsed = JSON.parse(content!);
    expect(parsed['@type']).toBe('Restaurant');
  });
});
