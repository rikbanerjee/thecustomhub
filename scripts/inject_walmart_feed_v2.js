import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_PATH = path.join(__dirname, '../walmart_template.xlsx');
const PRODUCTS_PATH = path.join(__dirname, '../src/data/products.json');
const OUTPUT_PATH = path.join(__dirname, '../walmart_upload_ready_final.xlsx');

const TARGET_SHEET_NAME = 'Product Content And Site Exp';
const GROUP_ROW_INDEX = 2; // Row 3
const HEADER_ROW_INDEX = 3; // Row 4
const DATA_START_ROW_INDEX = 6; 

const stripHtml = (html) => html ? html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : '';

try {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const walmartProducts = products.filter(p => p.publishTo?.walmart === true || p.id === 'dil-se-valentines-heart-mug');

  const workbook = XLSX.readFile(TEMPLATE_PATH, { cellStyles: true });
  const sheet = workbook.Sheets[TARGET_SHEET_NAME];
  
  // 1. Read Headers (Row 3 and 4)
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const groupHeaders = [];
  const mainHeaders = [];
  
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const gCell = sheet[XLSX.utils.encode_cell({ r: GROUP_ROW_INDEX, c: C })];
    const mCell = sheet[XLSX.utils.encode_cell({ r: HEADER_ROW_INDEX, c: C })];
    groupHeaders[C] = gCell ? gCell.v : null;
    mainHeaders[C] = mCell ? mCell.v : null;
  }

  // 2. Build ColMap (Hybrid)
  const colMap = {};
  let lastGroup = '';

  for (let i = 0; i < groupHeaders.length; i++) {
    // Group propagation (Merged cells)
    if (groupHeaders[i]) {
      lastGroup = groupHeaders[i].trim(); // Trim extra spaces
    }
    
    const header = mainHeaders[i] ? mainHeaders[i].trim() : '';
    
    // Key Logic: "Group.Header" OR just "Header"
    if (lastGroup && (header === 'Measure' || header === 'Unit')) {
        // Handle "Volume Capacity (volumeCapacity)" -> just "Volume Capacity"
        const cleanGroup = lastGroup.split('(')[0].trim();
        colMap[`${cleanGroup}.${header}`] = i;
    } else if (header) {
        colMap[header] = i;
    }
  }

  // Debug Keys
  // console.log('Mapped Keys:', Object.keys(colMap).filter(k => k.includes('Height') || k.includes('Key')));

  // 3. Fill Rows
  let currentRow = DATA_START_ROW_INDEX;

  walmartProducts.forEach(product => {
    const price = product.marketplace?.walmart?.price || product.price;
    const description = stripHtml(product.description);
    
    const set = (key, val) => {
      const idx = colMap[key];
      if (idx !== undefined) {
        sheet[XLSX.utils.encode_cell({ r: currentRow, c: idx })] = { t: 's', v: val };
      }
    };

    // --- IDENTITY ---
    set('SKU', product.sku || product.id);
    set('Product Name', product.title);
    set('Brand Name', product.vendor || 'The CustomHub');
    set('Selling Price', price);
    set('Product ID Type', 'GTIN');
    set('Product ID', 'custom'); 
    set('Manufacturer Part Number', product.sku || product.id);
    set('Spec Product Type', 'Cups & Mugs');
    
    // --- CONTENT ---
    set('Main Image URL', product.images[0]);
    set('Site Description', description.substring(0, 4000));
    
    const bullets = product.marketplace?.amazon?.bulletPoints || ['Premium Ceramic', 'Customizable Design', 'Dishwasher Safe'];
    set('Key Features (+)', bullets[0]);
    set('Key Features 1 (+)', bullets[1]);
    set('Key Features 2 (+)', bullets[2]);

    // --- COMPLIANCE ---
    set('Country of Origin - Substantial Transformation', 'United States'); 
    set('State Chemical Disclosure', 'None');
    set('Is Prop 65 Warning Required', 'No');
    set('Condition', 'New');
    set('Has Written Warranty', 'No');

    // --- DIMENSIONS & SPECS (Hybrid Map Keys) ---
    // Note: Groups found in scan: "Assembled Product Height", etc.
    
    set('Volume Capacity.Measure', 11);
    set('Volume Capacity.Unit', 'fl oz');

    set('Assembled Product Height.Measure', 4);
    set('Assembled Product Height.Unit', 'in');
    set('Assembled Product Width.Measure', 4);
    set('Assembled Product Width.Unit', 'in');
    set('Assembled Product Depth.Measure', 4);
    set('Assembled Product Depth.Unit', 'in');

    set('Shipping Weight (lbs)', 1);
    
    // Net Content (Header might be "Net Content" in Row 3?)
    // Debug scan didn't show Net Content in Group row, it showed in Row 3?
    // If it was in Row 3, my loop handles it via `colMap[header]`.
    set('Net Content.Measure', 1); // If "Net Content" is in header
    set('Net Content', 1); // Fallback
    set('Unit', 'Each'); // Dangerous global? No, context map protects us.
    // Try explicit if header is "Net Content" -> "Measure"
    set('Net Content.Unit', 'Each');

    set('Count Per Pack', 1);
    set('Multipack Quantity', 1);

    // Specifics
    set('Cup & Mug Type', 'Mug'); 
    set('Material (+)', 'Ceramic');
    set('Color', 'White');
    set('Color Category (+)', 'White');
    
    set('Site Start Date', new Date().toISOString().split('T')[0]);

    currentRow++;
  });

  range.e.r = Math.max(range.e.r, currentRow - 1);
  sheet['!ref'] = XLSX.utils.encode_range(range);

  XLSX.writeFile(workbook, OUTPUT_PATH);
  console.log(`\nSuccessfully injected data (v5) to ${OUTPUT_PATH}`);

} catch (err) {
  console.error('Error:', err);
}