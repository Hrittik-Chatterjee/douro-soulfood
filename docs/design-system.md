# Design System: D'ouro Soulfood

> **Version:** 0.1.0
> **Design DNA:** Apple iOS device aesthetic + Brazilian soul warmth
> **Reference:** Systematic clone of talkintacos.net structure with unique visual identity

---

## 1. Design Philosophy

**"Warm Precision"** — Apple's spatial clarity meets Brazilian sensory warmth. Every interaction should feel as polished as an iOS app but as inviting as Angela's cooking.

### Principles
1. **Glass over solid** — Prefer glassmorphism surfaces over opaque backgrounds
2. **Motion is meaning** — Every animation communicates, never decorates
3. **Warm contrast** — Dark surfaces with gold/terracotta accents create appetite
4. **Generous space** — iOS-level whitespace, never cramped
5. **One hero per section** — Every section has one focal point

---

## 2. Color Palette

### Brand Colors (OKLCH Definitions)
```
Terracotta (Primary CTA):   oklch(0.52 0.13 24)   — Earthy rust red for CTAs and highlights
Terracotta Light (Hover):   oklch(0.63 0.12 24)
Terracotta Dark (Pressed):  oklch(0.38 0.12 22)
Gold (Secondary CTA):       oklch(0.68 0.14 70)   — Honey gold for secondary highlights
Gold Light (Hover):         oklch(0.78 0.12 70)
Gold Dark (Pressed):        oklch(0.53 0.12 68)
Forest (Fresh/Vegan):       oklch(0.35 0.07 152)  — Fresh olive/forest green
Sage (Green labels):        oklch(0.65 0.07 140)
Espresso (Dark Neutral):    oklch(0.14 0.03 40)   — Near-black warm espresso tone
Cream (Warm Neutral):       oklch(0.95 0.015 80)  — Soothing warm cream tone
```

### Surface System (Light Theme — Default)
```
Primary Surface:     oklch(0.98 0.005 80)    — Soothing warm cream page background
Elevated Surface:    oklch(0.95 0.01 80)     — Deeper cream for navbars, footers, etc.
Card Surface:        oklch(1.0 0.002 80)     — Soft warm-tinted white for component containers
Glass Surface:       oklch(1.0 0.002 80 / 0.72) — Frosted glass with backdrop blur
```

### Text Hierarchy
```
Primary Text:        oklch(0.20 0.02 40)     — Dark espresso/charcoal for soft high contrast
Secondary Text:      oklch(0.42 0.02 45)     — Medium-dark warm grey for secondary descriptions
Tertiary Text:       oklch(0.58 0.015 50)    — Muted warm grey for captions and footnotes
Inverse Text:        oklch(0.98 0.005 80)    — Soft cream white for text inside dark CTAs
Brand Text:          oklch(0.48 0.12 24)     — Deep terracotta for legible brand text accents
```

### Borders
```
Subtle:              oklch(0.20 0.02 40 / 0.06) — 6% opacity dark neutral
Default:             oklch(0.20 0.02 40 / 0.10) — 10% opacity dark neutral
Emphasis:            oklch(0.20 0.02 40 / 0.20) — 20% opacity dark neutral
```

---

## 3. Typography

### Font Stack
- **Display:** `'SF Pro Display', 'Inter', system-ui, sans-serif`
- **Body:** `'SF Pro Text', 'Inter', system-ui, sans-serif`
- **Mono:** `'SF Mono', 'Fira Code', monospace`

> **Web fallback:** Load Inter from Google Fonts as the web-safe fallback.
> SF Pro is Apple-native and renders on macOS/iOS; Inter covers all other platforms.

### Scale
| Name | Size | Weight | Use |
|------|------|--------|-----|
| Hero | clamp(2.5rem, 6vw, 4.5rem) | 700 | Hero headlines |
| Title 2XL | clamp(2rem, 4vw, 3rem) | 600 | Section titles |
| Title XL | clamp(1.5rem, 3vw, 2.25rem) | 600 | Card titles |
| Title LG | 1.5rem | 600 | Sub-section |
| Title Base | 1.25rem | 600 | Card headers |
| Body LG | 1.125rem | 400 | Lead paragraphs |
| Body | 1rem | 400 | Default text |
| Body SM | 0.875rem | 400 | Meta, captions |
| Caption | 0.75rem | 500 | Labels, tags |

### Rules
- **Tracking:** -0.02em on titles, normal on body
- **Line height:** 1.2 on titles, 1.6 on body
- **Max width:** 65ch on body text
- **Gold gradient text** class `.text-gradient-gold` for brand moments

---

## 4. Spacing & Layout

### Section Spacing
- Desktop: 120px vertical padding
- Mobile: 72px vertical padding

### Content Max Width
- `max-w-7xl` (1280px) for content sections
- Full-bleed for hero, galleries, feature backgrounds

### Grid
- Mobile: 1 column
- Tablet (md): 2 columns
- Desktop (lg): 3 columns
- Gallery: 2col mobile, 3col desktop

### iOS-like Container
```css
padding: 0 max(1rem, env(safe-area-inset-left));
```

---

## 5. Border Radius

Following Apple's nested corner radius pattern:
```
XS:    6px   — Small chips, tags
SM:    10px  — Buttons, inputs
MD:    14px  — Cards, dropdowns
LG:    20px  — Feature cards, modals
XL:    28px  — Hero cards, galleries
2XL:   40px  — Full-page overlays
Full:  9999px — Avatars, pills
```

**Rule:** Inner radius = Outer radius - padding

---

## 6. Shadows

iOS-inspired depth system:
```
XS:    0 1px 2px rgba(0,0,0,0.3)      — Subtle lift
SM:    0 2px 8px rgba(0,0,0,0.25)      — Cards
MD:    0 4px 16px rgba(0,0,0,0.3)      — Dropdowns
LG:    0 8px 32px rgba(0,0,0,0.35)     — Modals
XL:    0 16px 48px rgba(0,0,0,0.4)     — Hero overlays

Glow Gold:       0 0 40px rgba(200,145,58,0.15)
Glow Terracotta: 0 0 40px rgba(181,85,58,0.12)
```

---

## 7. Motion & Animation

### Easing Curves
```
Spring:    cubic-bezier(0.22, 1, 0.36, 1)   — Default for most
Smooth:    cubic-bezier(0.4, 0, 0.2, 1)     — Subtle transitions
Bounce:    cubic-bezier(0.34, 1.56, 0.64, 1) — Playful interactions
```

### Durations
```
Fast:      200ms   — Hover, focus states
Normal:    350ms   — Transitions, reveals
Slow:      500ms   — Page transitions, morphs
Entrance:  700ms   — First paint reveals
```

### Aceternity-Inspired Patterns
1. **Fade Up on Scroll** — Elements fade in from 24px below with staggered delays
2. **Hero Parallax** — Background image moves at 0.5x scroll speed
3. **Card Hover Lift** — translateY(-4px) + shadow expansion on hover
4. **Image Zoom** — scale(1.04) on hover within overflow-hidden container
5. **Glass Blur Nav** — backdrop-filter: blur(40px) saturate(180%) on scroll
6. **Stagger Children** — 80ms delay between sibling animations
7. **Text Reveal** — Clip-path or opacity reveal for hero text
8. **Button Arrow Slide** — Arrow icon slides in from left on hover (from talkintacos.net)

### Framer Motion Config (for React islands)
```tsx
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } }
};
```

---

## 8. Components Library

### From talkintacos.net (Remapped)

| TalkinTacos Component | D'ouro Component | Notes |
|----------------------|------------------|-------|
| `mercury-ui-primary` surfaces | `surface-primary` | Dark: #0A0A0A |
| `mercury-ui-button-primary` | `btn-primary` | Gold fill, dark text |
| `mercury-ui-control` radius | `radius-sm` | 10px |
| Gallery grid | `FoodGallery` | Lightbox + zoom |
| Hero carousel | `HeroCarousel` | Parallax + gradient |
| Split feature card | `FeatureCard` | Glass blur bg |
| Menu scroll | `MenuScroll` | Horizontal snap scroll |
| Location card | `LocationCard` | Map + hours + CTA |
| FAQ accordion | `FAQAccordion` | Smooth expand |
| Nav sticky | `GlassNav` | Blur on scroll |

### Aceternity-Inspired Custom Components

| Component | Description |
|-----------|-------------|
| `SpotlightCard` | Card with mouse-following radial gradient spotlight |
| `TextReveal` | Text that reveals on scroll with blur transition |
| `BentoGrid` | Asymmetric grid with varying card sizes |
| `FloatingDock` | iOS-style floating action bar |
| `GlowBorder` | Card with animated gradient border |
| `ParallaxScroll` | Multi-layer parallax image section |
| `AnimatedTabs` | Smooth tab switching with indicator animation |
| `InfiniteMarquee` | Auto-scrolling text/image strip |

---

## 9. Iconography

- **Icon set:** Lucide React (consistent, clean, MIT license)
- **Size:** 20px default, 16px compact, 24px feature
- **Stroke:** 1.5px (matches iOS)
- **Color:** Inherits text color via `currentColor`

---

## 10. Image Guidelines

- **Hero images:** 1920×1080 minimum, food photography, warm tones
- **Gallery:** Square aspect ratio (1:1), 810px min
- **Menu items:** 320×320 thumbnails, high saturation
- **Format:** WebP primary, AVIF where supported, JPEG fallback
- **Treatment:** Slight warm overlay (+5% orange in post-processing)
- **Loading:** Blur placeholder → lazy load → fade in
