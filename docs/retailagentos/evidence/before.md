# Track B — Baseline Evidence (Before RetailAgentOS Integration)

Captured: 2026-07-05, against the live production store at https://thecustomhub.com and the
unmodified `main` branch (commit `3cad2cc`), **before** any Track B code (B1+) touched
`products.json` or the repo. This file is the pre-instrumentation snapshot required by B6 — it
cannot be recreated once the integration ships, since the whole point is to prove what was broken
before it.

Method: a mix of (a) direct `curl` against the live site to see exactly what a non-JS agent/crawler
receives, and (b) static inspection of the source (`src/data/products.json`,
`src/utils/dataHelpers.js`, `src/pages/CustomOrders`, `src/contexts/CartContext.jsx`,
`functions/index.js`) to confirm there is no server-side reasoning to fall back on. No purchases
were made against the live Stripe integration during this baseline pass.

## Task set (10 representative agent-shopping tasks)

| # | Task |
|---|---|
| 1 | Find a t-shirt that ships to Canada under $30 |
| 2 | Buy 2 of a specific product (e.g. the Dhurander Bollywood graphic tee) |
| 3 | Get a price for 25 custom robotics-team shirts |
| 4 | Check whether a specific mug is in stock before buying |
| 5 | Ask "does this store ship to the UK?" for any product |
| 6 | Read the Product/Offer JSON-LD for a product page without executing JS (crawler simulation via `curl`) |
| 7 | Discover the store's agent/API capabilities via `/.well-known/ucp` |
| 8 | Find the current price (with any active discount) for a product |
| 9 | Complete checkout for a Canadian shipping address |
| 10 | Ask for a quote on a bulk/custom order and get a structured, actionable answer |

## Results

### 1. Find a t-shirt that ships to Canada under $30
**Fails — silent no-match / no region data at all.** `products.json` has no `shipsTo` field on any
of the 59 products (`p.some(x => x.shipsTo)` → `false`). There is no concept of region eligibility
anywhere in the codebase (`grep -rn "region|shipsTo|Canada|country"` across `dataHelpers.js`,
`CartContext.jsx`, `functions/index.js` → zero hits outside an unrelated code comment). An agent can
find a t-shirt under $30 by price alone (e.g. `dhurander-bollywood-graphic-tee`,
`abstract-durga-maa-shakti-t-shirt`), but nothing on the product, page, or API confirms Canadian
eligibility — the agent would have to guess or ask a human.

### 2. Buy 2 of a specific product
**Partially works but is cart/session-bound, not agent-callable.** `CartContext.jsx` supports
`addToCart(product, quantity)` and checkout goes through the `createCheckoutSession` Cloud Function
to Stripe — this is real and functional for a human clicking through the SPA. But there is no API
surface an agent can call directly (no MCP tool, no REST endpoint that takes `{ productId, qty }`
and returns a checkout link) — it's only reachable by driving the React UI.

### 3. Get a price for 25 custom robotics-team shirts
**Dead-ends at a contact form.** `/custom-orders` (`src/pages/CustomOrders/index.jsx`) shows tiered
discount *bands* (12–24 = 15%, 25–49 = 20%, etc.) as static marketing copy only — there is no
`callForPrice` field, no quote object, and no computed price. The page's only CTA is a `<Link
to="/contact">` (`CustomOrders/index.jsx:198-203`), i.e. a human-facing email/contact form. An agent
gets no structured price and no way to submit "25 units" as structured input — it would have to
fill out a freeform contact form and wait for a human reply.

### 4. Check stock before buying
**Boolean only, not exposed outside the SPA.** Products carry `inStock: true/false` in
`products.json`, and `dataHelpers.js` reads it, but this is only surfaced by rendering React
components client-side. `curl`ing a product URL returns the generic SPA shell (see #6) — no stock
data is present in the HTML delivered to a non-JS client.

### 5. Does this store ship to the UK?
**Silent no-match — the question is unanswerable by the site.** There is no `shipsTo` allowlist, no
region-gating logic, and no page/API that states shipping scope. Nothing on the site says the store
is US/CA only (that's a Track B *decision*, not something the current site expresses at all) — an
agent has no way to know shipping to the UK is out of scope short of a human support reply.

### 6. Read Product/Offer JSON-LD without running the SPA
**Fails — no structured data delivered to non-JS clients.**
```
$ curl -s https://thecustomhub.com/product/dhurander-bollywood-graphic-tee | grep -i "ld+json"
(no output)
$ curl -s https://thecustomhub.com/ | grep -i "ld+json"
(no output)
```
Every route (including product pages) serves the same generic `index.html` shell via the SPA's
catch-all rewrite (`firebase.json`: `"source": "**", "destination": "/index.html"`) — a `<title>`
tag with the generic site title, no per-product `<title>`, and zero JSON-LD. A crawler or agent
that doesn't execute JS sees a blank shopping site regardless of which product URL it requests.

### 7. Discover agent/API capabilities via `/.well-known/ucp`
**Fails — returns the SPA shell with HTTP 200, not a manifest.**
```
$ curl -sI https://thecustomhub.com/.well-known/ucp
HTTP/2 200
content-type: text/html; charset=utf-8
content-length: 1819
```
The 200 is misleading: it's the SPA catch-all serving `index.html` for literally any path, not a
real manifest endpoint. There is no `tier`, no `capabilities[]`, no endpoint list — an agent
probing for RetailAgentOS/UCP support gets a false-positive HTML response instead of a clean 404 or
a real manifest.

### 8. Find current price with any active discount
**Data exists but isn't computed/reasoned over.** Some products carry Shopify-style
`compareAtPrice`-shaped fields; `walmartData`/`amazonData` blocks carry per-channel pricing. But
there is no `evaluateOffer`-style reasoning — "was $X now $Y" is rendered as static UI copy per
product page, not derivable from a single canonical price/offer object an agent could query.

### 9. Complete checkout for a Canadian shipping address
**Untested against live Stripe (out of scope for a read-only baseline pass) but structurally
unenforced.** `functions/index.js`'s `createCheckoutSession` and the Stripe integration have no
region allowlist/denylist logic (confirmed via grep — zero region-related code in `functions/`).
Absent that, checkout would either silently accept a CA address with no eligibility check, or fail
downstream in Stripe/fulfillment rather than being declined upfront with a clear reason — exactly
the "failed checkout instead of declined with a reason" failure mode B5's acceptance criteria calls
out.

### 10. Ask for a quote on a bulk/custom order
**Dead-ends at a contact form (same as #3).** No structured intent-capture exists. The only path is
`/custom-orders → /contact`, a freeform human support form with no API, no schema, and no
machine-readable response. This is exactly the gap B6 (follow-on) is scoped to close.

## Summary

| Task | Outcome |
|---|---|
| 1. T-shirt to Canada under $30 | Fail — no region data, silent no-match |
| 2. Buy 2 of a product | Partial — works via SPA cart only, not agent-callable |
| 3. Quote for 25 bulk shirts | Fail — dead-ends at contact form, no structured price |
| 4. Stock check | Fail outside SPA — boolean exists but not exposed to non-JS clients |
| 5. Ships to UK? | Fail — unanswerable, no shipping-scope data exists |
| 6. JSON-LD without JS | Fail — zero structured data, generic SPA shell for every route |
| 7. `/.well-known/ucp` | Fail — false-positive 200/HTML, no real manifest |
| 8. Price with discount | Fail — pricing not reasoned/computed, static per-page copy only |
| 9. CA checkout eligibility | Fail (structural) — no region gate; would silently pass or fail late |
| 10. Bulk quote request | Fail — same contact-form dead-end as #3 |

**0 / 10 tasks succeed in an agent-usable, structured way.** Task #2 (basic purchase) works for a
human driving the browser, but has no agent-callable surface at all. This is the baseline Track B
is measured against in `after.md`.
