import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage:
    process.env.NODE_ENV === 'development'
      ? { kind: 'local' }
      : { kind: 'cloud' },
  cloud: {
    project: 'dourosoulfood/douro-soulfood',
  },
  collections: {
    // ── Menu Items ──
    // Angela can add/edit/remove items via /keystatic admin.
    // Categories map to the D'ouro menu structure.
    // Price stored in EUR cents (e.g. 1490 = €14.90) to avoid floating-point issues.
    // Using JSON format for compatibility with Astro v6 glob loader.
    menu_items: collection({
      label: 'Menu Items',
      slugField: 'title',
      path: 'src/content/menu-items/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Dish Name', validation: { length: { min: 1 } } } }),
        description: fields.text({
          label: 'Description (German)',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        descriptionEn: fields.text({
          label: 'Description (English)',
          multiline: true,
        }),
        price: fields.integer({
          label: 'Price (EUR cents)',
          validation: { min: 0 },
        }),
        image: fields.image({
          label: 'Dish Photo',
          directory: 'public/images/menu',
          publicPath: '/images/menu',
        }),
        // Optional. When empty, components fall back to the dish title, which is
        // an acceptable alt but describes the NAME rather than the photo. Filling
        // this in ("Feijoada im Tontopf mit Reis und Farofa") is better for
        // screen-reader users and for image search.
        // NOTE: mirrored in src/content.config.ts — the two schemas are
        // hand-synced (see .ai/decisions/keystatic-sync.okf.md).
        imageAlt: fields.text({
          label: 'Dish Photo — Alt Text (German)',
          description: 'Describes what the photo shows. Leave empty to fall back to the dish title.',
        }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Vorspeisen / Entradas', value: 'appetizers' },
            { label: 'Quesadillas', value: 'quesadillas' },
            { label: 'Tacos', value: 'tacos' },
            { label: 'Bowls', value: 'bowls' },
            { label: 'Pratos Feitos', value: 'mains' },
            { label: 'Pratos Do Mar', value: 'seafood' },
            { label: 'Beilagen / Sides', value: 'sides' },
            { label: 'Bebidas', value: 'drinks' },
            { label: 'Sobremesas', value: 'desserts' },
          ],
          defaultValue: 'bowls',
        }),
        subCategory: fields.select({
          label: 'Drink Sub-Category (Bebidas only)',
          options: [
            { label: 'Águas Frescas', value: 'aguas-frescas' },
            { label: 'Cocktails', value: 'cocktails' },
            { label: 'Softdrinks', value: 'softdrinks' },
            { label: 'Cafés', value: 'cafes' },
          ],
          defaultValue: 'softdrinks',
        }),
        dietary: fields.multiselect({
          label: 'Dietary Tags',
          options: [
            { label: 'Vegan', value: 'vegan' },
            { label: 'Vegetarian', value: 'vegetarian' },
            { label: 'Gluten-Free', value: 'gluten-free' },
            { label: 'Spicy', value: 'spicy' },
            { label: 'Halal', value: 'halal' },
            { label: 'Dairy-Free', value: 'dairy-free' },
          ],
        }),
        order: fields.integer({
          label: 'Display Order (lower = first)',
          defaultValue: 0,
          validation: { min: 0 },
        }),
        featured: fields.checkbox({
          label: 'Featured on Homepage',
          defaultValue: false,
        }),
        available: fields.checkbox({
          label: 'Currently Available',
          defaultValue: true,
        }),
        prepTime: fields.text({
          label: 'Prep Time (German)',
        }),
        prepTimeEn: fields.text({
          label: 'Prep Time (English)',
        }),
        allergens: fields.array(
          fields.text({ label: 'Allergen Code' }),
          {
            label: 'Allergens',
            itemLabel: (props) => props.value || 'Allergen',
          }
        ),
        addOns: fields.array(
          fields.object({
            label: fields.text({ label: 'Add-on Label' }),
            price: fields.integer({ label: 'Add-on Price (EUR cents)', validation: { min: 0 } }),
          }),
          {
            label: 'Add-ons',
            itemLabel: (props) => props.fields.label.value || 'Add-on',
          }
        ),
        priceVariants: fields.object(
          {
            nonAlcoholic: fields.integer({ label: 'Non-Alcoholic Price (EUR cents)', validation: { min: 0 } }),
            alcoholic: fields.integer({ label: 'Alcoholic Price (EUR cents)', validation: { min: 0 } }),
          },
          { label: 'Price Variants (alcoholic/non-alcoholic drinks only)' }
        ),
      },
    }),

    // ── FAQ ──
    faq: collection({
      label: 'FAQ',
      slugField: 'question',
      path: 'src/content/faq/*',
      format: { data: 'json' },
      schema: {
        question: fields.slug({ name: { label: 'Question', validation: { length: { min: 1 } } } }),
        answer: fields.text({
          label: 'Answer',
          multiline: true,
          validation: { length: { min: 1 } },
        }),
        order: fields.integer({
          label: 'Display Order',
          defaultValue: 0,
        }),
      },
    }),
  },
  singletons: {
    // ── Site Settings ──
    settings: singleton({
      label: 'Site Settings',
      path: 'src/content/settings/default',
      format: { data: 'json' },
      schema: {
        site_name: fields.text({ label: 'Site Name', validation: { length: { min: 1 } } }),
        tagline: fields.text({ label: 'Tagline' }),
        phone: fields.text({ label: 'Phone' }),
        email: fields.text({ label: 'Email' }),
        address_line1: fields.text({ label: 'Address Line 1' }),
        address_line2: fields.text({ label: 'Address Line 2' }),
        city: fields.text({ label: 'City' }),
        postal_code: fields.text({ label: 'Postal Code' }),
        country: fields.text({ label: 'Country' }),
        google_maps_url: fields.url({ label: 'Google Maps URL' }),
        lieferando_url: fields.url({ label: 'Lieferando Order URL' }),
        logo: fields.image({
          label: 'Logo',
          directory: 'public/images',
          publicPath: '/images',
        }),
        og_image: fields.image({
          label: 'Default OG Image',
          directory: 'public/images',
          publicPath: '/images',
        }),
        social: fields.object({
          label: 'Social Links',
          fields: {
            instagram: fields.url({ label: 'Instagram URL' }),
            facebook: fields.url({ label: 'Facebook URL' }),
            tiktok: fields.url({ label: 'TikTok URL' }),
            tripadvisor: fields.url({ label: 'TripAdvisor URL' }),
          },
        }),
        hours: fields.array(
          fields.object({
            label: 'Hours Entry',
            fields: {
              day: fields.text({ label: 'Day', validation: { length: { min: 1 } } }),
              time: fields.text({ label: 'Hours', validation: { length: { min: 1 } } }),
            },
          }),
          { label: 'Operating Hours', itemLabel: (props) => props.fields.day.value }
        ),
      },
    }),
  },
});
