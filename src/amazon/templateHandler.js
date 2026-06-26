/**
 * Amazon Template Handler
 * Handles reading and writing to the Amazon DRINKING_CUP.xlsm template
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllFieldMappings } from './fieldMapping.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Template configuration
const TEMPLATE_PATH = path.join(__dirname, '../../docs/amazon/DRINKING_CUP.xlsm');
const TARGET_SHEET_NAME = 'Template';
const HEADER_ROW_INDEX = 3; // Row 4 (0-indexed) - Human-readable headers
const TECHNICAL_HEADER_ROW_INDEX = 4; // Row 5 (0-indexed) - Technical headers
const DATA_START_ROW_INDEX = 5; // Row 6 (0-indexed) - First data row

/**
 * Read the Amazon template
 */
export function readTemplate() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(`Template not found at: ${TEMPLATE_PATH}`);
  }

  const workbook = XLSX.readFile(TEMPLATE_PATH, { cellStyles: true });
  const sheet = workbook.Sheets[TARGET_SHEET_NAME];

  if (!sheet) {
    throw new Error(`Sheet "${TARGET_SHEET_NAME}" not found in template.`);
  }

  return { workbook, sheet };
}

/**
 * Get column headers from the template
 */
export function getHeaders(sheet) {
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const headers = [];
  const technicalHeaders = [];

  // Read human-readable headers (Row 4)
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: HEADER_ROW_INDEX, c: C });
    const cell = sheet[cellAddress];
    headers[C] = cell ? cell.v : null;
  }

  // Read technical headers (Row 5)
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: TECHNICAL_HEADER_ROW_INDEX, c: C });
    const cell = sheet[cellAddress];
    technicalHeaders[C] = cell ? cell.v : null;
  }

  return { headers, technicalHeaders, range };
}

/**
 * Clear existing data rows (keep template structure)
 */
export function clearDataRows(sheet, range) {
  // Clear from DATA_START_ROW_INDEX to end of range
  for (let R = DATA_START_ROW_INDEX; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (sheet[cellRef]) {
        delete sheet[cellRef];
      }
    }
  }
}

/**
 * Find column index by header name
 */
function findColumnIndex(headers, fieldName) {
  // Try exact match first
  let index = headers.indexOf(fieldName);
  if (index !== -1) return index;

  // Try trimmed match
  index = headers.findIndex(h => h && h.trim() === fieldName.trim());
  if (index !== -1) return index;

  // Handle multiple columns with same name (e.g., "Other Image URL")
  // These are typically suffixed with _2, _3, etc.
  if (fieldName.includes('_')) {
    const baseName = fieldName.split('_')[0];
    const suffix = fieldName.split('_').slice(1).join('_');
    
    // Count how many times we've seen this base name
    let count = 0;
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] && headers[i].trim() === baseName.trim()) {
        count++;
        if (suffix === String(count + 1)) {
          return i;
        }
      }
    }
  }

  return -1;
}

/**
 * Set cell value in the sheet
 */
function setCellValue(sheet, row, col, value) {
  const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
  
  if (value === null || value === undefined || value === '') {
    // Don't set empty values
    return;
  }

  // Determine cell type
  let cellType = 's'; // string by default
  if (typeof value === 'number') {
    cellType = 'n';
  } else if (typeof value === 'boolean') {
    cellType = 'b';
  }

  sheet[cellAddress] = { t: cellType, v: value };
}

/**
 * Inject product data into the template
 */
export function injectProducts(sheet, headers, products) {
  let currentRow = DATA_START_ROW_INDEX;

  products.forEach(product => {
    const fieldMappings = getAllFieldMappings(product);

    // Set each field value
    Object.entries(fieldMappings).forEach(([fieldName, value]) => {
      const colIndex = findColumnIndex(headers, fieldName);
      
      if (colIndex !== -1 && value !== null && value !== undefined && value !== '') {
        setCellValue(sheet, currentRow, colIndex, value);
      }
    });

    currentRow++;
  });

  return currentRow;
}

/**
 * Update sheet range to include new data
 */
export function updateSheetRange(sheet, range, lastRow) {
  range.e.r = Math.max(range.e.r, lastRow - 1);
  sheet['!ref'] = XLSX.utils.encode_range(range);
}

/**
 * Write workbook to file
 */
export function writeWorkbook(workbook, outputPath) {
  XLSX.writeFile(workbook, outputPath);
}

/**
 * Convert Excel to TSV (Amazon upload format)
 * Strips ALL metadata rows - TSV should only have technical headers + data
 * Per Amazon requirements: TSV must start with technical headers (contribution_sku#1.value, etc.)
 */
export function convertToTSV(excelPath, tsvPath) {
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[TARGET_SHEET_NAME];

  if (!sheet) {
    throw new Error(`Sheet "${TARGET_SHEET_NAME}" not found.`);
  }

  // Convert sheet to array of arrays
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (jsonData.length < 6) {
    throw new Error('Template sheet does not have enough rows (expected at least 6).');
  }

  // Amazon TSV structure (per AMAZON_FEED_TROUBLESHOOTING.md):
  // Line 1: Technical Headers ONLY (contribution_sku#1.value, product_type#1.value, etc.)
  // Line 2+: Data Rows
  // 
  // DO NOT include:
  // - Settings row (Row 0)
  // - Instructions row (Row 1)
  // - Group headers row (Row 2)
  // - Human-readable headers row (Row 3)
  
  const technicalHeaders = jsonData[TECHNICAL_HEADER_ROW_INDEX]; // Row 5 (index 4)
  const dataRows = jsonData.slice(DATA_START_ROW_INDEX); // Row 6+ (index 5+)
  
  // Ensure all rows have the same number of columns as headers
  const numCols = technicalHeaders.length;
  
  const cleanData = [
    technicalHeaders,
    ...dataRows.map(row => {
      // Pad or trim rows to match header count
      const paddedRow = [...row];
      while (paddedRow.length < numCols) {
        paddedRow.push('');
      }
      return paddedRow.slice(0, numCols);
    })
  ];

  // Convert to TSV
  const tsvContent = cleanData
    .map(row => row.map(cell => cell === null || cell === undefined ? '' : cell).join('\t'))
    .join('\n');

  fs.writeFileSync(tsvPath, tsvContent, 'utf8');
}
