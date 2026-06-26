/**
 * Amazon Feed Generator
 * Main orchestrator for generating Amazon product feeds
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  readTemplate,
  getHeaders,
  clearDataRows,
  injectProducts,
  updateSheetRange,
  writeWorkbook,
  convertToTSV
} from './templateHandler.js';
import { detectProductType, getDefaults } from './productDefaults.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTS_PATH = path.join(__dirname, '../data/products.json');
const OUTPUT_DIR = path.join(__dirname, '../../output/amazon');
const OUTPUT_EXCEL_PATH = path.join(OUTPUT_DIR, 'amazon_upload_ready.xlsm');
const OUTPUT_TSV_PATH = path.join(OUTPUT_DIR, 'amazon_upload_ready.tsv');

/**
 * Filter products for Amazon.
 *
 * The product schema marks channels via `marketplace: { amazon: "active" | "inactive" }`.
 * A product is included only when `marketplace.amazon === "active"`.
 */
function filterAmazonProducts(products) {
  return products.filter(product => product.marketplace?.amazon === 'active');
}

/**
 * Validate product data
 */
function validateProduct(product) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!product.id && !product.sku) {
    errors.push('Missing SKU/ID');
  }
  if (!product.title) {
    errors.push('Missing title');
  }
  if (!product.price && !product.amazonData?.price) {
    errors.push('Missing price');
  }
  if (!product.images || product.images.length === 0) {
    errors.push('Missing images');
  }

  // Recommended fields
  if (!product.description) {
    warnings.push('Missing description');
  }
  if (!product.amazonData) {
    warnings.push('Missing amazonData block (title, bulletPoints, keywords) - required for a quality Amazon listing');
  } else if (!product.amazonData.bulletPoints || product.amazonData.bulletPoints.length === 0) {
    warnings.push('Missing bullet points - these are highly recommended for Amazon');
  }
  if (!product.specifications?.capacity) {
    warnings.push('Missing capacity specification');
  }
  if (!product.specifications?.material) {
    warnings.push('Missing material specification');
  }

  return { errors, warnings };
}

/**
 * Generate Amazon feed
 */
export async function generateAmazonFeed(options = {}) {
  const {
    productsPath = PRODUCTS_PATH,
    outputExcelPath = OUTPUT_EXCEL_PATH,
    outputTsvPath = OUTPUT_TSV_PATH,
    generateTsv = true,
    verbose = true
  } = options;

  try {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // 1. Load products
    if (verbose) console.log('📦 Loading products from:', productsPath);
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const amazonProducts = filterAmazonProducts(productsData);

    if (amazonProducts.length === 0) {
      throw new Error('No products found for Amazon. Mark products with marketplace.amazon = "active"');
    }

    if (verbose) {
      console.log(`✅ Found ${amazonProducts.length} product(s) for Amazon:`);
      amazonProducts.forEach(p => {
        const productType = detectProductType(p);
        console.log(`   - ${p.id || p.sku}: ${p.title}`);
        console.log(`     Product Type: ${productType} (using defaults)`);
      });
    }

    // 2. Validate products
    if (verbose) console.log('\n🔍 Validating products...');
    const validationResults = amazonProducts.map(product => ({
      product,
      validation: validateProduct(product)
    }));

    let hasErrors = false;
    validationResults.forEach(({ product, validation }) => {
      if (validation.errors.length > 0) {
        console.error(`\n❌ ${product.id || product.sku}:`);
        validation.errors.forEach(err => console.error(`   ERROR: ${err}`));
        hasErrors = true;
      }
      if (validation.warnings.length > 0 && verbose) {
        console.warn(`\n⚠️  ${product.id || product.sku}:`);
        validation.warnings.forEach(warn => console.warn(`   WARNING: ${warn}`));
      }
    });

    if (hasErrors) {
      throw new Error('Product validation failed. Fix errors above and try again.');
    }

    // 3. Read template
    if (verbose) console.log('\n📄 Reading Amazon template...');
    const { workbook, sheet } = readTemplate();
    const { headers, technicalHeaders, range } = getHeaders(sheet);
    
    if (verbose) {
      console.log(`✅ Template loaded: ${headers.filter(h => h).length} columns found`);
    }

    // 4. Clear existing data
    if (verbose) console.log('🧹 Clearing existing data rows...');
    clearDataRows(sheet, range);

    // 5. Inject product data
    if (verbose) console.log('💉 Injecting product data...');
    const lastRow = injectProducts(sheet, headers, amazonProducts);
    
    if (verbose) {
      console.log(`✅ Injected ${amazonProducts.length} product(s) into template`);
    }

    // 6. Update sheet range
    updateSheetRange(sheet, range, lastRow);

    // 7. Write Excel file
    if (verbose) console.log(`\n💾 Writing Excel file to: ${outputExcelPath}`);
    writeWorkbook(workbook, outputExcelPath);
    console.log('✅ Excel file created successfully!');

    // 8. Generate TSV if requested
    if (generateTsv) {
      if (verbose) console.log(`\n🔄 Converting to TSV format: ${outputTsvPath}`);
      convertToTSV(outputExcelPath, outputTsvPath);
      console.log('✅ TSV file created successfully!');
      console.log('\n📋 Upload the TSV file to Amazon Seller Central:');
      console.log('   Catalog > Add Products via Upload > Upload Your File');
    }

    // 9. Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 AMAZON FEED GENERATION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`Products processed: ${amazonProducts.length}`);
    console.log(`Excel output: ${outputExcelPath}`);
    if (generateTsv) {
      console.log(`TSV output: ${outputTsvPath}`);
    }
    console.log('='.repeat(60));

    return {
      success: true,
      productsProcessed: amazonProducts.length,
      excelPath: outputExcelPath,
      tsvPath: generateTsv ? outputTsvPath : null
    };

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (options.verbose) {
      console.error('\nStack trace:', error.stack);
    }
    throw error;
  }
}

/**
 * CLI entry point
 */
export async function runCLI() {
  console.log('🚀 Amazon Feed Generator\n');
  
  try {
    await generateAmazonFeed({
      verbose: true,
      generateTsv: true
    });
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCLI();
}
