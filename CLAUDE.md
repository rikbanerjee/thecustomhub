# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:5173
npm run build        # Production build to dist/
npm run preview      # Preview production build at localhost:4173
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm run deploy       # Build + deploy to Firebase Hosting
npm run clean        # Remove dist/ and Vite cache

# Marketplace feed generation
npm run amazon:generate    # Generate Amazon TSV feed → output/amazon/
npm run amazon:test        # Test Amazon data with defaults applied
npm run walmart:generate   # Generate Walmart upload file
```

## Architecture

**React 19 + Vite + Tailwind CSS 4** SPA deployed to Firebase Hosting. All routing is client-side via React Router v7.

### Data Flow

All product data lives in **`src/data/products.json`** — a flat JSON array. There is no database or API. The `src/utils/dataHelpers.js` module is the single access layer for all product queries (search, filter, category extraction, etc.). It normalizes the raw product schema on read, so components always receive a consistent shape regardless of whether the raw product uses the simple format (with top-level `price`) or the Shopify-variant format.

Categories are **dynamically derived** from the `type` field of each product — there is no separate category data file. The navigation and category pages are driven entirely by the distinct `type` values present in `products.json`.

### Routing (`src/App.jsx`)

All routes are lazy-loaded under the shared `<Layout>` wrapper:
- `/` → Home
- `/category/:categoryName` → CategoryPage (categoryName = slugified product `type`)
- `/product/:productId` → ProductDetail
- `/contact` → Contact
- `/custom-orders` → CustomOrders
- `/search` → SearchResults

### Image Handling

Images are hosted on Firebase Storage (`thecustomhub-efb8a.firebasestorage.app`). Always use full `?alt=media` URLs in `products.json`. The `src/utils/imageHelpers.js` helpers convert any legacy Shopify CDN URLs on the fly. Fallback/placeholder logic lives in `src/config/images.js`.

### Styling

Tailwind CSS 4 with a custom token system defined in `tailwind.config.js` and mirrored in the
`@theme` block of `src/styles/index.css` (the CSS `@theme` block is what actually generates
utility classes under this project's PostCSS-based v4 setup — keep both files in sync).
"Desi Pop x Zine" theme (see `docs/DESIGN_REVAMP_PLAN.md`):
- **Brand colors**: `ink` (#1A1423), `cream` (#FFF6E9), `rani` (#D81E5B, primary CTA/accents),
  `marigold` (#FFB627, secondary accent/stickers), `peacock` (#0F7173, links/secondary buttons),
  `chai` (#C9A67C, borders/subtle fills). The `primary-*`/`secondary-*` Tailwind scales are
  remapped onto ink/chai and peacock respectively so pre-existing components inherit the theme.
- **Fonts**: `font-heading` = Anton (display, one weight only — always pair with the `.display`
  utility class, which bakes in `font-weight:400 !important; font-synthesis:none` so browsers
  never fake-bold it), `font-body` = Work Sans (sans-serif, unchanged).
- Style signature: 3px ink borders, hard offset shadows (`.pop-border`/`.pop-shadow`), rotated
  pill "sticker" badges (`.sticker`, or `src/components/ui/Sticker.jsx`), marigold focus rings.

### Services & Config

- **Email sending** — all lead/inquiry forms (Contact, `/custom-orders` stepper, homepage
  quick-lead form, newsletter signup in Footer) go through the `sendInquiryEmail` Cloud
  Function (`functions/index.js`), which sends via **Resend** server-side using the
  `RESEND_API_KEY` secret (`firebase functions:secrets:set RESEND_API_KEY`). Call it from
  the frontend with `httpsCallable(firebaseFunctions, 'sendInquiryEmail')`, passing
  `{ type: 'contact' | 'custom-order' | 'quick-lead' | 'newsletter', ...fields }`. There is
  no client-side email service/key — EmailJS was retired in favor of this because a
  client-shippable "public key" model still exposes the service to abuse and can't be
  hidden, whereas Resend's key stays server-side in Secret Manager. Order-confirmation
  emails (post-Stripe-checkout) use a separate internal helper, `sendOrderEmail`, in the
  same file — same Resend client, different trigger (Stripe webhook / WhatsApp lead
  capture, not a form submission).
- **Firebase** (`src/config/firebase.config.js`): Storage for images + Hosting for deployment. Keys from `VITE_FIREBASE_*` env vars. Copy `.env.example` → `.env` to configure locally.

## Product Data Schema

When adding products to `src/data/products.json`, the required fields are:

```json
{
  "id": "kebab-case-unique-id",
  "title": "Product Title",
  "vendor": "The CustomHub",
  "type": "Coffee and Tea Cups",
  "category": "Home & Garden > Kitchen & Dining > ...",
  "price": 19.99,
  "description": "...",
  "images": ["https://firebasestorage.googleapis.com/...?alt=media"],
  "tags": ["tag1", "tag2"],
  "inStock": true,
  "marketplace": { "amazon": "active" }
}
```

**Valid `type` values** (drives site navigation): the distinct `type` strings currently present in `products.json` are `"T-Shirts"`, `"Coffee and Tea Cups"`, `"Sweatshirts"`, and `"Sports Jerseys"`. Navigation is generated from whatever `type` values exist, so adding a new one creates a new category automatically — reuse an existing string unless you intend a new category.

For Amazon marketplace products, also include an `amazonData` object with `title`, `bulletPoints` (exactly 5 items), and `keywords`. See `src/amazon/AGENT_GUIDANCE.md` for the full Amazon listing workflow and `src/amazon/productDefaults.js` for auto-filled fields. See the **Marketplace Automation** section below for current limitations.

## New Product Workflow (Full Lifecycle)

1. Upload images to Firebase Storage bucket (`thecustomhub-efb8a.firebasestorage.app/images/`)
2. Append product entry to `src/data/products.json` following schema above
3. Validate JSON is valid: `node -e "JSON.parse(require('fs').readFileSync('src/data/products.json','utf8'))"`
4. Run `npm run build` to verify the build passes
5. If Amazon/Walmart listing: add an `amazonData`/`walmartData` block to the product, set `marketplace.<channel> = "active"`, then run `npm run amazon:generate` / `npm run walmart:generate`. See the **Marketplace Automation** section for the schema.
6. Deploy: `npm run deploy`

## Marketplace Automation (Amazon + Walmart) — READ BEFORE TOUCHING

The site also feeds product listings to **Amazon Seller Central** and **Walmart Seller Center** via bulk-upload files. This subsystem is **partially working and brittle** — read this whole section before running or editing anything here. The detailed, battle-tested field references live in:

- `docs/walmart/WALMART_UPLOAD_GUIDE.md` — column map, confirmed closed-list values, per-product-type field tables, variant grouping, SKU convention, and a full error→fix table. **Mandatory read before generating any Walmart file.**
- `docs/amazon/AMAZON_FEED_TROUBLESHOOTING.md` — the TSV must start with the technical header row; strip the top 4 metadata rows or Amazon rejects it.
- `src/amazon/AGENT_GUIDANCE.md` + `src/amazon/productDefaults.js` — Amazon listing workflow and auto-filled defaults.
- `AGENT_WORKFLOW.md` — the `_inbox/` product intake convention.

### Two pipelines, two output formats

| | Amazon | Walmart |
|---|---|---|
| Format | TSV (tab-separated flat file) | `.xlsx` injected into Walmart's official template |
| Generic generator | `src/amazon/generator.js` (`npm run amazon:generate`) | `scripts/inject_walmart_feed.js` (`npm run walmart:generate`) |
| Template | `docs/amazon/DRINKING_CUP.xlsm` | `walmart_template.xlsx` (root — Full Item Spec from Seller Center) |
| Output | `output/amazon/` | `output/walmart/` |
| Per-variant rows | One row per product | One row **per size variant** (color+size = own row) |

### How the generic generators work (both are now schema-driven)

Both npm-script generators read the live `marketplace: { amazon|walmart: "active" | "inactive" }` field — a product is included only when its channel is `"active"`. Per-product listing detail is carried on the product itself:

- **Amazon** (`src/amazon/generator.js`): reads an `amazonData` block (`title`, `bulletPoints` ×5, `keywords`, …). Type defaults come from `src/amazon/productDefaults.js`; field mapping lives in `src/amazon/fieldMapping.js`.
- **Walmart** (`scripts/inject_walmart_feed.js` + `scripts/walmartDefaults.js`): reads a `walmartData` block (see schema below). The column map, GTIN exemption, variant grouping, and the second-`variantAttributeNames`-column insertion (proven on the Dhurander tee) are all folded in. `walmartDefaults.js` holds `COMMON_DEFAULTS`, per-`specProductType` `TYPE_DEFAULTS`, and the column map; the injector merges common → type → per-product `walmartData.fields` overrides for each row. Output: `output/walmart/walmart_upload_ready.xlsx`.

The generic Walmart generator reproduces the known-good Dhurander upload cell-for-cell (verified — only the auto-filled `startDate` differs, since it's "today").

#### `walmartData` schema (T-shirt example)

```jsonc
"walmartData": {
  "specProductType": "T-Shirts",          // optional; else derived from `type`
  "variantGroupId": "TCH-DHURANDER-TEE-GRP",
  "shippingWeight": 0.5,
  "productNameTemplate": "... {color}, Size {size}",  // {color}/{size} placeholders
  "shortDescription": "...",               // optional; falls back to stripped description
  "keyFeatures": ["bullet 1", "bullet 2", "bullet 3"],
  "fields": { "clothingTopStyle": "Pullover" },        // optional per-product overrides
  "variants": [
    { "sku": "TCH-...-BLK-S", "color": "Black", "colorCategory": "Black",
      "size": "S", "price": 20.99, "qty": 20, "primary": true }
  ]
}
```

A product with no `variants` produces a single row from its top-level fields (fine for mugs). Size variants automatically trigger the inserted `clothingSize` column.

### Legacy / reference scripts

The original per-product one-off scripts are kept as references but are **superseded** by the generic generators:
- `scripts/inject_dhurander_walmart.mjs` (and `_by_size`) — the hand-built Dhurander Walmart injector the generic logic was distilled from.
- `scripts/generate_dhurander_amazon.mjs` — the hand-built Dhurander Amazon TSV generator.

Don't add new per-product scripts — add a `walmartData`/`amazonData` block to the product and run the generic generator instead.

### Hard-won gotchas (do not relearn these the hard way)

- **Walmart rejects Firebase Storage image URLs.** Both `firebasestorage.googleapis.com/...?alt=media` and `storage.googleapis.com/...` (403) fail. Workaround: copy images into `public/product-images/{folder}/`, `npm run deploy`, then reference `https://thecustomhub.com/product-images/{folder}/{file}`.
- **Walmart data starts at row 7 (index 6)**; rows 1–6 are template metadata. Inject into `walmart_template.xlsx` directly — never build a fresh xlsx, the hidden sheets/macros must stay intact.
- **GTIN exemption:** every Walmart row sets `productIdType="GTIN"`, `productId="custom"`.
- **`fulfillmentCenterID = 10002931712`** (TheCustomHub's confirmed FC ID) — never blank or `"0"`.
- **Walmart `(+)` fields take ONE value per cell** — comma-separated lists error. Add extra values via the Seller Center UI after the listing is live.
- **Color+size variants need two `variantAttributeNames` columns** (`"color"` at 113, `"clothingSize"` inserted at 114) or Walmart treats every size as a duplicate listing. See `inject_dhurander_walmart.mjs` for the exact column-shift logic.
- **Amazon TSV must start with the technical header row** (`contribution_sku#1.value\t...`) — strip the top 4 metadata rows or the upload is rejected. Verify with `head -n 1 output/amazon/*.tsv`.
- **Amazon needs an `amazonData` block** per product: `title`, `bulletPoints` (exactly 5), `keywords`, plus type defaults from `src/amazon/productDefaults.js`.

## Catalog & Inventory MCP Server

`mcp-server/` is a separate MCP server (own `package.json`, own `node_modules` — not part of the Vite bundle) that lets a Claude session manage inventory and channel status conversationally instead of hand-editing `products.json`. Wired into this repo via `.mcp.json` at the root, so Claude Code picks it up automatically. See `mcp-server/README.md` for usage, `docs/CATALOG_INVENTORY_MCP_PLAN.md` for the product rationale, `docs/CATALOG_MCP_V0_IMPLEMENTATION_PLAN.md` for the engineering scope.

`mcp-server/lib/store.js` is the only module allowed to read or write `products.json`; every write tool routes through its `applyChange()`, which snapshots, validates the full catalog, atomically writes, and audit-logs. If you're adding a new tool to this server, never read/write the file directly from `index.js` — go through `store.js`.

Tools: `find_product`, `get_product`, `list_low_stock` (read-only); `update_inventory`, `set_channel_status`, `discontinue_product` (write — two-phase preview/confirm). Does not yet cover adding products, pricing, or feed regeneration — that's still done by hand per the workflow above.

## Brand Context

The CustomHub is a North American personalization studio (positioned as "New England Design Studio") specializing in dual-lingo (Romanized Hindi/Bengali) streetwear and lifestyle goods targeting the global Indian diaspora. **Do not** reference the city name "Westborough" in any content. Key SEO terms: Romanized Hindi streetwear, Bollywood pop culture, Bengali pun, NRI lifestyle gifts.
