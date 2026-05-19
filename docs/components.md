# Components Reference

> API docs for all components in the D'ouro Soulfood design system.

---

## UI Atoms

### Button
**File:** `src/components/ui/Button.astro`
**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| href | string | - | Link destination |
| variant | 'primary' \| 'secondary' \| 'ghost' | 'primary' | Visual style |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size variant |
| arrow | boolean | false | Show animated arrow icon |
| class | string | '' | Additional classes |

**Variants:**
- `primary` — Gold fill, dark text, glow hover
- `secondary` — Transparent, border, hover fill
- `ghost` — No border, text-only, underline hover

---

### Card
**File:** `src/components/ui/Card.astro`
**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'glass' \| 'elevated' | 'default' | Surface style |
| padding | 'none' \| 'sm' \| 'md' \| 'lg' | 'md' | Internal padding |
| hover | boolean | true | Enable hover lift |
| class | string | '' | Additional classes |

---

### Badge
**File:** `src/components/ui/Badge.astro`
**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'gold' \| 'green' \| 'neutral' | 'neutral' | Color variant |
| size | 'sm' \| 'md' | 'sm' | Size |

**Use:** Dietary tags (Vegan, Gluten-free), price badges, status indicators.

---

## Section Components

### HeroCarousel
**File:** `src/components/sections/HeroCarousel.tsx`
**Type:** React island (`client:visible`)
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| images | { src: string; alt: string }[] | Carousel images |
| headline | string | Main heading |
| subheadline | string | Supporting text |
| cta_primary | { label: string; href: string } | Primary CTA |
| cta_secondary | { label: string; href: string } | Secondary CTA |
| interval | number | Auto-advance ms (default 8000) |

---

### FoodGallery
**File:** `src/components/sections/FoodGallery.tsx`
**Type:** React island (`client:idle`)
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| images | { src: string; alt: string }[] | Gallery images |
| title | string | Section title |
| subtitle | string | Section subtitle |
| columns | 2 \| 3 | Grid columns on desktop |

---

### FeatureCard
**File:** `src/components/sections/FeatureCard.astro`
**Type:** Astro (zero JS)
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| title | string | Card heading |
| description | string | Body text |
| image | { src: string; alt: string } | Feature image |
| cta | { label: string; href: string } | Action button |
| reverse | boolean | Flip image/text order |
| background_image | string | Optional full-bleed bg |

---

### MenuScroll
**File:** `src/components/sections/MenuScroll.tsx`
**Type:** React island (`client:visible`)
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| items | MenuItem[] | Menu items to display |
| title | string | Section title |
| view_menu_href | string | Link to full menu |

```ts
interface MenuItem {
  name: string;
  image: string;
  href: string;
  price?: string;
}
```

---

### FAQAccordion
**File:** `src/components/sections/FAQAccordion.tsx`
**Type:** React island (`client:idle`)
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| title | string | Section heading |
| items | { question: string; answer: string }[] | FAQ items |

---

### LocationCard
**File:** `src/components/sections/LocationCard.astro`
**Type:** Astro (zero JS)
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| name | string | Restaurant name |
| address | string[] | Address lines |
| phone | string | Phone number |
| email | string | Email |
| hours | { day: string; time: string }[] | Operating hours |
| map_url | string | Google Maps link |
| order_url | string | Online order link |

---

## Layout Components

### GlassNav
**File:** `src/components/layout/GlassNav.astro`
**Behavior:** Sticky top, transparent → glass on scroll (via IntersectionObserver)
**Slots:** Default slot for custom CTA

### Footer
**File:** `src/components/layout/Footer.astro`
**Slots:** None — pulls from site settings

### SEOHead
**File:** `src/components/layout/SEOHead.astro`
**Props:**
| Prop | Type | Description |
|------|------|-------------|
| title | string | Page title |
| description | string | Meta description |
| image | string | OG image URL |
| canonical | string | Canonical URL |
| type | 'website' \| 'article' | OG type |

---

## Utility: cn()

**File:** `src/lib/utils.ts`
```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Use `cn()` in all components for class merging. It handles Tailwind class conflicts automatically.
