/**
 * Test script for Amazon feed generator
 * Tests the field mapping and template handling without generating files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllFieldMappings } from './fieldMapping.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load example product
const examplePath = path.join(__dirname, 'example-product.json');
const product = JSON.parse(fs.readFileSync(examplePath, 'utf8'));

console.log('🧪 Testing Amazon Field Mapping\n');
console.log('Product:', product.id);
console.log('Title:', product.title);
console.log('\n' + '='.repeat(80) + '\n');

// Get all field mappings
const mappings = getAllFieldMappings(product);

// Group fields by category
const categories = {
  'Required Fields': [
    'SKU',
    'Product Type',
    'Listing Action',
    'Item Name',
    'Brand Name',
    'Main Image URL',
    'Item Condition',
    'Fulfillment Channel Code (US)',
    'Quantity (US)',
    'Your Price USD (Sell on Amazon, US)'
  ],
  'Product Details': [
    'Product Description',
    'Manufacturer',
    'Item Type Keyword'
  ],
  'Images': [
    'Main Image URL',
    'Other Image URL',
    'Other Image URL_2'
  ],
  'Bullet Points': [
    'Bullet Point',
    'Bullet Point_2',
    'Bullet Point_3',
    'Bullet Point_4',
    'Bullet Point_5'
  ],
  'Keywords & Features': [
    'Generic Keyword',
    'Special Features',
    'Special Features_2',
    'Special Features_3'
  ],
  'Attributes': [
    'Material',
    'Number of Items',
    'Color',
    'Capacity',
    'Capacity Unit',
    'Included Components',
    'Drinking Cup Form Type',
    'Has Handle',
    'Is the item dishwasher safe?'
  ],
  'Dimensions': [
    'Item Height',
    'Item Height Unit',
    'Item Width Widest Point',
    'Item Width Unit',
    'Item Package Length',
    'Package Length Unit',
    'Package Weight',
    'Package Weight Unit'
  ],
  'Compliance': [
    'Country of Origin',
    'Are batteries required?',
    'Are batteries included?',
    'Is This Product Subject To Buyer Age Restrictions',
    'California Proposition 65 Warning Type',
    'Contains PFAS',
    'Contains Battery or Cell'
  ]
};

// Display mappings by category
Object.entries(categories).forEach(([category, fields]) => {
  console.log(`📋 ${category}`);
  console.log('-'.repeat(80));
  
  fields.forEach(field => {
    const value = mappings[field];
    if (value !== null && value !== undefined && value !== '') {
      const displayValue = typeof value === 'string' && value.length > 60 
        ? value.substring(0, 60) + '...' 
        : value;
      console.log(`  ${field}: ${displayValue}`);
    } else {
      console.log(`  ${field}: [EMPTY]`);
    }
  });
  
  console.log('');
});

// Validation summary
console.log('='.repeat(80));
console.log('✅ VALIDATION SUMMARY\n');

const requiredFields = categories['Required Fields'];
const missingRequired = requiredFields.filter(f => {
  const val = mappings[f];
  return val === null || val === undefined || val === '';
});

const recommendedFields = [
  ...categories['Bullet Points'],
  'Product Description',
  'Generic Keyword'
];
const missingRecommended = recommendedFields.filter(f => {
  const val = mappings[f];
  return val === null || val === undefined || val === '';
});

if (missingRequired.length === 0) {
  console.log('✅ All required fields present');
} else {
  console.log('❌ Missing required fields:');
  missingRequired.forEach(f => console.log(`   - ${f}`));
}

if (missingRecommended.length === 0) {
  console.log('✅ All recommended fields present');
} else {
  console.log('⚠️  Missing recommended fields:');
  missingRecommended.forEach(f => console.log(`   - ${f}`));
}

console.log('\n' + '='.repeat(80));
console.log('🎉 Test complete! Ready to generate Amazon feed.');
console.log('Run: npm run amazon:generate');
