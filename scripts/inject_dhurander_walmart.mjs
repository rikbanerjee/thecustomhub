/**
 * Injects Dhurander tee data into the official Walmart template.
 * Reads walmart_template.xlsx, fills the 'Product Content And Site Exp' sheet,
 * saves to output/walmart/dhurander-tee-walmart-upload.xlsx (overwrites).
 */
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE  = path.join(__dirname, '../walmart_template.xlsx');
const OUT_DIR   = path.join(__dirname, '../output/walmart');
const OUT_FILE  = path.join(OUT_DIR, 'dhurander-tee-walmart-upload.xlsx');

fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Images ────────────────────────────────────────────────────────────────────
const BASE = 'https://firebasestorage.googleapis.com/v0/b/thecustomhub-efb8a.firebasestorage.app/o/images%2Fdhurander-bollywood-tee%2F';
const img  = (f) => `${BASE}${encodeURIComponent(f)}?alt=media`;
const MAIN_IMG  = img('Dhurandhar-tee-main-blk.jpeg');
const IMG2      = img('Dhurander-tee-front-blk.jpg');
const IMG3      = img('Dhurander-tee-lifestyle.jpg');
const IMG4      = img('Dhurander-Ghayal-Hoon.jpg');

// ── Product content ───────────────────────────────────────────────────────────
const BRAND         = 'The CustomHub';
const MANUFACTURER  = 'The CustomHub';
const VARIANT_GROUP = 'TCH-DHURANDER-TEE-GRP';
const SHORT_DESC    = 'Rep the grit of Bollywood with the Ghayal Hoon Isiliye Ghatak Hoon graphic tee. Inspired by Dhurandhar 2, this premium 100% ring-spun cotton shirt is built for comfort and style. Ideal for the Indian diaspora looking for high-quality cultural apparel.';
const KF1 = '100% ring-spun cotton, pre-shrunk, medium weight (~5.3 oz/sq yd) — soft, durable, and wash-safe';
const KF2 = 'Bold Romanized Hindi Dhurandhar fan graphic — unapologetic Bollywood streetwear for the diaspora';
const KF3 = 'Unisex crew neck, short sleeve — true-to-size fit in S, M, L, XL, 2XL; vibrant print that won\'t crack or fade';
const FABRIC_CARE   = 'Machine Wash Cold; Tumble Dry Low; Do Not Bleach; Do Not Iron Directly on Print';
const TODAY         = new Date().toISOString().split('T')[0];

// ── Variant definitions ───────────────────────────────────────────────────────
const VARIANTS = [
  { sku: 'TCH-DHURANDER-TEE-BLK-S',   color: 'Black', colorCat: 'Black', size: 'S',   price: 20.99, qty: 20, primary: 'Yes' },
  { sku: 'TCH-DHURANDER-TEE-BLK-M',   color: 'Black', colorCat: 'Black', size: 'M',   price: 20.99, qty: 20, primary: 'No' },
  { sku: 'TCH-DHURANDER-TEE-BLK-L',   color: 'Black', colorCat: 'Black', size: 'L',   price: 20.99, qty: 20, primary: 'No' },
  { sku: 'TCH-DHURANDER-TEE-BLK-XL',  color: 'Black', colorCat: 'Black', size: 'XL',  price: 20.99, qty: 20, primary: 'No' },
  { sku: 'TCH-DHURANDER-TEE-BLK-2XL', color: 'Black', colorCat: 'Black', size: '2XL', price: 22.99, qty: 10, primary: 'No' },
  { sku: 'TCH-DHURANDER-TEE-WHT-S',   color: 'White', colorCat: 'White', size: 'S',   price: 20.99, qty: 20, primary: 'No' },
  { sku: 'TCH-DHURANDER-TEE-WHT-M',   color: 'White', colorCat: 'White', size: 'M',   price: 20.99, qty: 20, primary: 'No' },
  { sku: 'TCH-DHURANDER-TEE-WHT-L',   color: 'White', colorCat: 'White', size: 'L',   price: 20.99, qty: 20, primary: 'No' },
  { sku: 'TCH-DHURANDER-TEE-WHT-XL',  color: 'White', colorCat: 'White', size: 'XL',  price: 20.99, qty: 20, primary: 'No' },
  { sku: 'TCH-DHURANDER-TEE-WHT-2XL', color: 'White', colorCat: 'White', size: '2XL', price: 22.99, qty: 10, primary: 'No' },
];

// ── Column map (from template row 5, index 4) ─────────────────────────────────
// Cols 114+ are SHIFTED by 1 because we insert a second variantAttributeNames
// column at position 114. Original template: isPrimaryVariant=114, swatch=115,
// startDate=128. After insertion: isPrimaryVariant=115, swatch=116, startDate=129.
const COL = {
  sku:               3,
  specProductType:   4,
  productIdType:     5,
  productId:         6,
  productName:       7,
  brand:             8,
  price:             9,
  ShippingWeight:    10,
  country:           11,
  fulfillmentCenterID: 12,
  quantity:          13,
  netContentUnit:    26,
  netContentMeasure: 27,
  shortDescription:  15,
  keyFeatures1:      16,
  keyFeatures2:      17,
  keyFeatures3:      18,
  mainImageUrl:      19,
  countPerPack:      20,
  multipackQuantity: 21,
  isProp65:          22,
  color:             23,
  condition:         24,
  has_warranty:      25,
  ageGroup:          28,
  shirtNeckStyle:    37,
  clothingSize:      38,
  clothingSizeGroup: 39,
  clothingStyle:     40,
  clothingTopStyle:  41,
  colorCategory:     42,
  fabricCare:        44,
  materialPct:       45,
  materialName:      46,
  gender:            47,
  material:          48,
  sleeveLengthStyle: 49,
  smallParts:        50,
  stateChemical:     51,
  count:             53,
  zippered:          56,
  extraImg1:         60,
  extraImg2:         61,
  extraImg3:         62,
  manufacturer:      82,
  tShirtType:        106,
  variantGroupId:    112,
  variantAttrNames:  113,  // "color"
  variantAttrNames2: 114,  // "clothingSize" — inserted column
  isPrimaryVariant:  115,  // was 114, shifted +1
  swatchVariantAttr: 116,  // was 115, shifted +1
  startDate:         129,  // was 128, shifted +1
};

// ── Load template ─────────────────────────────────────────────────────────────
const wb = XLSX.readFile(TEMPLATE, { cellStyles: true });
const ws = wb.Sheets['Product Content And Site Exp'];
const range = XLSX.utils.decode_range(ws['!ref']);

// ── Insert second variantAttributeNames column at position 114 ────────────────
// The template only has 6 header rows (indices 0-5). Shift all cells at col 114+
// one step right so the inserted column carries the correct API field name header.
// The hidden sheet ('Hidden_product_content_and_sit') is a data dictionary —
// it does NOT reference column positions, so column insertion is safe.
const INSERT_COL = 114;
for (let r = 0; r <= range.e.r; r++) {
  for (let c = range.e.c; c >= INSERT_COL; c--) {
    const src = XLSX.utils.encode_cell({ r, c });
    const dst = XLSX.utils.encode_cell({ r, c: c + 1 });
    if (ws[src]) { ws[dst] = ws[src]; delete ws[src]; }
  }
}
// Copy variantAttributeNames header cells from col 113 into the new col 114
for (let r = 0; r <= range.e.r; r++) {
  const src = XLSX.utils.encode_cell({ r, c: 113 });
  const dst = XLSX.utils.encode_cell({ r, c: 114 });
  if (ws[src]) ws[dst] = { ...ws[src] };
}
// Update merged cell ranges that span col 114+
if (ws['!merges']) {
  ws['!merges'] = ws['!merges'].map(m => ({
    s: { r: m.s.r, c: m.s.c >= INSERT_COL ? m.s.c + 1 : m.s.c },
    e: { r: m.e.r, c: m.e.c >= INSERT_COL ? m.e.c + 1 : m.e.c },
  }));
}
range.e.c += 1;

// ── Helper to write a cell ────────────────────────────────────────────────────
const set = (row, col, val) => {
  const addr = XLSX.utils.encode_cell({ r: row, c: col });
  const t = typeof val === 'number' ? 'n' : 's';
  ws[addr] = { t, v: val };
};

// ── Inject data rows starting at row index 6 (row 7) ─────────────────────────
const DATA_START = 6;

VARIANTS.forEach((v, i) => {
  const r = DATA_START + i;

  // Build product name with size+color suffix for searchability
  const productName = `The CustomHub Dhurandhar Bollywood Graphic Tee, Unisex Fan T-Shirt, 100% Cotton, ${v.color}, Size ${v.size}`;

  set(r, COL.sku,               v.sku);
  set(r, COL.specProductType,   'T-Shirts');
  set(r, COL.productIdType,     'GTIN');    // GTIN exemption
  set(r, COL.productId,         'custom');  // confirmed working format for GTIN exemption
  set(r, COL.productName,       productName);
  set(r, COL.brand,             BRAND);
  set(r, COL.price,             v.price);
  set(r, COL.ShippingWeight,    0.5);
  set(r, COL.country,           'United States');
  set(r, COL.fulfillmentCenterID, '10002931712'); // Walmart Fulfillment Center ID (self-fulfilled)
  set(r, COL.quantity,          v.qty);
  set(r, COL.shortDescription,  SHORT_DESC);
  set(r, COL.keyFeatures1,      KF1);
  set(r, COL.keyFeatures2,      KF2);
  set(r, COL.keyFeatures3,      KF3);
  set(r, COL.mainImageUrl,      MAIN_IMG);
  set(r, COL.countPerPack,      1);
  set(r, COL.multipackQuantity, 1);
  set(r, COL.isProp65,          'No');
  set(r, COL.color,             v.color);
  set(r, COL.condition,         'New');
  set(r, COL.has_warranty,      'No');
  set(r, COL.netContentUnit,    'Each');
  set(r, COL.netContentMeasure, 1);
  set(r, COL.ageGroup,          'Adult');
  set(r, COL.shirtNeckStyle,    'Crew Neck');
  set(r, COL.clothingSize,      v.size);
  set(r, COL.clothingSizeGroup, 'Men');
  set(r, COL.clothingStyle,     'Streetwear');
  set(r, COL.clothingTopStyle,  'Cocoon');
  set(r, COL.colorCategory,     v.colorCat);
  set(r, COL.fabricCare,        FABRIC_CARE);
  set(r, COL.materialPct,       100);
  set(r, COL.materialName,      'Cotton');
  set(r, COL.gender,            'Unisex');
  set(r, COL.material,          'Cotton');
  set(r, COL.sleeveLengthStyle, 'Short Sleeve');
  set(r, COL.smallParts,        '0 - No warning applicable');
  set(r, COL.stateChemical,     'None');
  set(r, COL.count,             1);
  set(r, COL.zippered,          'N');
  set(r, COL.extraImg1,         IMG2);
  set(r, COL.extraImg2,         IMG3);
  set(r, COL.extraImg3,         IMG4);
  set(r, COL.manufacturer,      MANUFACTURER);
  set(r, COL.tShirtType,        'Graphic Tees');
  set(r, COL.variantGroupId,    VARIANT_GROUP);
  set(r, COL.variantAttrNames,  'color');
  set(r, COL.variantAttrNames2, 'clothingSize');
  set(r, COL.isPrimaryVariant,  v.primary);
  set(r, COL.swatchVariantAttr, 'color');
  set(r, COL.startDate,         TODAY);
});

// Extend sheet range to cover new rows
range.e.r = Math.max(range.e.r, DATA_START + VARIANTS.length - 1);
ws['!ref'] = XLSX.utils.encode_range(range);

XLSX.writeFile(wb, OUT_FILE);

console.log(`Saved → ${OUT_FILE}`);
console.log(`Injected ${VARIANTS.length} variant rows into official Walmart template`);
console.log(`\nVariants:`);
VARIANTS.forEach(v => console.log(`  ${v.sku}  ${v.color}/${v.size}  $${v.price}  qty:${v.qty}  primary:${v.primary}`));
