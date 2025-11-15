#!/usr/bin/env node
/**
 * Test script to verify products and images are loading correctly
 * Run: node test-images.js
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read products.json
const productsPath = join(__dirname, 'src', 'data', 'products.json');
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

console.log('=== PRODUCTS.JSON VERIFICATION ===\n');
console.log('Total products:', productsData.length);
console.log('\n');

// Check first 5 products
console.log('=== FIRST 5 PRODUCTS ===\n');
productsData.slice(0, 5).forEach((product, index) => {
  console.log(`Product ${index + 1}:`);
  console.log('  ID:', product.id);
  console.log('  Title:', product.title.substring(0, 60) + '...');
  console.log('  Has images array:', Array.isArray(product.images));
  console.log('  Image count:', product.images?.length || 0);
  if (product.images && product.images.length > 0) {
    console.log('  First image URL:', product.images[0].substring(0, 80) + '...');
    console.log('  Image URL valid:', product.images[0].startsWith('http'));
    console.log('  Is Shopify CDN:', product.images[0].includes('cdn.shopify.com'));
  } else {
    console.log('  ⚠️  NO IMAGES FOUND');
    if (product.variants && product.variants.length > 0) {
      console.log('  Checking variants...');
      const variantImg = product.variants[0]?.variantImg;
      if (variantImg) {
        console.log('  Variant image found:', variantImg.substring(0, 80) + '...');
      }
    }
  }
  console.log('\n');
});

// Check for products without images
console.log('=== PRODUCTS WITHOUT IMAGES ===\n');
const productsWithoutImages = productsData.filter(p => 
  !p.images || !Array.isArray(p.images) || p.images.length === 0
);
console.log('Count:', productsWithoutImages.length);
if (productsWithoutImages.length > 0) {
  console.log('Product IDs:');
  productsWithoutImages.slice(0, 10).forEach(p => {
    console.log('  -', p.id);
  });
  if (productsWithoutImages.length > 10) {
    console.log(`  ... and ${productsWithoutImages.length - 10} more`);
  }
} else {
  console.log('✅ All products have images!');
}
console.log('\n');

// Check image URL patterns
console.log('=== IMAGE URL PATTERNS ===\n');
const imageUrls = productsData
  .flatMap(p => p.images || [])
  .filter(url => url);

const shopifyUrls = imageUrls.filter(url => url.includes('cdn.shopify.com'));
const otherUrls = imageUrls.filter(url => !url.includes('cdn.shopify.com'));

console.log('Total image URLs:', imageUrls.length);
console.log('Shopify CDN URLs:', shopifyUrls.length);
console.log('Other URLs:', otherUrls.length);
if (otherUrls.length > 0) {
  console.log('Other URL examples:');
  otherUrls.slice(0, 3).forEach(url => console.log('  -', url.substring(0, 80)));
}
console.log('\n');

// Summary
console.log('=== SUMMARY ===\n');
console.log('✅ Products loaded:', productsData.length);
console.log('✅ Products with images:', productsData.length - productsWithoutImages.length);
console.log('⚠️  Products without images:', productsWithoutImages.length);
console.log('✅ Shopify CDN images:', shopifyUrls.length);
console.log('\n');

if (productsWithoutImages.length === 0 && shopifyUrls.length > 0) {
  console.log('🎉 All products have Shopify CDN images!');
  console.log('The images should display correctly in the app.');
} else {
  console.log('⚠️  Some issues detected. Check above for details.');
}

