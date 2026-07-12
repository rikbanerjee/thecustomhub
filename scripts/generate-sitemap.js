/**
 * generate-sitemap.js — builds public/sitemap.xml from products.json + the
 * app's route list, so the sitemap stays accurate as the catalog changes.
 *
 * Runs automatically before every build (npm `prebuild` hook) and can be run
 * on its own with `npm run sitemap:generate`.
 *
 * URL conventions must match src/App.jsx and src/utils/dataHelpers.js:
 *   - category slug  = type.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
 *   - product URL    = /product/{id}
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const BASE_URL = "https://thecustomhub.com";

// Products/categories tagged with any of these are internal and stay out of the index.
const EXCLUDE_TAGS = ["test", "internal"];

// Slugify a product `type` into its category URL segment. Mirrors dataHelpers.js.
const categorySlug = (type) =>
  String(type)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const isExcluded = (product) =>
  (product.tags || []).some((t) =>
    EXCLUDE_TAGS.includes(String(t).toLowerCase())
  );

const products = JSON.parse(
  readFileSync(resolve(ROOT, "src/data/products.json"), "utf8")
);

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

// Static, indexable routes (utility/checkout pages are intentionally omitted;
// they're also Disallow-ed in robots.txt).
const staticRoutes = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/custom-orders", priority: "0.9", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "monthly" },
  { path: "/ai-stylist", priority: "0.6", changefreq: "monthly" },
  { path: "/return-policy", priority: "0.3", changefreq: "yearly" },
];

// Categories — distinct product types (excluding internal-only types).
const categoryTypes = [
  ...new Set(products.filter((p) => !isExcluded(p)).map((p) => p.type).filter(Boolean)),
];
const categoryRoutes = categoryTypes.map((type) => ({
  path: `/category/${categorySlug(type)}`,
  priority: "0.8",
  changefreq: "weekly",
}));

// Product detail pages (skip internal/test items).
const productRoutes = products
  .filter((p) => p.id && !isExcluded(p))
  .map((p) => ({
    path: `/product/${p.id}`,
    priority: "0.7",
    changefreq: "weekly",
  }));

const routes = [...staticRoutes, ...categoryRoutes, ...productRoutes];

const urlEntries = routes
  .map(
    ({ path, priority, changefreq }) =>
      `  <url>\n` +
      `    <loc>${BASE_URL}${path}</loc>\n` +
      `    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>${changefreq}</changefreq>\n` +
      `    <priority>${priority}</priority>\n` +
      `  </url>`
  )
  .join("\n");

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `${urlEntries}\n` +
  `</urlset>\n`;

writeFileSync(resolve(ROOT, "public/sitemap.xml"), xml, "utf8");

console.log(
  `sitemap.xml written: ${routes.length} URLs ` +
    `(${staticRoutes.length} static, ${categoryRoutes.length} categories, ` +
    `${productRoutes.length} products; ` +
    `${products.length - productRoutes.length} product(s) excluded).`
);
