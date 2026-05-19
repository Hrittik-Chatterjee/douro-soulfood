# Agent Instructions: D'ouro Soulfood

> **Read this file FIRST before any code changes.**
> This file tells AI coding agents (Claude Code, Cursor, Copilot, Gemini CLI) how to work in this repo.

---

## Project Identity

**What:** Restaurant website for D'ouro Soulfood Bistro, Salzburg, Austria
**Stack:** Astro 6 + Tailwind CSS v4 + Cloudflare Pages
**Design:** Apple iOS-inspired dark theme with Brazilian gold warmth
**Reference site:** https://talkintacos.net (structural clone, unique design system)

---

## File Map

```
docs/
  prd.md              → Product requirements (READ for scope)
  design-system.md    → Colors, typography, motion, components (READ for styling)
  architecture.md     → Technical architecture decisions
  components.md       → Component API reference
  agent.md            → THIS FILE

src/
  components/
    ui/               → Reusable atoms: Button, Card, Badge, Input
    sections/          → Page sections: Hero, Gallery, FeatureCard, FAQ
    layout/            → Nav, Footer, SEO
  content/
    pages/             → Markdown content
  layouts/
    Base.astro         → Root layout with <head>, fonts, global CSS
  pages/
    index.astro        → Home page (assembles sections)
    menu.astro         → Menu page
    about.astro        → About page
    catering.astro     → Catering page
    contact.astro      → Contact page
  styles/
    global.css         → Design tokens, base styles, utilities

public/
  fonts/               → Self-hosted fonts (if needed)
  images/              → Static images, logo, favicon
```

---

## Critical Rules

### 1. Design System Compliance
- **ALWAYS** use CSS custom properties from `src/styles/global.css`
- **NEVER** hardcode colors — use `var(--color-douro-gold)` etc.
- **ALWAYS** use the radius scale: `rounded-[var(--radius-md)]` or Tailwind classes
- **ALWAYS** use the easing curves: `transition: all var(--duration-normal) var(--ease-spring)`

### 2. Astro 6 Patterns
- Default to `.astro` components (zero JS shipped)
- Use React (`client:visible`) ONLY for interactive components: carousel, lightbox, menu filters, animations
- Never use `client:load` — always `client:visible` or `client:idle`
- Use Astro's built-in `<Image />` component for all images
- Use content collections for CMS-managed data
- Node 22+ required — do NOT use APIs deprecated before Node 22

### 3. Styling Rules
- Tailwind v4 utility classes preferred
- Custom CSS only for complex animations or design tokens
- Mobile-first: always write base styles for mobile, then `md:` and `lg:`
- Light theme is DEFAULT — eye-soothing warm cream surfaces with high-contrast espresso text
- Glass effects via `.glass` utility class

### 4. Component Architecture
- Astro components for static sections
- React components for interactive UI (wrapped in Astro islands)
- Props interface typed with TypeScript
- Every component gets a `class` prop for external styling
- Use `clsx` + `tailwind-merge` via `cn()` utility for class composition

### 5. Performance
- No external fonts CDN in production — self-host or use Astro Fonts API
- Images: always specify width/height, use `loading="lazy"` except hero
- Inline critical CSS, defer non-critical
- Target < 100KB total JS (Astro islands keep this easy)
- Use `<link rel="preload">` for hero image

### 6. Accessibility
- Semantic HTML always (nav, main, section, article, footer)
- ARIA labels on interactive elements
- Focus-visible styles on all interactive elements
- Color contrast 4.5:1 minimum (gold on dark passes)
- Reduced motion: respect `prefers-reduced-motion`

---

## Component Patterns

### Button
```astro
<a class="group relative flex items-center justify-center rounded-[var(--radius-sm)]
  bg-[var(--color-douro-gold)] text-[var(--color-douro-espresso)]
  font-semibold px-6 py-3
  transition-all duration-[var(--duration-normal)] ease-[var(--ease-spring)]
  hover:bg-[var(--color-douro-gold-light)] hover:shadow-[var(--shadow-glow-gold)]">
  <span>Order Online</span>
  <svg class="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1">...</svg>
</a>
```

### Glass Card
```astro
<div class="glass rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-md)]">
  <slot />
</div>
```

### Section Container
```astro
<section class="py-[var(--space-section-mobile)] md:py-[var(--space-section)] px-4 md:px-8 max-w-7xl mx-auto">
  <slot />
</section>
```

---

## Git Conventions

- **Commits:** `feat:`, `fix:`, `style:`, `docs:`, `refactor:`
- **Branch:** `main` (production), `dev` (staging)
- **PR titles:** Match commit convention

---

## Deployment

```bash
# Local dev
npm run dev          # Astro dev server

# Build
npm run build        # Astro build

# Deploy
# Auto-deploys via Cloudflare Pages on push to main
```

---

## When In Doubt

1. Check `docs/design-system.md` for visual decisions
2. Check `docs/prd.md` for scope/feature questions
3. Check talkintacos.net for structural reference
4. Prefer Astro-native solutions over npm packages
5. Keep it minimal — this is a restaurant site, not a SaaS
