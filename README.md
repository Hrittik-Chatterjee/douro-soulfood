# D'ouro Soulfood Bistro — Website

> Astro 6 + TinaCMS + Cloudflare Pages
> Apple iOS-inspired design system with Brazilian soul warmth

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (TinaCMS + Astro)
npm run dev

# Open browser
# Site:  http://localhost:4321
# CMS:   http://localhost:4321/admin
```

## Stack

| Layer | Tech |
|-------|------|
| Framework | Astro 6 (Node 22+) |
| CMS | TinaCMS (Git-backed) |
| Styling | Tailwind CSS v4 |
| UI Islands | React 19 + Framer Motion |
| Hosting | Cloudflare Pages |
| Design | Aceternity UI-inspired, Apple iOS motion |

## Project Structure

```
docs/           → AI agent docs (prd, design-system, architecture, agent, components)
src/
  components/
    ui/         → Atoms: Button, Card, Badge
    sections/   → Sections: Hero, Gallery, FeatureCard, FAQ
    layout/     → GlassNav, Footer
  content/      → TinaCMS-managed content
  layouts/      → Base layout
  pages/        → Routes
  styles/       → Design tokens & global CSS
tina/           → CMS schema
public/         → Static assets
```

## For AI Agents

**Read `docs/agent.md` first.** It contains all rules for working in this repo.

Key docs for context:
- `docs/prd.md` — What we're building
- `docs/design-system.md` — Visual language (colors, typography, motion)
- `docs/architecture.md` — Technical decisions
- `docs/components.md` — Component API reference

## Deploy

Auto-deploys via Cloudflare Pages on push to `main`.

```bash
npm run build    # Builds TinaCMS + Astro
```

## Design Reference

Structural clone of [talkintacos.net](https://talkintacos.net/) with unique D'ouro design system.

## License

Private — D'ouro Soulfood Bistro
