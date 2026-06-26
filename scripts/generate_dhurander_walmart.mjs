import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../output/walmart');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'dhurander-tee-walmart-upload.xlsx');

// Ensure output dir exists (overwrite existing file if present)
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const BASE_URL = 'https://firebasestorage.googleapis.com/v0/b/thecustomhub-efb8a.firebasestorage.app/o/images%2Fdhurander-bollywood-tee%2F';
const img = (name) => `${BASE_URL}${name}?alt=media`;

const MAIN_IMAGE    = img('Dhurandhar-tee-main-blk.jpeg');
const IMG_FRONT     = img('Dhurander-tee-front-blk.jpg');
const IMG_LIFESTYLE = img('Dhurander-tee-lifestyle.jpg');
const IMG_GHAYAL    = img('Dhurander-Ghayal-Hoon.jpg');

const PRODUCT_NAME  = 'The CustomHub Dhurandhar Bollywood Ghatak Hoon Tee, Unisex Fan Tee, 100% Cotton';
const BRAND         = 'The CustomHub';
const SHORT_DESC    = 'Rep the grit of Bollywood with the Ghayal Hoon Isiliye Ghatak Hoon graphic tee. Inspired by Dhurandhar 2, this premium 100% cotton shirt is built for comfort and style. Ideal for the Indian diaspora looking for high-quality cultural apparel.';
const LONG_DESC     = 'Some films become part of who you are. The Dhurandhar Ghatak Hoon Isiliye Ghatak Hoon Graphic Tee from The CustomHub is a fan tribute to the Bollywood blockbuster — bold, unapologetic, and built for the Indian diaspora.\n\nMade from 100% premium ring-spun cotton (~5.3 oz/sq yd), this pre-shrunk unisex tee delivers a comfortable, true-to-size fit and vibrant print that won\'t crack or fade. Perfect as everyday streetwear or as a standout piece for desi events, Bollywood nights, and gifting.\n\nThe CustomHub is a New England personalization studio designing Romanized Hindi and Bengali streetwear for the global Indian community.';
const FABRIC_CARE   = 'Machine Wash Cold, Tumble Dry Low, Do Not Bleach, Do Not Iron Directly on Print';
const TODAY         = new Date().toISOString().split('T')[0];

const KEY_FEATURE_1 = '100% ring-spun cotton, pre-shrunk, medium weight (~5.3 oz/sq yd) — soft, durable, and comfortable';
const KEY_FEATURE_2 = 'Dhurandhar (धुरंधर) Bollywood fan graphic — bold Romanized Hindi typography design';
const KEY_FEATURE_3 = 'Unisex classic fit with crew neck and short sleeves — available in S, M, L, XL, 2XL';
const KEY_FEATURE_4 = 'Vibrant durable print — no cracking or fading after multiple washes';
const KEY_FEATURE_5 = 'Perfect gift for Bollywood fans, NRIs, and Indian diaspora — Diwali, birthdays, and everyday desi pride';

const headers = [
  'SKU',
  'Product Name',
  'Brand Name',
  'Selling Price',
  'Product ID Type',
  'Spec Product Type',
  'Main Image URL',
  'Additional Image URL 1',
  'Additional Image URL 2',
  'Additional Image URL 3',
  'Short Description',
  'Site Description',
  'Key Features 1',
  'Key Features 2',
  'Key Features 3',
  'Key Features 4',
  'Key Features 5',
  'Color',
  'Color Category',
  'Size',
  'Size Type',
  'Gender',
  'Age Group',
  'Material',
  'Fabric Care Instructions',
  'Country of Origin',
  'Condition',
  'Multipack Quantity',
  'Shipping Weight (lbs)',
  'Site Start Date',
  'Is Prop 65 Warning Required',
  'Has Written Warranty',
];

// Variants: Black S/M/L/XL/2XL, White S/M/L/XL/2XL
const variants = [
  { sku: 'TCH-DHURANDER-TEE-BLK-S',   color: 'Black', size: 'S',   price: 20.99 },
  { sku: 'TCH-DHURANDER-TEE-BLK-M',   color: 'Black', size: 'M',   price: 20.99 },
  { sku: 'TCH-DHURANDER-TEE-BLK-L',   color: 'Black', size: 'L',   price: 20.99 },
  { sku: 'TCH-DHURANDER-TEE-BLK-XL',  color: 'Black', size: 'XL',  price: 20.99 },
  { sku: 'TCH-DHURANDER-TEE-BLK-2XL', color: 'Black', size: '2XL', price: 22.99 },
  { sku: 'TCH-DHURANDER-TEE-WHT-S',   color: 'White', size: 'S',   price: 20.99 },
  { sku: 'TCH-DHURANDER-TEE-WHT-M',   color: 'White', size: 'M',   price: 20.99 },
  { sku: 'TCH-DHURANDER-TEE-WHT-L',   color: 'White', size: 'L',   price: 20.99 },
  { sku: 'TCH-DHURANDER-TEE-WHT-XL',  color: 'White', size: 'XL',  price: 20.99 },
  { sku: 'TCH-DHURANDER-TEE-WHT-2XL', color: 'White', size: '2XL', price: 22.99 },
];

const rows = [headers];

for (const v of variants) {
  rows.push([
    v.sku,
    `${PRODUCT_NAME} - ${v.color} - ${v.size}`,
    BRAND,
    v.price,
    'GTIN',
    'Shirts',
    MAIN_IMAGE,
    IMG_FRONT,
    IMG_LIFESTYLE,
    IMG_GHAYAL,
    SHORT_DESC,
    LONG_DESC,
    KEY_FEATURE_1,
    KEY_FEATURE_2,
    KEY_FEATURE_3,
    KEY_FEATURE_4,
    KEY_FEATURE_5,
    v.color,
    v.color,
    v.size,
    'Regular',
    'Unisex',
    'Adult',
    'Cotton',
    FABRIC_CARE,
    'United States',
    'New',
    1,
    0.5,
    TODAY,
    'No',
    'No',
  ]);
}

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(rows);

// Auto-width columns
const colWidths = headers.map((h, i) => ({
  wch: Math.max(h.length, ...rows.slice(1).map(r => String(r[i] ?? '').length))
}));
ws['!cols'] = colWidths;

XLSX.utils.book_append_sheet(wb, ws, 'Walmart Upload');
XLSX.writeFile(wb, OUTPUT_FILE);

console.log(`Generated: ${OUTPUT_FILE}`);
console.log(`Rows: ${variants.length} variants`);
