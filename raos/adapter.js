/**
 * Track B2 — CustomHubAdapter
 *
 * Maps `src/data/products.json` (Shopify-shaped) to the canonical RAOS objects
 * the `@retailagentos/engine` kit understands, per docs/retailagentos/TRACK-B.md
 * §B2. Pure mapping only — no business logic; eligibility/pricing/inventory
 * rules live on the returned Variant objects and are evaluated by the engine's
 * `evaluateOffer`.
 *
 * CommonJS so it loads unmodified from Cloud Functions (functions/index.js)
 * and the Cloud Run MCP server (raos-mcp-server/), both CJS contexts.
 *
 * Consumers pass in the already-loaded `products` array rather than the
 * adapter reading products.json itself — each deployment target (Cloud
 * Functions' restricted `functions/` source dir, Cloud Run's full repo
 * context) loads the file differently, so keeping the adapter pure/injected
 * avoids coupling it to any one deployment's file layout.
 */

const MERCHANT_ID = 'thecustomhub';
const MERCHANT_NAME = 'The CustomHub';
const CURRENCY = 'USD';

/**
 * Countries this pilot ships to (locked decision, TRACK-B.md — CAD/multi-
 * currency is V2). Every product currently carries `shipsTo: ['US','CA']`
 * (see B1); the engine's `checkServesRegion` takes a single flat allowlist
 * per merchant, not a per-variant one — see Open Questions in the Track B
 * report for why a future per-product override in products.json can't yet
 * be enforced through the engine's public surface.
 */
const SERVES_REGIONS = ['US', 'CA'];

/**
 * Capability namespaces that gate which `evaluateOffer` pipeline stages run.
 * These strings are NOT documented anywhere in the shipped `.d.ts` or in
 * TRACK-B.md's API summary — they were recovered by grepping the compiled
 * `dist/index.cjs` bundle for `com.os.retailagent.shopping.*` literals and
 * confirmed empirically (see Open Questions: the kit should export these as
 * named constants instead of leaving integrators to reverse-engineer the
 * bundle).
 */
const RAOS_CAPABILITIES = {
  eligibility: 'com.os.retailagent.shopping.eligibility',
  inventory: 'com.os.retailagent.shopping.inventory',
  pricing: 'com.os.retailagent.shopping.pricing',
  quote: 'com.os.retailagent.shopping.quote',
};

const LOW_STOCK_THRESHOLD = 5;

/** One merchant-level manifest, shared by /.well-known/ucp (B3) and the MCP server (B5). */
function merchantProfile() {
  const capabilityEntries = [
    {
      id: 'eligibility',
      name: 'Eligibility',
      namespace: RAOS_CAPABILITIES.eligibility,
      version: '1.0.0',
      description: 'Region and account-tier eligibility reasoning.',
      required: true,
      tier: 1,
    },
    {
      id: 'inventory',
      name: 'Inventory',
      namespace: RAOS_CAPABILITIES.inventory,
      version: '1.0.0',
      description: 'Real-time stock state (in stock / low stock / out of stock).',
      required: true,
      tier: 1,
    },
    {
      id: 'pricing',
      name: 'Pricing',
      namespace: RAOS_CAPABILITIES.pricing,
      version: '1.0.0',
      description: 'Bulk-tier and promo pricing reasoning.',
      required: false,
      tier: 2,
    },
  ];

  return {
    merchantId: MERCHANT_ID,
    merchantName: MERCHANT_NAME,
    protocolVersion: '1.0.0',
    endpoints: {
      catalog: 'https://thecustomhub.com/.well-known/ucp',
      cart: 'https://thecustomhub.com/cart',
      checkout: 'https://thecustomhub.com/api/createCheckoutSession',
    },
    capabilities: capabilityEntries.map(({ id, name, version, description }) => ({
      id,
      name,
      version,
      description,
    })),
    manifest: {
      protocol: 'RAOS-0000',
      tier: 1,
      capabilities: capabilityEntries,
    },
    servesRegions: SERVES_REGIONS,
  };
}

/** `inStock`/`inventoryQty` -> RAOS InventoryConfig (B2 mapping table). */
function toInventoryConfig(product, variant) {
  const quantityAvailable = variant.inventoryQty ?? 0;
  let state = 'in_stock';
  if (product.inStock === false || quantityAvailable <= 0) {
    state = 'out_of_stock';
  } else if (quantityAvailable <= LOW_STOCK_THRESHOLD) {
    state = 'low_stock';
  }
  return {
    state,
    quantityAvailable,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    reservationPolicy: 'none',
  };
}

/** `variant.compareAtPrice` -> promo baseline ("was $X") per the B2 mapping table. */
function toPromoPricing(variant) {
  const hasPromo =
    typeof variant.compareAtPrice === 'number' && variant.compareAtPrice > variant.price;
  if (!hasPromo) return undefined;
  return {
    available: true,
    salePrice: variant.price,
    description: `Was $${variant.compareAtPrice.toFixed(2)}, now $${variant.price.toFixed(2)}`,
  };
}

function composeTitle(product, variant) {
  const options = [variant.option1, variant.option2, variant.option3].filter(Boolean);
  return options.length ? `${product.title} - ${options.join(' / ')}` : product.title;
}

/**
 * Maps one products.json entry to one or more RAOS Variants.
 *
 * Two source shapes exist in products.json:
 *  - Shopify-style `variants[]` (57 of 59 products) — one Variant per row.
 *    Null-padding rows are stripped in B1 already, so every row here is real.
 *  - Flat top-level `price` with no `variants[]` (2 products) — a single
 *    Variant using the product id as both id and sku.
 */
function toVariants(product) {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.map((variant) => ({
      id: variant.sku,
      sku: variant.sku,
      title: composeTitle(product, variant),
      basePrice: variant.compareAtPrice ?? variant.price,
      currency: CURRENCY,
      callForPrice: Boolean(product.callForPrice),
      promoPricing: toPromoPricing(variant),
      inventory: toInventoryConfig(product, variant),
    }));
  }

  return [
    {
      id: product.id,
      sku: product.id,
      title: product.title,
      basePrice: product.price,
      currency: CURRENCY,
      callForPrice: Boolean(product.callForPrice),
      inventory: toInventoryConfig(product, { inventoryQty: product.inStock ? 999 : 0 }),
    },
  ];
}

/**
 * Builds a MerchantCatalogAdapter<CustomHubProduct> bound to a loaded
 * products array (see module docstring for why the array is injected).
 */
function createCustomHubAdapter(products) {
  const variantToProductId = new Map();
  for (const product of products) {
    for (const variant of toVariants(product)) {
      variantToProductId.set(variant.id, product.id);
    }
  }

  return {
    merchantProfile,
    toVariants,
    listVariants() {
      return products.flatMap(toVariants);
    },
    /**
     * Not part of MerchantCatalogAdapter — a convenience the interface's
     * generic typing doesn't preclude. The engine's `Variant` type has no
     * field for source category/taxonomy data (see Open Questions), so
     * category lookups for MCP catalog browsing go through this side map
     * instead of living on the Variant itself.
     */
    findProductIdForVariant(variantId) {
      return variantToProductId.get(variantId) ?? null;
    },
  };
}

/**
 * BuyerContextResolver: translates agent-supplied region/fulfillment claims
 * into a PartialBuyerContext. Region *eligibility* is intentionally NOT
 * decided here — callers run `checkServesRegion(SERVES_REGIONS, region)`
 * themselves before/alongside `evaluateOffer` (see TRACK-B.md B2 note).
 */
function createBuyerContextResolver() {
  return {
    resolve({ region, fulfillmentMode } = {}) {
      return {
        customerType: 'guest',
        membershipTier: 'none',
        marketRegion: (region || 'US').toUpperCase(),
        fulfillmentMode: fulfillmentMode || 'shipping',
        accountLinked: false,
        taxExempt: false,
        resaleCertificateOnFile: false,
      };
    },
  };
}

module.exports = {
  SERVES_REGIONS,
  RAOS_CAPABILITIES,
  createCustomHubAdapter,
  createBuyerContextResolver,
};
