#!/usr/bin/env node
/**
 * add_etsy_links.js
 *
 * Fetches all active listings from your Etsy shop via the Etsy Open API v3,
 * fuzzy-matches each listing to a product in src/data/products.json by title,
 * and writes the Etsy listing URL into that product's externalLinks.etsy field.
 *
 * ── Setup ──────────────────────────────────────────────────────────────────
 * 1. Create a free Etsy developer account: https://www.etsy.com/developers/
 * 2. Create an app → copy the "Keystring" (API key)
 * 3. Find your shop name from your Etsy shop URL:
 *    https://www.etsy.com/shop/<YOUR_SHOP_NAME>
 *
 * ── Usage ──────────────────────────────────────────────────────────────────
 * Dry-run (preview matches, no changes):
 *   node scripts/add_etsy_links.js --api-key=YOUR_KEY --shop=YourShopName
 *
 * Apply matches above the default 40% threshold:
 *   node scripts/add_etsy_links.js --api-key=YOUR_KEY --shop=YourShopName --apply
 *
 * Raise or lower the confidence threshold (0–100):
 *   node scripts/add_etsy_links.js --api-key=YOUR_KEY --shop=YourShopName --apply --threshold=60
 *
 * Only overwrite products that have no Etsy URL yet (skip existing):
 *   node scripts/add_etsy_links.js --api-key=YOUR_KEY --shop=YourShopName --apply --skip-existing
 *
 * ── How matching works ─────────────────────────────────────────────────────
 * Titles are normalized (lowercase, strip punctuation) and scored using
 * Jaccard similarity on word tokens.  Any match >= threshold is accepted.
 * Ambiguous / low-confidence matches are flagged so you can review them.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_PATH = path.resolve(__dirname, "../src/data/products.json");

// ── CLI argument parsing ────────────────────────────────────────────────────
function getArg(name) {
  const flag = `--${name}=`;
  const found = process.argv.find((a) => a.startsWith(flag));
  return found ? found.slice(flag.length) : null;
}
function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

const API_KEY = getArg("api-key") || getArg("apiKey") || getArg("key");
const SHOP_NAME = getArg("shop");
const APPLY = hasFlag("apply");
const SKIP_EXISTING = hasFlag("skip-existing");
const THRESHOLD = parseInt(getArg("threshold") || "40", 10);

if (!API_KEY || !SHOP_NAME) {
  console.error(`
  Usage:
    node scripts/add_etsy_links.js --api-key=YOUR_KEY --shop=YourShopName [--apply] [--threshold=40] [--skip-existing]

  Get your API key (Keystring) from: https://www.etsy.com/developers/
  Your shop name is the slug in:    https://www.etsy.com/shop/<shop-name>
  `);
  process.exit(1);
}

// ── Normalise a title for comparison ───────────────────────────────────────
function normalise(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ") // strip punctuation
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(str) {
  return new Set(normalise(str).split(" ").filter((w) => w.length > 1));
}

/** Jaccard similarity (0–100) between two title strings */
function similarity(a, b) {
  const sa = tokenSet(a);
  const sb = tokenSet(b);
  const intersection = new Set([...sa].filter((x) => sb.has(x)));
  const union = new Set([...sa, ...sb]);
  if (union.size === 0) return 0;
  return Math.round((intersection.size / union.size) * 100);
}

// ── Fetch all active Etsy listings (paginates automatically) ───────────────
async function fetchEtsyListings() {
  const listings = [];
  const pageSize = 100;
  let offset = 0;
  let total = null;

  console.log(`\nFetching listings from Etsy shop "${SHOP_NAME}"…\n`);

  while (total === null || listings.length < total) {
    const url =
      `https://openapi.etsy.com/v3/application/shops/${encodeURIComponent(SHOP_NAME)}/listings/active` +
      `?limit=${pageSize}&offset=${offset}&includes[]=MainImage`;

    const res = await fetch(url, {
      headers: {
        "x-api-key": API_KEY,
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Etsy API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    total = data.count;
    listings.push(...data.results);
    offset += pageSize;

    if (offset < total) {
      process.stdout.write(`  fetched ${listings.length} / ${total}…\r`);
    }
  }

  console.log(`  Fetched ${listings.length} active Etsy listings.         \n`);
  return listings;
}

// ── Build Etsy listing URL from listing object ─────────────────────────────
function listingUrl(listing) {
  // Etsy always provides a url field, but construct it as fallback
  if (listing.url) return listing.url;
  const slug = normalise(listing.title).replace(/\s+/g, "-");
  return `https://www.etsy.com/listing/${listing.listing_id}/${slug}`;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const listings = await fetchEtsyListings();
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));

  // Stats
  let matched = 0;
  let skipped = 0;
  let unmatched = 0;
  const lowConfidenceMatches = [];

  console.log(`Matching ${listings.length} Etsy listings → ${products.length} products (threshold: ${THRESHOLD}%)\n`);
  console.log("─".repeat(80));

  for (const listing of listings) {
    // Find best matching product
    let bestProduct = null;
    let bestScore = 0;

    for (const product of products) {
      const score = similarity(listing.title, product.title);
      if (score > bestScore) {
        bestScore = score;
        bestProduct = product;
      }
    }

    const url = listingUrl(listing);
    const alreadyHasUrl =
      bestProduct?.externalLinks?.etsy &&
      bestProduct.externalLinks.etsy.length > 0;

    if (bestScore < THRESHOLD) {
      unmatched++;
      console.log(
        `  NO MATCH  (${String(bestScore).padStart(3)}%)  Etsy: "${listing.title}"`
      );
      continue;
    }

    if (SKIP_EXISTING && alreadyHasUrl) {
      skipped++;
      console.log(
        `  SKIP      (${String(bestScore).padStart(3)}%)  "${bestProduct.title}" — already has Etsy URL`
      );
      continue;
    }

    const confidence = bestScore >= 60 ? "MATCH    " : "LOW CONF ";
    console.log(
      `  ${confidence} (${String(bestScore).padStart(3)}%)  "${listing.title}"\n` +
      `              → "${bestProduct.title}"\n` +
      `              ${url}\n`
    );

    if (bestScore < 60) lowConfidenceMatches.push({ listing, bestProduct, bestScore, url });

    if (APPLY) {
      // Ensure externalLinks object exists
      if (!bestProduct.externalLinks) bestProduct.externalLinks = {};
      bestProduct.externalLinks.etsy = url;
      matched++;
    } else {
      matched++;
    }
  }

  console.log("─".repeat(80));
  console.log(`\nResults:`);
  console.log(`  Matched  : ${matched}`);
  console.log(`  Unmatched: ${unmatched} (below ${THRESHOLD}% threshold)`);
  if (SKIP_EXISTING) console.log(`  Skipped  : ${skipped} (already had Etsy URL)`);

  if (lowConfidenceMatches.length > 0) {
    console.log(
      `\n⚠️  ${lowConfidenceMatches.length} low-confidence match(es) (${THRESHOLD}–59%) — review before using:\n`
    );
    for (const { listing, bestProduct, bestScore } of lowConfidenceMatches) {
      console.log(`   ${bestScore}%  "${listing.title}" → "${bestProduct.title}"`);
    }
  }

  if (!APPLY) {
    console.log(
      `\nDry-run complete. Re-run with --apply to write changes to products.json.\n`
    );
    return;
  }

  if (matched === 0) {
    console.log("\nNo changes to write.\n");
    return;
  }

  // Write back
  fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2) + "\n");
  console.log(`\n✓ Wrote ${matched} Etsy URL(s) to src/data/products.json\n`);
  console.log("Next steps:");
  console.log("  1. Review the diff: git diff src/data/products.json");
  console.log("  2. Build: npm run build");
  console.log("  3. Deploy: npm run deploy\n");
}

main().catch((err) => {
  console.error("\nFatal:", err.message);
  process.exit(1);
});
