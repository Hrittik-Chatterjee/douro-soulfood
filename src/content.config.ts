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
    price: z.number().min(0),
    image: z.string().optional(),
    category: z.enum([
      'tacos',
      'bowls',
      'african-specials',
      'sides',
      'drinks',
    ]),
    dietary: z.array(
      z.enum(['vegan', 'vegetarian', 'gluten-free', 'spicy', 'halal', 'dairy-free'])
    ).optional(),
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
