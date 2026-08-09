/**
 * nav.ts — the primary 4-item site navigation, defined once.
 *
 * `NavBar.astro` and `Footer.astro` each defaulted their own `links` prop to
 * an independently hand-typed copy of the same 4 items — a real duplication,
 * not a stylistic one: `NavBar`'s default is also what `MobileNavDrawer`
 * renders, since `NavBar` passes its own `links` through as a prop. A locale
 * string can only be translated correctly once if it's only typed once.
 *
 * `NAV_LINKS` is the shared 3 of 4 items. "Catering" (NavBar) vs "Catering &
 * Events" (Footer) is a genuine, pre-existing content difference — kept as an
 * explicit per-consumer override below rather than silently collapsed to one
 * wording, since which is correct is a copy decision, not a code one.
 */

export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Speisekarte', href: '/menu' },
  { label: 'Catering', href: '/catering' },
  { label: 'Über uns', href: '/about' },
  { label: 'Kontakt', href: '/contact' },
] as const;

/** Footer's one deliberate wording override — see the module comment above. */
export const FOOTER_NAV_LINKS: readonly NavLink[] = NAV_LINKS.map((link) =>
  link.href === '/catering' ? { ...link, label: 'Catering & Events' } : link,
);
