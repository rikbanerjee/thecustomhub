/**
 * Normalizes the two real product shapes in products.json into one
 * consistent view for inventory tools:
 *
 *  - "simple" format (2/59 products today): top-level `price`, optional
 *    top-level `stock`.
 *  - legacy Shopify-export format (57/59 products): no top-level `price`;
 *    price + quantity live on `variants[]`, which is typically padded out
 *    to the size of the largest option matrix with placeholder objects
 *    where every field is null. Those placeholders are not real variants
 *    and must be filtered out before anything counts or lists them.
 *
 * This is the same duality `src/utils/dataHelpers.js` already normalizes
 * for the live site (see `getProductPrice` / variant handling there) — this
 * module is the MCP server's equivalent, kept standalone so the server has
 * no import-time dependency on browser-facing code.
 */

/** A variant placeholder has every meaningful field null — filter those out. */
function isRealVariant(v) {
  return v && (v.sku != null || v.price != null || v.inventoryQty != null || v.option1 != null);
}

export function getRealVariants(product) {
  return (product.variants || []).filter(isRealVariant);
}

export function getEffectivePrice(product) {
  if (product.price !== undefined) return product.price;
  const real = getRealVariants(product);
  return real.find((v) => v.price != null)?.price ?? null;
}

/** Human-readable label for a variant, e.g. "Black / M", falling back to its SKU. */
export function variantLabel(variant) {
  const parts = [variant.option1, variant.option2, variant.option3].filter(Boolean);
  if (parts.length > 0) return parts.join(' / ');
  return variant.sku || 'Default';
}

/**
 * Summarize a product's stock situation into one of three shapes so callers
 * (update_inventory, list_low_stock) don't each have to re-derive this:
 *
 *  - { mode: 'simple', value: number|null }
 *      top-level `stock` field exists (or doesn't — value is null), no variants.
 *  - { mode: 'single-variant', value: number|null, variant }
 *      exactly one real variant — treat it like a simple numeric stock.
 *  - { mode: 'multi-variant', variants: [{ label, sku, inventoryQty }] }
 *      more than one real variant — caller must address a specific one.
 *  - { mode: 'boolean-only' }
 *      no numeric data anywhere; only `inStock` can be toggled.
 */
export function summarizeStock(product) {
  const real = getRealVariants(product);

  if (real.length === 0) {
    if (product.stock !== undefined) return { mode: 'simple', value: product.stock };
    return { mode: 'boolean-only' };
  }

  if (real.length === 1) {
    return { mode: 'single-variant', value: real[0].inventoryQty ?? null, variant: real[0] };
  }

  return {
    mode: 'multi-variant',
    variants: real.map((v) => ({ label: variantLabel(v), sku: v.sku ?? null, inventoryQty: v.inventoryQty ?? null })),
  };
}

/**
 * Find a specific real variant by SKU or by its human label (case-insensitive).
 * Returns null if not found or ambiguous-free — callers decide how to handle "not found".
 */
export function findVariant(product, skuOrLabel) {
  const real = getRealVariants(product);
  const needle = skuOrLabel.toLowerCase();
  return (
    real.find((v) => v.sku && v.sku.toLowerCase() === needle) ||
    real.find((v) => variantLabel(v).toLowerCase() === needle) ||
    null
  );
}
