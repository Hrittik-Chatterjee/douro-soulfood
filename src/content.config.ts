import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content Collection Config — D'ouro Soulfood Bistro
 *
 * Astro v6 uses the new content collections API:
 *   - Config file: src/content.config.ts (NOT src/content/config.ts)
 *   - Each collection needs an explicit loader (glob for file-based)
 *   - Schema uses zod for validation
 *
 * KeystaticCMS has its own schema (keystatic.config.ts), but Astro
 * needs this file for type-safe getCollection() queries.
 * Both schemas must stay in sync.
 */

const menuItems = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/menu-items' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    descriptionEn: z.string().optional(),
    price: z.number().min(0),
    image: z.string().nullable().optional(),
    /**
     * Alt text for `image`. Optional — consumers fall back to `title`.
     * Mirrored in keystatic.config.ts; the two schemas are hand-synced.
     */
    imageAlt: z.string().nullable().optional(),
    category: z.enum([
      'appetizers',
      'quesadillas',
      'tacos',
      'bowls',
      'mains',
      'seafood',
      'sides',
      'drinks',
      'desserts',
    ]),
    subCategory: z.enum(['aguas-frescas', 'cocktails', 'softdrinks', 'cafes']).optional(),
    dietary: z.array(
      z.enum(['vegan', 'vegetarian', 'gluten-free', 'spicy', 'halal', 'dairy-free'])
    ).optional(),
    allergens: z.array(z.string()).optional(),
    prepTime: z.string().optional(),
    prepTimeEn: z.string().optional(),
    addOns: z.array(z.object({
      label: z.string(),
      price: z.number(),
    })).optional(),
    priceVariants: z.object({
      nonAlcoholic: z.number().optional(),
      alcoholic: z.number().optional(),
    }).optional(),
    order: z.number().min(0).default(0),
    featured: z.boolean().default(false),
    available: z.boolean().default(true),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    order: z.number().default(0),
  }),
});

export const collections = {
  'menu_items': menuItems,
  'faq': faq,
};
