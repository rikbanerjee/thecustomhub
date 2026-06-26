import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../output/amazon');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'dhurander-tee-amazon-upload.xlsx');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Images ───────────────────────────────────────────────────────────────────
const BASE = 'https://firebasestorage.googleapis.com/v0/b/thecustomhub-efb8a.firebasestorage.app/o/images%2Fdhurander-bollywood-tee%2F';
const img = (f) => `${BASE}${f}?alt=media`;
const MAIN_IMG  = img('Dhurandhar-tee-main-blk.jpeg');
const IMG2      = img('Dhurander-tee-front-blk.jpg');
const IMG3      = img('Dhurander-tee-lifestyle.jpg');
const IMG4      = img('Dhurander-Ghayal-Hoon.jpg');
const IMG5      = img('Dhurander-tshirt-detail.jpg');
const IMG6      = img('dhurandhar-tee-social.jpg');

// ── Core content ─────────────────────────────────────────────────────────────
const PARENT_SKU     = 'TCH-DHURANDER-TEE';
const BRAND          = 'Green-Chili';
const MANUFACTURER   = 'The CustomHub';
const ITEM_NAME      = 'Dhurander Bollywood Graphic T-Shirt – Unisex Hindi Film Fan Tee – NRI Desi Streetwear – 100% Cotton – S to 2XL – Gift for Indian Movie Lovers';
const ITEM_TYPE_KW   = 'novelty-graphic-tees';
const DEPARTMENT     = 'unisex-adult';
const DESCRIPTION    = 'Some films don\'t just entertain — they become identity. Dhurander (धुरंधर) is one of them. This graphic tee is our love letter to the Bollywood blockbuster and to every desi who watched it back-to-back in a packed NRI theatre, quoting dialogues before the subtitles could catch up. Crafted from premium ring-spun cotton with a classic unisex fit, this tee is as comfortable on a lazy Sunday as it is turning heads at a desi house party. The CustomHub is a New England Design Studio rooted in the diaspora experience — we make clothes that let you carry your culture without explanation.';
const KEYWORDS       = 'dhurander t-shirt, bollywood graphic tee, hindi film fan shirt, NRI streetwear, desi t-shirt, indian diaspora clothing, bollywood fan gift, romanized hindi tee, indian movie merchandise, desi pop culture shirt, bollywood fan merch, indian graphic tee, hindi tshirt, desi gift for him, desi gift for her, bollywood fan clothing, indian movie tee, NRI gift USA, desi fashion, bollywood streetwear';
const BP1 = 'BOLD BOLLYWOOD FAN DESIGN - Inspired by the blockbuster Dhurander (धुरंधर), this graphic tee channels the raw energy and cinematic power of the film — a must-have statement piece for every die-hard Bollywood fan in the diaspora';
const BP2 = 'PREMIUM 100% RING-SPUN COTTON - Medium-weight (~5.3 oz/sq yd), pre-shrunk fabric delivers an ultra-soft feel and a comfortable fit that holds up wash after wash — no cracking, no fading, just clean desi style';
const BP3 = 'UNISEX CLASSIC FIT - Crew neck, short sleeve silhouette that works for men and women — available in sizes S through 2XL with a true-to-size cut; great as everyday wear or standout streetwear';
const BP4 = 'DESI STREETWEAR FOR THE GLOBAL INDIAN DIASPORA - Designed by The CustomHub, a New England brand rooted in NRI culture — Romanized Hindi typography meets modern streetwear aesthetics so you can wear your culture with pride, wherever you are';
const BP5 = 'PERFECT DESI GIFT - Ideal birthday, Diwali, or "just because" gift for Bollywood fans, NRIs, and Indian movie lovers; arrives ready to gift — no wrapping needed, just unbox and rep the vibe';

// ── Column headers (Amazon Clothing flat file standard) ────────────────────
const HEADERS = [
  'feed_product_type',      // shirt
  'item_sku',
  'brand_name',
  'item_name',
  'external_product_id',    // UPC/GTIN — leave blank for GTIN exemption
  'external_product_id_type',
  'standard_price',
  'quantity',
  'main_image_url',
  'other_image_url1',
  'other_image_url2',
  'other_image_url3',
  'other_image_url4',
  'other_image_url5',
  'bullet_point1',
  'bullet_point2',
  'bullet_point3',
  'bullet_point4',
  'bullet_point5',
  'generic_keywords',
  'product_description',
  'manufacturer',
  'material_type1',
  'color_name',
  'color_map',
  'size_name',
  'size_map',
  'department_name',
  'fit_type',
  'sleeve_type',
  'collar_style',
  'item_type_keyword',
  'variation_theme',        // SizeColor on parent
  'parent_child',           // parent / child
  'parent_sku',             // blank on parent, set on children
  'relationship_type',      // Variation
  'country_of_origin',
  'condition_type',
  'fulfillment_channel',
  'item_package_quantity',
  'number_of_items',
  'are_batteries_required',
  'is_adult_product',
];

// ── Helper to build a row object ──────────────────────────────────────────────
const row = (overrides) => {
  const base = {
    feed_product_type: 'shirt',
    item_sku: '',
    brand_name: BRAND,
    item_name: ITEM_NAME,
    external_product_id: '',
    external_product_id_type: '',
    standard_price: '',
    quantity: '',
    main_image_url: MAIN_IMG,
    other_image_url1: IMG2,
    other_image_url2: IMG3,
    other_image_url3: IMG4,
    other_image_url4: IMG5,
    other_image_url5: IMG6,
    bullet_point1: BP1,
    bullet_point2: BP2,
    bullet_point3: BP3,
    bullet_point4: BP4,
    bullet_point5: BP5,
    generic_keywords: KEYWORDS,
    product_description: DESCRIPTION,
    manufacturer: MANUFACTURER,
    material_type1: 'Cotton',
    color_name: '',
    color_map: '',
    size_name: '',
    size_map: '',
    department_name: DEPARTMENT,
    fit_type: 'Regular',
    sleeve_type: 'Short Sleeve',
    collar_style: 'Crew Neck',
    item_type_keyword: ITEM_TYPE_KW,
    variation_theme: '',
    parent_child: '',
    parent_sku: '',
    relationship_type: 'Variation',
    country_of_origin: 'US',
    condition_type: 'New',
    fulfillment_channel: 'DEFAULT',
    item_package_quantity: 1,
    number_of_items: 1,
    are_batteries_required: 'No',
    is_adult_product: 'No',
  };
  return { ...base, ...overrides };
};

// ── Parent row ────────────────────────────────────────────────────────────────
const parentRow = row({
  item_sku: PARENT_SKU,
  variation_theme: 'SizeColor',
  parent_child: 'parent',
  standard_price: '',    // price set on children
  quantity: '',
});

// ── Child variants ────────────────────────────────────────────────────────────
const variants = [
  { sku: 'TCH-DHURANDER-TEE-BLK-S',   color: 'Black', size: 'S',   price: 20.99, qty: 20 },
  { sku: 'TCH-DHURANDER-TEE-BLK-M',   color: 'Black', size: 'M',   price: 20.99, qty: 20 },
  { sku: 'TCH-DHURANDER-TEE-BLK-L',   color: 'Black', size: 'L',   price: 20.99, qty: 20 },
  { sku: 'TCH-DHURANDER-TEE-BLK-XL',  color: 'Black', size: 'XL',  price: 20.99, qty: 20 },
  { sku: 'TCH-DHURANDER-TEE-BLK-2XL', color: 'Black', size: '2XL', price: 22.99, qty: 10 },
  { sku: 'TCH-DHURANDER-TEE-WHT-S',   color: 'White', size: 'S',   price: 20.99, qty: 20 },
  { sku: 'TCH-DHURANDER-TEE-WHT-M',   color: 'White', size: 'M',   price: 20.99, qty: 20 },
  { sku: 'TCH-DHURANDER-TEE-WHT-L',   color: 'White', size: 'L',   price: 20.99, qty: 20 },
  { sku: 'TCH-DHURANDER-TEE-WHT-XL',  color: 'White', size: 'XL',  price: 20.99, qty: 20 },
  { sku: 'TCH-DHURANDER-TEE-WHT-2XL', color: 'White', size: '2XL', price: 22.99, qty: 10 },
];

const childRows = variants.map(v => row({
  item_sku: v.sku,
  standard_price: v.price,
  quantity: v.qty,
  color_name: v.color,
  color_map: v.color,
  size_name: v.size,
  size_map: v.size,
  parent_child: 'child',
  parent_sku: PARENT_SKU,
  variation_theme: '',
}));

// ── Build sheet ───────────────────────────────────────────────────────────────
const allRows = [parentRow, ...childRows];
const sheetData = [
  HEADERS,
  ...allRows.map(r => HEADERS.map(h => r[h] ?? '')),
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(sheetData);

// Auto-width
ws['!cols'] = HEADERS.map((h, i) => ({
  wch: Math.max(h.length, ...sheetData.slice(1).map(r => String(r[i] ?? '').length))
}));

// Freeze header row
ws['!freeze'] = { xSplit: 0, ySplit: 1 };

XLSX.utils.book_append_sheet(wb, ws, 'Amazon Upload');

// ── Also write a TSV (Amazon's preferred flat file format) ────────────────────
const tsvPath = OUTPUT_FILE.replace('.xlsx', '.tsv');
const tsvContent = sheetData.map(r => r.join('\t')).join('\n');
fs.writeFileSync(tsvPath, tsvContent, 'utf8');

XLSX.writeFile(wb, OUTPUT_FILE);

console.log(`xlsx → ${OUTPUT_FILE}`);
console.log(`tsv  → ${tsvPath}`);
console.log(`Rows: 1 parent + ${variants.length} child variants`);
console.log('\nUpload instructions:');
console.log('  Amazon Seller Central → Catalog → Add Products → Spreadsheet upload');
console.log('  Use the TSV file for upload (Amazon prefers .tsv for flat files)');
console.log('  Select product type: Clothing (shirt)');
