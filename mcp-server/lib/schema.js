/**
 * Product schema — deliberately lenient. v0's job is "don't corrupt the file
 * and don't make an invalid inventory/status change," not "fully re-validate
 * the Amazon/Walmart feed contracts" (those already validate in the generators).
 *
 * `type` is intentionally a free string, not a fixed enum — site navigation
 * derives categories dynamically from whatever `type` values exist (see root
 * CLAUDE.md). New types are valid; this schema doesn't gatekeep them.
 */
import { z } from 'zod';

export const MarketplaceStatus = z.enum(['active', 'inactive']);

/**
 * Legacy Shopify-export variant. In practice most products' `variants` arrays
 * are padded out to the size of the largest option matrix with placeholder
 * objects where every field is null (see lib/inventory.js for how those get
 * filtered out before anything treats this as real data) — so every field
 * here has to tolerate null, not just be optional.
 */
// Source exports are inconsistent about whether option fields (e.g. a pack
// count like "3") come through as strings or numbers — accept either rather
// than fail validation on a quirk of how the export was produced.
const StringOrNumber = z.union([z.string(), z.number()]).nullable().optional();

const Variant = z
  .object({
    sku: StringOrNumber,
    option1: StringOrNumber,
    option2: StringOrNumber,
    option3: StringOrNumber,
    price: z.number().nullable().optional(),
    compareAtPrice: z.number().nullable().optional(),
    inventoryQty: z.number().int().nullable().optional(),
    variantImg: z.string().nullable().optional(),
  })
  .passthrough();

export const Product = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    vendor: z.string().min(1),
    type: z.string().min(1),
    category: z.string().min(1),
    // ~57/59 products are the legacy Shopify-variant format and carry price
    // on variants[0], not here — see the refine() below.
    price: z.number().nonnegative().optional(),
    description: z.string(),
    images: z.array(z.string()).min(1),
    tags: z.array(z.string()).default([]),
    inStock: z.boolean(),
    stock: z.number().int().nonnegative().optional(),
    variants: z.array(Variant).optional(),
    isCustomizable: z.boolean().optional(),
    marketplace: z
      .object({
        amazon: MarketplaceStatus.optional(),
        walmart: MarketplaceStatus.optional(),
      })
      .partial()
      .optional(),
    amazonData: z.object({}).passthrough().optional(),
    walmartData: z.object({}).passthrough().optional(),
  })
  .passthrough()
  .refine((p) => p.price !== undefined || p.variants?.some((v) => v.price != null), {
    message: 'Product must have either a top-level price or at least one variant with a price',
  });

export const ProductsArray = z.array(Product);

/**
 * Validate the full catalog array. Throws a descriptive error on the first
 * invalid product rather than returning a result object — callers in store.js
 * want a write to fail loudly, not silently skip validation.
 */
export function validateProducts(products) {
  const result = ProductsArray.safeParse(products);
  if (!result.success) {
    const issue = result.error.issues[0];
    const index = issue.path[0];
    const id = typeof index === 'number' ? products[index]?.id : undefined;
    const field = issue.path.slice(1).join('.');
    throw new Error(
      `Catalog validation failed at product${id ? ` "${id}"` : ` index ${index}`}${field ? `: ${field}` : ''} — ${issue.message}`
    );
  }
  return result.data;
}
