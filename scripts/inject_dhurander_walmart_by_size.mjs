/**
 * TEMPORARY WORKAROUND — generates one Walmart upload Excel per size.
 * Each file has 1 row: Black only for that size.
 * No color variation — single standalone listing per size.
 *
 * TODO: Once Walmart resolves the duplicate-detection issue for GTIN-exempt
 * products with multiple sizes, revert to the single-file approach in
 * inject_dhurander_walmart.mjs which uses the correct 2-column
 * variantAttributeNames ("color" + "clothingSize") setup.
 *
 * Usage: node scripts/inject_dhurander_walmart_by_size.mjs
 * Output: output/walmart/dhurander-tee-{SIZE}-walmart-upload.xlsx (5 files)
 */
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE = path.join(__dirname, '../walmart_template.xlsx');
const OUT_DIR  = path.join(__dirname, '../output/walmart');
fs.mkdirSync(OUT_DIR, { recursive: true });

// ── Images ────────────────────────────────────────────────────────────────────
// Served from Firebase Hosting (clean URLs, no query strings, no encoded paths).
// Files are in public/product-images/dhurander-bollywood-tee/ → deployed to
// https://thecustomhub.com/product-images/dhurander-bollywood-tee/
// Walmart rejects firebasestorage.googleapis.com URLs (?alt=media query string
// and %2F path encoding both fail their image URL validator).
const BASE = 'https://thecustomhub.com/product-images/dhurander-bollywood-tee/';
const img  = (f) => `${BASE}${f}`;
const MAIN_IMG = img('dhurandhar-tee-main-blk.jpg');
const IMG2     = img('dhurander-tee-front-blk.jpg');
const IMG3     = img('dhurander-tee-lifestyle.jpg');
const IMG4     = img('dhurander-ghayal-hoon.jpg');

// ── Product content ───────────────────────────────────────────────────────────
const BRAND        = 'The CustomHub';
const MANUFACTURER = 'The CustomHub';
const SHORT_DESC   = 'Rep the grit of Bollywood with the Ghayal Hoon Isiliye Ghatak Hoon graphic tee. Inspired by Dhurandhar 2, this premium 100% ring-spun cotton shirt is built for comfort and style. Ideal for the Indian diaspora looking for high-quality cultural apparel.';
const KF1 = '100% ring-spun cotton, pre-shrunk, medium weight (~5.3 oz/sq yd) — soft, durable, and wash-safe';
const KF2 = 'Bold Romanized Hindi Dhurandhar fan graphic — unapologetic Bollywood streetwear for the diaspora';
const KF3 = 'Unisex crew neck, short sleeve — true-to-size fit in S, M, L, XL, 2XL; vibrant print that won\'t crack or fade';
const FABRIC_CARE  = 'Machine Wash Cold; Tumble Dry Low; Do Not Bleach; Do Not Iron Directly on Print';
const TODAY        = new Date().toISOString().split('T')[0];

// ── Column map — original template positions (no column insertion) ─────────────
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
  netContentUnit:    26,
  netContentMeasure: 27,
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
  variantAttrNames:  113,  // "color" only — one size per file, no second column needed
  isPrimaryVariant:  114,
  swatchVariantAttr: 115,
  startDate:         128,
};

// ── Sizes to generate ─────────────────────────────────────────────────────────
const SIZES = [
  { size: 'S',   price: 20.99, qty: 20 },
  { size: 'M',   price: 20.99, qty: 20 },
  { size: 'L',   price: 20.99, qty: 20 },
  { size: 'XL',  price: 20.99, qty: 20 },
  { size: '2XL', price: 22.99, qty: 10 },
];

// ── Generate one file per size ────────────────────────────────────────────────
for (const { size, price, qty } of SIZES) {
  const variants = [
    { sku: `TCH-DHURANDER-TEE-BLK-${size}`, color: 'Black', colorCat: 'Black', primary: 'Yes' },
  ];

  // Fresh workbook for each size (re-read template each time)
  const wb = XLSX.readFile(TEMPLATE, { cellStyles: true });
  const ws = wb.Sheets['Product Content And Site Exp'];
  const range = XLSX.utils.decode_range(ws['!ref']);

  const set = (row, col, val) => {
    const addr = XLSX.utils.encode_cell({ r: row, c: col });
    ws[addr] = { t: typeof val === 'number' ? 'n' : 's', v: val };
  };

  const DATA_START = 6;
  variants.forEach((v, i) => {
    const r = DATA_START + i;
    const productName = `Dhurandhar Bollywood Graphic Tee, Unisex Fan T-Shirt, 100% Cotton, ${v.color}, Size ${size}`;
    const variantGroup = `TCH-DHURANDER-TEE-${size}-GRP`;

    set(r, COL.sku,               v.sku);
    set(r, COL.specProductType,   'T-Shirts');
    set(r, COL.productIdType,     'GTIN');
    set(r, COL.productId,         'custom');
    set(r, COL.productName,       productName);
    set(r, COL.brand,             BRAND);
    set(r, COL.price,             price);
    set(r, COL.ShippingWeight,    0.5);
    set(r, COL.country,           'United States');
    set(r, COL.fulfillmentCenterID, '10002931712');
    set(r, COL.quantity,          qty);
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
    set(r, COL.clothingSize,      size);
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
    set(r, COL.variantGroupId,    variantGroup);
    set(r, COL.variantAttrNames,  'color');
    set(r, COL.isPrimaryVariant,  v.primary);
    set(r, COL.swatchVariantAttr, 'color');
    set(r, COL.startDate,         TODAY);
  });

  range.e.r = Math.max(range.e.r, DATA_START + variants.length - 1);
  ws['!ref'] = XLSX.utils.encode_range(range);

  const outFile = path.join(OUT_DIR, `dhurander-tee-${size}-walmart-upload.xlsx`);
  XLSX.writeFile(wb, outFile);
  console.log(`Saved → ${outFile}`);
}

console.log('\nDone — 5 files generated, one per size (Black only).');
console.log('Upload each file separately to Walmart Seller Center.');
