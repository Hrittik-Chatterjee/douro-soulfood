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

  test('H1 "Afro-Latin Soul im Herzen von Salzburg" is visible', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText("Afro-Latin Soul im Herzen von Salzburg");
  });

  // Desktop-only: hero CTAs live in a `hidden md:flex` container, not shown on mobile
  test('primary CTA "Besuchen Sie uns" is visible and navigates to /contact', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Hero CTAs hidden on mobile viewport');

    const primaryCta = page.locator('a[href="/contact"]', { hasText: 'Besuchen Sie uns' });
    await expect(primaryCta).toBeVisible();

    await primaryCta.click();
    await expect(page).toHaveURL(/\/contact/);
  });

  test('secondary CTA "Speisekarte ansehen" navigates to /menu', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Hero CTAs hidden on mobile viewport');

    const secondaryCta = page.locator('a[href="/menu"]', { hasText: 'Speisekarte ansehen' });
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

  test('featured dishes section shows "Empfehlungen" heading', async ({ page }) => {
    const eyebrow = page.locator('section[aria-label="Beliebte Gerichte"] span.text-brand-gold', { hasText: 'Empfehlungen' });
    await expect(eyebrow).toBeVisible();

    const featuredHeading = page.locator('h2', { hasText: "Beliebte Gerichte im D'ouro Bistro" });
    await expect(featuredHeading).toBeVisible();
  });

  test('"Komplette Speisekarte ansehen" CTA links to /menu', async ({ page }) => {
    const fullMenuCta = page.locator('a[href="/menu"]', { hasText: 'Komplette Speisekarte ansehen' });
    await expect(fullMenuCta).toBeVisible();
  });

  test('Unsere Geschichte section contains Angela\'s lockdown origin story', async ({ page }) => {
    const storySection = page.locator('section[aria-label="Unsere Geschichte"]');
    await expect(storySection).toBeVisible();

    // Verify the key narrative text
    await expect(storySection.locator('h2', { hasText: "Wie D'ouro begann" })).toBeVisible();
    await expect(
      storySection.locator('p', { hasText: /D'ouro begann während des Lockdowns/ })
    ).toBeVisible();
  });

  test('Footer contains address "Auerspergstraße 10"', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('address', { hasText: 'Auerspergstraße 10' })).toBeVisible();
  });

  test('skip-to-main-content link is focusable and targets #main-content', async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveClass(/sr-only/);

    await skipLink.focus();
    await expect(skipLink).toBeVisible();

    const main = page.locator('main#main-content');
    await expect(main).toBeAttached();
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

  test('brand logo is visible in NavBar', async ({ page }) => {
    // NavBar renders only a logo image, no text brand name span
    const logo = page.locator('nav[data-nav] img[alt="D\'ouro Soulfood Logo"]');
    await expect(logo).toBeVisible();
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
    const mobileNav = mobileMenu.locator('nav[aria-label="Mobile Navigation Drawer"]');
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

  test('closed drawer is inert and hidden from assistive tech', async ({ page }) => {
    const mobileMenu = page.locator('div#mobile-menu');
    await expect(mobileMenu).toHaveAttribute('aria-hidden', 'true');
    await expect(mobileMenu).toHaveJSProperty('inert', true);
  });

  test('opening the drawer clears inert/aria-hidden and updates the hamburger label', async ({ page }) => {
    const hamburgerBtn = page.locator('button#mobile-menu-btn');
    const mobileMenu = page.locator('div#mobile-menu');

    await hamburgerBtn.click();

    await expect(mobileMenu).toHaveAttribute('aria-hidden', 'false');
    await expect(mobileMenu).toHaveJSProperty('inert', false);
    await expect(hamburgerBtn).toHaveAttribute('aria-label', 'Navigationsmenü schließen');
  });

  test('Escape key closes the open drawer and returns focus to the hamburger', async ({ page }) => {
    const hamburgerBtn = page.locator('button#mobile-menu-btn');
    const mobileMenu = page.locator('div#mobile-menu');

    await hamburgerBtn.click();
    await expect(mobileMenu).toHaveAttribute('data-open', 'true');

    await page.keyboard.press('Escape');

    await expect(mobileMenu).toHaveAttribute('data-open', 'false');
    await expect(hamburgerBtn).toBeFocused();
  });
});

/* ═══════════════════════════════════════════════════════════════
   SECTION: Google Maps consent gate (MapEmbed.astro)
   ═══════════════════════════════════════════════════════════════ */

test.describe('Home page — Google Maps consent gate', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('no Google Maps iframe is present before consent', async ({ page }) => {
    const mapEmbed = page.locator('[data-map-embed]');
    await expect(mapEmbed).toBeVisible();
    await expect(mapEmbed.locator('iframe')).toHaveCount(0);
  });

  test('clicking "Karte anzeigen" loads the Google Maps iframe', async ({ page }) => {
    const mapEmbed = page.locator('[data-map-embed]');
    await mapEmbed.getByRole('button', { name: 'Karte anzeigen' }).click();

    const iframe = mapEmbed.locator('iframe');
    await expect(iframe).toHaveCount(1);
    await expect(iframe).toHaveAttribute('src', /maps\.google\.com/);
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
    expect(title).toContain('Afro-Lateinamerikanische');
  });

  test('page has meta description', async ({ page }) => {
    const metaDesc = page.locator('meta[name="description"]');
    await expect(metaDesc).toHaveAttribute('content', /brasilianische.*afrikanische.*Salzburg/);
  });

  test('page has canonical URL', async ({ page }) => {
    const canonical = page.locator('link[rel="canonical"]');
    // Trailing slash: build.format is 'directory', so Astro, the sitemap <loc>
    // and the JSON-LD `url` all emit this form. The homepage used to hand-set
    // the slashless variant, leaving one page advertising three URLs for itself.
    await expect(canonical).toHaveAttribute('href', 'https://douro-soulfood.com/');
  });

  test('page declares exactly one JSON-LD block', async ({ page }) => {
    // One @graph per page is an invariant, not an accident: it keeps the
    // Restaurant entity single-sourced and bounds the CSP hash count.
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
  });

  test('JSON-LD @graph describes the restaurant, the page and the FAQ', async ({ page }) => {
    const content = await page.locator('script[type="application/ld+json"]').first().textContent();
    const parsed = JSON.parse(content!);

    expect(Array.isArray(parsed['@graph'])).toBe(true);
    const byType = (type: string) =>
      parsed['@graph'].find((node: { '@type': string }) => node['@type'] === type);

    // One canonical Restaurant entity, referenced by @id from the other nodes
    // rather than redeclared per page (which is what used to happen).
    const restaurant = byType('Restaurant');
    expect(restaurant).toBeDefined();
    expect(restaurant['@id']).toBe('https://douro-soulfood.com/#restaurant');
    expect(restaurant.telephone).toBeTruthy();
    expect(restaurant.address['@type']).toBe('PostalAddress');

    // Opening hours are derived from the CMS via src/lib/hours.ts — German day
    // labels mapped to schema.org DayOfWeek IRIs.
    expect(restaurant.openingHoursSpecification.length).toBeGreaterThan(0);
    expect(restaurant.openingHoursSpecification[0].dayOfWeek[0]).toContain('schema.org/');

    expect(byType('WebSite')).toBeDefined();
    expect(byType('WebPage').about['@id']).toBe(restaurant['@id']);

    // FAQPage mirrors the visible accordion, one entry per Q&A.
    const faq = byType('FAQPage');
    expect(faq).toBeDefined();
    expect(faq.mainEntity.length).toBeGreaterThan(0);
    expect(faq.mainEntity[0]['@type']).toBe('Question');

    // The homepage deliberately has NO breadcrumb: a single-item trail is noise.
    expect(byType('BreadcrumbList')).toBeUndefined();
  });

  test('social preview image declares dimensions and alt text', async ({ page }) => {
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /.+/);
  });

  test('document language is Austrian German', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('lang', 'de-AT');
  });
});
