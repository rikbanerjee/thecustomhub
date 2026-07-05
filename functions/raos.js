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
  const schema = toSchemaOrgProduct(variants[0]);
  const jsonLd = `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
  const withJsonLd = indexHtml.replace("</head>", `${jsonLd}</head>`);

  res.set("Content-Type", "text/html").status(200).send(withJsonLd);
});
