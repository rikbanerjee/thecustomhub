import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURATION
const PRODUCTS_PATH = path.join(__dirname, '../src/data/products.json');
const OUTPUT_PATH = path.join(__dirname, '../walmart_upload.xlsx');
const TARGET_PRODUCT_ID = 'dil-se-valentines-heart-mug'; 

// HELPER: Strip HTML
const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
};

try {
  const productsData = fs.readFileSync(PRODUCTS_PATH, 'utf8');
  const products = JSON.parse(productsData);

  const product = products.find(p => p.id === TARGET_PRODUCT_ID);

  if (!product) {
    console.error(`Product ID "${TARGET_PRODUCT_ID}" not found.`);
    process.exit(1);
  }

  // --- MAPPING LOGIC ---
  const price = product.marketplace?.walmart?.price || product.price;
  const description = stripHtml(product.description);
  
  let keyFeatures = [];
  if (product.marketplace?.amazon?.bulletPoints) {
    keyFeatures = product.marketplace.amazon.bulletPoints;
  } else {
    keyFeatures = ["Customizable Photo Mug", "High Quality Ceramic", "Unique Heart Handle"]; 
  }

  // --- EXCEL GENERATION ---
  
  // Walmart "Full Item Spec" Headers
  const headers = [
    'sku',
    'product_name',
    'product_id_type',
    'brand',
    'selling_price',
    'main_image_url',
    'product_description',
    'site_start_date',
    'multipack_quantity',
    'is_freight_charge',
    'shipping_weight_value',
    'shipping_weight_unit',
    'key_feature_1',
    'key_feature_2',
    'key_feature_3'
  ];

  const data = [
    headers,
    [
      product.sku || product.id,
      product.title,
      '', // GTIN Exemption usually leaves this blank
      product.vendor || 'The CustomHub',
      price,
      product.images[0],
      description,
      new Date().toISOString().split('T')[0],
      1,
      'No',
      1,
      'lb',
      keyFeatures[0] || '',
      keyFeatures[1] || '',
      keyFeatures[2] || ''
    ]
  ];

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Write file
  XLSX.writeFile(workbook, OUTPUT_PATH);
  
  console.log(`Successfully generated Walmart Excel feed for "${product.title}"`);
  console.log(`File saved to: ${OUTPUT_PATH}`);

} catch (err) {
  console.error('Error generating Excel feed:', err);
  process.exit(1);
}