/**
 * Track B3/B4 — RetailAgentOS discovery endpoints.
 *
 * Firebase Functions only deploys the contents of this directory
 * (firebase.json: functions.source = "functions"), so this file can't reach
 * up into the repo root at runtime. `raos/`, `vendor/*.tgz`, and
 * `data/products.json` are synced into this directory by
 * `scripts/sync-raos-functions.js`, wired as a `functions.predeploy` hook in
 * firebase.json — the single source of truth stays src/data/products.json
 * and the repo-root raos/adapter.js; this directory only ever holds synced
 * copies, never hand-edited ones.
 */

const { onRequest } = require("firebase-functions/v2/https");
const { buildManifest, toSchemaOrgProduct } = require("@retailagentos/engine");
const { createCustomHubAdapter } = require("./raos/adapter");

const products = require("./data/products.json");
const adapter = createCustomHubAdapter(products);

// ─── ucpManifest — GET /.well-known/ucp ───────────────────────────────────────
exports.ucpManifest = onRequest((req, res) => {
  const manifest = buildManifest(adapter.merchantProfile());
  res.set("Content-Type", "application/json").status(200).send(manifest);
});

/** Strip HTML tags/entities down to plain text for schema.org string fields. */
function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&(?:quot|#34);/gi, '"')
    .replace(/&(?:#39|apos);/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The RAOS engine's `toSchemaOrgProduct` is intentionally agent-facing: it
 * emits only productID/sku/name/offers and omits the SEO-required Product
 * fields (`image` is REQUIRED by Google Rich Results; `description`/`brand`
 * are recommended). It also maps `name` straight from the composed variant
 * title, which for these keyword-stuffed listings overruns Google's 150-char
 * name limit and carries Shopify's meaningless " - Default Title" suffix.
 *
 * This layers the merchant-catalog SEO fields back on without touching the
 * shared adapter/engine (which the MCP server and offer evaluator also use).
 */
function enrichSchemaForSeo(schema, product) {
  const images = (product.images || []).filter(Boolean);
  if (images.length) {
    schema.image = images;
  }

  const description = stripHtml(product.description);
  if (description) {
    // Google truncates long descriptions anyway; keep it well under any cap.
    schema.description = description.slice(0, 5000);
  }

  // Global identifier: no GTIN on custom-printed goods, so publish `brand`,
  // which satisfies Google's "global identifier" recommendation on its own.
  schema.brand = { "@type": "Brand", name: product.vendor || "The CustomHub" };

  // Fix the name: drop Shopify's " - Default Title" no-variant suffix, then
  // keep it under Google's 150-char Product-name limit. These listings are
  // "Primary Name | keyword phrase | keyword phrase" — the segment before the
  // first pipe is the clean product name, so prefer that when it stands on its
  // own; otherwise trim to <=150 chars at a word boundary.
  if (typeof schema.name === "string") {
    let name = schema.name.replace(/\s*-\s*Default Title\s*$/i, "").trim();
    const lead = name.split("|")[0].trim();
    if (lead.length >= 10 && lead.length <= 150) {
      name = lead;
    } else if (name.length > 150) {
      name = name.slice(0, 150).replace(/\s+\S*$/, "").trim();
    }
    schema.name = name;
  }

  const offer = schema.offers;
  if (offer) {
    // Return policy — the real, published terms (src/pages/ReturnPolicy):
    // 15-day window from delivery, US/CA, customer pays return shipping.
    offer.hasMerchantReturnPolicy = {
      "@type": "MerchantReturnPolicy",
      applicableCountry: ["US", "CA"],
      returnPolicyCategory:
        "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 15,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/ReturnShippingFees",
    };

    // Shipping rate — checkout collects a US/CA address but charges no
    // shipping (functions/index.js has no shipping_options), so shipping is
    // free. Stamp $0 on each engine-generated OfferShippingDetails entry.
    if (Array.isArray(offer.shippingDetails)) {
      for (const detail of offer.shippingDetails) {
        detail.shippingRate = {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "USD",
        };
      }
    }
  }

  return schema;
}

// ─── productSchema — GET /product/:productId (crawlable JSON-LD) ─────────────
/**
 * Serves the same SPA shell real browsers get, with a Product+Offer JSON-LD
 * `<script>` injected into `<head>` — so a non-JS crawler/curl sees valid
 * structured data without executing the React app, while a real browser
 * still gets the working SPA underneath it (the injected tag is inert extra
 * markup as far as hydration is concerned).
 *
 * `dist/index.html` is synced alongside the data files by the same predeploy
 * script, right after `npm run build` runs — see B4 note in that script.
 */
exports.productSchema = onRequest((req, res) => {
  const match = req.path.match(/^\/product\/([^/]+)/);
  const productId = match && match[1];

  const indexHtml = require("fs").readFileSync(
    require("path").join(__dirname, "public", "index.html"),
    "utf8"
  );

  const product = productId ? products.find((p) => p.id === productId) : null;

  if (!product) {
    res.set("Content-Type", "text/html").status(404).send(indexHtml);
    return;
  }

  const variants = adapter.toVariants(product);

  // A multi-variant product (sizes/colors) publishes the first variant's
  // offer as the representative JSON-LD — schema.org has no first-class
  // "N variants, pick one" shape at the Product level for this pilot scope.
  const schema = enrichSchemaForSeo(toSchemaOrgProduct(variants[0]), product);
  const jsonLd = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  const withJsonLd = indexHtml.replace("</head>", `${jsonLd}</head>`);

  res.set("Content-Type", "text/html").status(200).send(withJsonLd);
});
