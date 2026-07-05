# Track B — Post-Integration Evidence (After RetailAgentOS Integration)

Captured: 2026-07-05, re-running the identical 10-task set from `before.md` against the
**built and locally-verified** Track B0-B5 code (commits through B5). Every result below was
produced by actually invoking the real code — the adapter, the engine, the Cloud Functions
handlers, and the Cloud Run MCP server — not by inspection or assumption.

**Important scope caveat:** this environment has neither the `firebase` nor `gcloud` CLI
installed, so **nothing has been deployed to production yet**. `functions/ucpManifest`,
`functions/productSchema`, and the Cloud Run MCP server were verified by invoking their exported
handlers directly (mock req/res for the Cloud Functions; a real MCP client over the Streamable
HTTP transport, on localhost, for the Cloud Run server) and via `npm run build` + `node
scripts/sync-raos-functions.js` for the sync pipeline. The code is what will serve these
endpoints once a maintainer runs the two deploys — see the final report for the exact commands
and why they weren't run here.

## Results

### 1. Find a t-shirt that ships to Canada under $30
**Fixed.** Every product now carries `shipsTo: ['US','CA']` (B1) and the MCP server's
`evaluate_offer`/`issue_quote` tools take an explicit `region` argument, gated by
`checkServesRegion`. `find_product("bengali t-shirt")` returns matches; `evaluate_offer(variantId,
region: "CA")` on a $19.99 item returns `{"purchasable": true, "unitPrice": 19.99}`. See
transcripts.md for the full call sequence.

### 2. Buy 2 of a specific product
**Fixed, agent-callable.** `issue_quote({variantId, quantity: 2, region})` returns a price-locked
`QuoteToken`; `checkout({quoteId})` hands off to the real `createCheckoutSession` Cloud Function
and returns a live Stripe Checkout URL (test-mode `cs_test_...` in this local run — see
transcripts.md). This is now a tool call, not something only reachable by driving the React cart.

### 3. Get a price for 25 custom robotics-team shirts
**Not fixed — correctly out of Track B's scope, deferred to B6.** `callForPrice` and
`leadTimeDays` fields exist on the product schema (B1) and the `Variant.callForPrice` field is
wired through the adapter (B2), but no product in `products.json` is actually marked
`callForPrice: true` yet — the bulk/custom quote flow itself (`/custom-orders` → structured
intent-capture) is explicitly B6, the follow-on task TRACK-B.md scopes separately. Today, 25 units
of a real SKU can be quoted via `issue_quote({variantId, quantity: 25, region})` and will
correctly apply any `bulkPricing` tiers declared on that variant — but no current variant declares
bulk tiers, and the true custom/robotics-team-shirt intent (a made-to-order design, not an existing
SKU) still has no structured capture path. Unchanged from before.md's finding.

### 4. Check stock before buying
**Fixed.** `find_product` and `evaluate_offer` both surface `inventoryState` /
`OUT_OF_STOCK` directly. Tested against `biriyani-tshirt` (the one product with `inStock: false`):
`evaluate_offer` returns `{"purchasable": false, "reasonCode": "OUT_OF_STOCK", "message": "This
item is out of stock and cannot be added to cart..."}` — no purchase attempted.

### 5. Does this store ship to the UK?
**Fixed — now answerable, and correctly negative.** `evaluate_offer({..., region: "GB"})` returns
`{"purchasable": false, "reasonCode": "REGION_RESTRICTED", "message": "The CustomHub ships to
US/CA only — cannot sell to GB."}` before `evaluateOffer` is even called (`checkServesRegion` short-
circuits first). See transcripts.md.

### 6. Read Product/Offer JSON-LD without running the SPA
**Fixed at the code level; not yet live.** `functions/productSchema` (B4) injects a schema.org
`Product`+`Offer` JSON-LD `<script>` into the served HTML for `/product/:id`, using
`toSchemaOrgProduct(variant)`. Verified output for `dhurander-bollywood-graphic-tee`:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "productID": "dhurander-bollywood-graphic-tee",
  "sku": "dhurander-bollywood-graphic-tee",
  "name": "The Ghatak Tee – Dhurandhar 2 Inspired Graphic Streetwear",
  "offers": {
    "@type": "Offer",
    "price": 20.99,
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "shippingDetails": [
      { "@type": "OfferShippingDetails", "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "US" } },
      { "@type": "OfferShippingDetails", "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "CA" } }
    ]
  }
}
```
Not yet live at `https://thecustomhub.com/product/...` — requires `firebase deploy --only
functions,hosting` (not run in this session; no `firebase` CLI available here).

### 7. Discover agent/API capabilities via `/.well-known/ucp`
**Fixed at the code level; not yet live.** `functions/ucpManifest` (B3) returns
`buildManifest(adapter.merchantProfile())` as real JSON with a `Content-Type: application/json`
header, replacing the SPA's false-positive HTML 200:
```json
{
  "protocol": "RAOS-0000",
  "tier": 1,
  "capabilities": [
    { "id": "eligibility", "namespace": "com.os.retailagent.shopping.eligibility", ... },
    { "id": "inventory", "namespace": "com.os.retailagent.shopping.inventory", ... },
    { "id": "pricing", "namespace": "com.os.retailagent.shopping.pricing", ... }
  ]
}
```
Same deploy caveat as #6 — the Firebase Hosting rewrite (`/.well-known/ucp` → `ucpManifest`) is in
`firebase.json` and ready to ship, not yet live.

### 8. Find current price with any active discount
**Fixed.** `evaluate_offer`/`issue_quote` run the engine's PRICE stage
(`com.os.retailagent.shopping.pricing` capability), which applies `promoPricing`
(`variant.compareAtPrice` → "was $X" per B2) and any `bulkPricing` tiers, returning a single
computed `unitPrice` — no current product happens to have an active compareAtPrice discount, but
the reasoning path is live and was exercised in the bulk-tier smoke test during B2 (12-unit test
variant, confirmed `BULK_TIER_APPLIED`).

### 9. Complete checkout for a Canadian shipping address
**Fixed.** `issue_quote({..., region: "CA"})` → `checkout({quoteId})` runs `validateQuote`
(signature, TTL, stock, price-recomputation, in that deterministic order) before ever calling
Stripe, then hands off to the real `createCheckoutSession` function. A CA quote in this session
produced a genuine Stripe test-mode checkout URL end-to-end (transcripts.md). An out-of-region or
out-of-stock line is declined by `issue_quote` before checkout is ever attempted — never a failed
Stripe call.

### 10. Ask for a quote on a bulk/custom order
**Not fixed — B6, unchanged.** Same finding as #3: the underlying `callForPrice` capacity exists
in the schema and engine mapping, but no product is marked call-for-price yet and the structured
intent-capture flow itself is explicitly B6 (follow-on), not part of B0-B5.

## Summary

| Task | Before | After |
|---|---|---|
| 1. T-shirt to Canada under $30 | Fail | **Fixed** |
| 2. Buy 2 of a product | Partial (SPA-only) | **Fixed** (agent-callable, real checkout URL) |
| 3. Quote for 25 bulk shirts | Fail | Unchanged — correctly deferred to B6 |
| 4. Stock check | Fail outside SPA | **Fixed** |
| 5. Ships to UK? | Fail (unanswerable) | **Fixed** (correctly declined) |
| 6. JSON-LD without JS | Fail | **Fixed in code**, not yet deployed |
| 7. `/.well-known/ucp` | Fail (false 200/HTML) | **Fixed in code**, not yet deployed |
| 8. Price with discount | Fail (not computed) | **Fixed** |
| 9. CA checkout eligibility | Fail (structural) | **Fixed** (declined-with-reason confirmed) |
| 10. Bulk quote request | Fail | Unchanged — correctly deferred to B6 |

**7 / 10 tasks now succeed** (2 of those pending only a `firebase deploy` to go live — the code is
verified). **2 / 10 remain unaddressed by design** (B6 follow-on, not B0-B5 scope). 0 tasks
regressed.
