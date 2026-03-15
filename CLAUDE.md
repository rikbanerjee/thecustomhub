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

Tailwind CSS 4 with a custom token system defined in `tailwind.config.js`:
- **Brand colors**: `primary-600` (#2c1810, deep brown), `accent` (#c9a67c, golden tan), `secondary-300` (#9caf88, sage green)
- **Fonts**: `font-heading` = Cormorant Garamond (serif), `font-body` = Work Sans (sans-serif)

### Services & Config

- **EmailJS** (`src/config/emailjs.config.js`): Contact form email sending. Keys loaded from `VITE_EMAILJS_*` env vars.
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

**Valid `type` values** (drives site navigation): `"Coffee and Tea Cups"`, `"T-Shirts"`, `"Sweatshirts"`, `"Sports Jerseys"`, `"Home Decor"`.

For Amazon marketplace products, also include an `amazonData` object with `title`, `bulletPoints` (5 items), and `keywords`. See `src/amazon/AGENT_GUIDANCE.md` for the full Amazon listing workflow and `src/amazon/productDefaults.js` for auto-filled fields.

## New Product Workflow (Full Lifecycle)

1. Upload images to Firebase Storage bucket (`thecustomhub-efb8a.firebasestorage.app/images/`)
2. Append product entry to `src/data/products.json` following schema above
3. Validate JSON is valid: `node -e "JSON.parse(require('fs').readFileSync('src/data/products.json','utf8'))"`
4. Run `npm run build` to verify the build passes
5. If Amazon listing: run `npm run amazon:generate` → upload `output/amazon/amazon_upload_ready.tsv` to Seller Central
6. Deploy: `npm run deploy`

## Brand Context

The CustomHub is a North American personalization studio (positioned as "New England Design Studio") specializing in dual-lingo (Romanized Hindi/Bengali) streetwear and lifestyle goods targeting the global Indian diaspora. **Do not** reference the city name "Westborough" in any content. Key SEO terms: Romanized Hindi streetwear, Bollywood pop culture, Bengali pun, NRI lifestyle gifts.
