/**
 * Generic Walmart bulk-upload generator.
 *
 * Injects every product marked `marketplace.walmart === "active"` into the
 * official Walmart template (`walmart_template.xlsx`), preserving its hidden
 * sheets/macros, and writes the result to output/walmart/walmart_upload_ready.xlsx.
 *
 * Per-product listing detail (variants, SKUs, key features, type-specific field
 * overrides) lives in a `walmartData` block on each product in products.json.
 * Static, confirmed-valid defaults live in scripts/walmartDefaults.js.
 *
 * This folds in the column map, GTIN exemption, variant grouping, and the
 * second-`variantAttributeNames`-column insertion that were proven on the
 * Dhurander tee. See docs/walmart/WALMART_UPLOAD_GUIDE.md for the full reference.
 */
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  COL,
  INSERT_COL,
  COMMON_DEFAULTS,
  TYPE_DEFAULTS,
  detectSpecProductType,
} from './walmartDefaults.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMPLATE_PATH = path.join(__dirname, '../walmart_template.xlsx');
const PRODUCTS_PATH = path.join(__dirname, '../src/data/products.json');
const OUTPUT_DIR    = path.join(__dirname, '../output/walmart');
const OUTPUT_PATH   = path.join(OUTPUT_DIR, 'walmart_upload_ready.xlsx');

const TARGET_SHEET_NAME = 'Product Content And Site Exp';
const DATA_START_ROW_INDEX = 6; // 0-based index for Row 7 (after header metadata)

// Strip HTML to plain text.
const stripHtml = (html) =>
  html ? html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : '';

/**
 * Normalise a product into its list of Walmart variant rows.
 * Products with no explicit variants become a single row built from top-level data.
 */
function getVariants(product) {
  const wd = product.walmartData || {};
  if (Array.isArray(wd.variants) && wd.variants.length > 0) {
    return wd.variants;
  }
  return [{ sku: product.sku || product.id, price: product.price, qty: wd.quantity, primary: true }];
}

/**
 * Insert a second `variantAttributeNames` column at INSERT_COL so Walmart treats
 * sizes as variants of one listing rather than duplicates. Shifts all cells at
 * INSERT_COL+ one step right across the 6 header rows + data, copies the col-113
 * header into the new column, and fixes merge ranges. The hidden sheet is a data
 * dictionary (not column-position-based), so insertion is safe.
 */
function insertSizeColumn(ws, range) {
  for (let r = 0; r <= range.e.r; r++) {
    for (let c = range.e.c; c >= INSERT_COL; c--) {
      const src = XLSX.utils.encode_cell({ r, c });
      const dst = XLSX.utils.encode_cell({ r, c: c + 1 });
      if (ws[src]) { ws[dst] = ws[src]; delete ws[src]; }
    }
  }
  for (let r = 0; r <= range.e.r; r++) {
    const src = XLSX.utils.encode_cell({ r, c: INSERT_COL - 1 }); // col 113 = variantAttributeNames
    const dst = XLSX.utils.encode_cell({ r, c: INSERT_COL });
    if (ws[src]) ws[dst] = { ...ws[src] };
  }
  if (ws['!merges']) {
    ws['!merges'] = ws['!merges'].map((m) => ({
      s: { r: m.s.r, c: m.s.c >= INSERT_COL ? m.s.c + 1 : m.s.c },
      e: { r: m.e.r, c: m.e.c >= INSERT_COL ? m.e.c + 1 : m.e.c },
    }));
  }
  range.e.c += 1;
}

try {
  // 1. Load products. Channels are marked via `marketplace: { walmart: "active" }`.
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const walmartProducts = products.filter((p) => p.marketplace?.walmart === 'active');

  if (walmartProducts.length === 0) {
    console.error('No products found marked for Walmart (set marketplace.walmart = "active").');
    process.exit(1);
  }

  // Any size-variant product requires the inserted clothingSize column. When
  // present, every tail column (index >= INSERT_COL) shifts one step right.
  const needsSizeColumn = walmartProducts.some((p) =>
    getVariants(p).some((v) => v.size != null && v.size !== '')
  );
  const colOf = (key) => {
    if (key === 'variantAttrNames2') return needsSizeColumn ? INSERT_COL : null;
    const base = COL[key];
    if (base == null) return null;
    return needsSizeColumn && base >= INSERT_COL ? base + 1 : base;
  };

  // 2. Read template.
  const workbook = XLSX.readFile(TEMPLATE_PATH, { cellStyles: true });
  const sheet = workbook.Sheets[TARGET_SHEET_NAME];
  if (!sheet) {
    console.error(`Sheet "${TARGET_SHEET_NAME}" not found in template.`);
    process.exit(1);
  }
  const range = XLSX.utils.decode_range(sheet['!ref']);

  if (needsSizeColumn) insertSizeColumn(sheet, range);

  const set = (row, key, val) => {
    const col = colOf(key);
    if (col == null || val === undefined || val === null || val === '') return;
    const addr = XLSX.utils.encode_cell({ r: row, c: col });
    sheet[addr] = { t: typeof val === 'number' ? 'n' : 's', v: val };
  };

  // 3. Inject data rows.
  const today = new Date().toISOString().split('T')[0];
  let currentRow = DATA_START_ROW_INDEX;
  const summary = [];

  walmartProducts.forEach((product) => {
    const wd = product.walmartData;
    if (!wd) {
      console.warn(`⚠️  ${product.id}: no walmartData block — skipping. Add one to publish to Walmart.`);
      return;
    }

    const specType = detectSpecProductType(product);
    const typeDefaults = TYPE_DEFAULTS[specType] || {};
    const brand = product.vendor || 'The CustomHub';
    const shortDesc = wd.shortDescription || stripHtml(product.description);
    const [kf1, kf2, kf3] = wd.keyFeatures || [];
    const mainImage = wd.mainImage || product.images?.[0];
    const extraImages = wd.extraImages || product.images?.slice(1, 4) || [];
    const variants = getVariants(product);
    const hasColor = variants.some((v) => v.color != null && v.color !== '');
    const hasSize = variants.some((v) => v.size != null && v.size !== '');

    variants.forEach((v) => {
      const r = currentRow++;

      // Merge precedence: common defaults → type defaults → per-product overrides.
      const row = { ...COMMON_DEFAULTS, ...typeDefaults, ...(wd.fields || {}) };

      // Per-product / per-variant fields override the merged defaults.
      row.specProductType = specType;
      row.brand = brand;
      row.manufacturer = brand;
      row.productName = buildProductName(wd, product, v);
      row.shortDescription = shortDesc;
      row.keyFeatures1 = kf1;
      row.keyFeatures2 = kf2;
      row.keyFeatures3 = kf3;
      row.mainImageUrl = mainImage;
      row.extraImg1 = extraImages[0];
      row.extraImg2 = extraImages[1];
      row.extraImg3 = extraImages[2];
      row.startDate = today;
      if (wd.shippingWeight != null) row.ShippingWeight = wd.shippingWeight;

      row.sku = v.sku || product.id;
      row.price = v.price ?? product.price;
      if (v.qty != null) row.quantity = v.qty;
      if (v.color) { row.color = v.color; row.colorCategory = v.colorCategory || v.color; }
      if (v.size) row.clothingSize = v.size;

      // Variant grouping (only when the product actually has variant dimensions).
      if (variants.length > 1 || hasColor || hasSize) {
        row.variantGroupId = wd.variantGroupId || `${product.id}-GRP`;
        if (hasColor) { row.variantAttrNames = 'color'; row.swatchVariantAttr = 'color'; }
        if (hasSize) row.variantAttrNames2 = 'clothingSize';
        row.isPrimaryVariant = v.primary ? 'Yes' : 'No';
      }

      for (const [key, val] of Object.entries(row)) set(r, key, val);
    });

    summary.push(`${product.id} → ${specType}, ${variants.length} variant row(s)`);
  });

  if (currentRow === DATA_START_ROW_INDEX) {
    console.error('No rows written — every active product was missing a walmartData block.');
    process.exit(1);
  }

  // 4. Extend range and write.
  range.e.r = Math.max(range.e.r, currentRow - 1);
  sheet['!ref'] = XLSX.utils.encode_range(range);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  XLSX.writeFile(workbook, OUTPUT_PATH);

  console.log(`Saved → ${OUTPUT_PATH}`);
  console.log(`Injected ${currentRow - DATA_START_ROW_INDEX} row(s) from ${summary.length} product(s):`);
  summary.forEach((s) => console.log(`  ${s}`));
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}

/**
 * Build the Walmart product name. Uses `walmartData.productNameTemplate` with
 * {color}/{size} placeholders when provided, else falls back to the title.
 */
function buildProductName(wd, product, v) {
  if (wd.productNameTemplate) {
    return wd.productNameTemplate
      .replace(/\{color\}/g, v.color || '')
      .replace(/\{size\}/g, v.size || '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  const suffix = [v.color, v.size && `Size ${v.size}`].filter(Boolean).join(', ');
  return suffix ? `${product.title}, ${suffix}` : product.title;
}
