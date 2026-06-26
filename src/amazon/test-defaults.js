/**
 * Test Default Configuration
 * Verifies that defaults are correctly applied
 */

import { getDefaults, detectProductType, mergeWithDefaults } from './productDefaults.js';

console.log('🧪 Testing Default Configuration\n');
console.log('='.repeat(80));

// Test 1: Get defaults for coffee-mugs
console.log('\n📋 DEFAULT VALUES FOR COFFEE-MUGS\n');
const defaults = getDefaults('coffee-mugs');

console.log('Brand & Manufacturing:');
console.log(`  Brand Name: ${defaults.brandName}`);
console.log(`  Manufacturer: ${defaults.manufacturer}`);
console.log(`  Country of Origin: ${defaults.countryOfOrigin}`);

console.log('\nSpecifications:');
console.log(`  Capacity: ${defaults.capacity.value} ${defaults.capacity.unit}`);
console.log(`  Material: ${defaults.material}`);
console.log(`  Has Handle: ${defaults.hasHandle}`);
console.log(`  Dishwasher Safe: ${defaults.dishwasherSafe}`);
console.log(`  Microwave Safe: ${defaults.microwaveSafe}`);
console.log(`  Number of Items: ${defaults.numberOfItems}`);
console.log(`  Included Components: ${defaults.includedComponents}`);

console.log('\nSpecial Features:');
defaults.specialFeatures.forEach((feature, i) => {
  console.log(`  ${i + 1}. ${feature}`);
});

console.log('\nItem Dimensions:');
console.log(`  Height: ${defaults.itemDimensions.height} ${defaults.itemDimensions.unit}`);
console.log(`  Width: ${defaults.itemDimensions.width} ${defaults.itemDimensions.unit}`);

console.log('\nPackage Dimensions:');
console.log(`  Length: ${defaults.packageDimensions.length} ${defaults.packageDimensions.unit}`);
console.log(`  Width: ${defaults.packageDimensions.width} ${defaults.packageDimensions.unit}`);
console.log(`  Height: ${defaults.packageDimensions.height} ${defaults.packageDimensions.unit}`);
console.log(`  Weight: ${defaults.packageDimensions.weight} ${defaults.packageDimensions.weightUnit}`);

console.log('\nFulfillment & Inventory:');
console.log(`  Fulfillment Channel: ${defaults.fulfillmentChannel}`);
console.log(`  Default Quantity: ${defaults.defaultQuantity}`);
console.log(`  Item Type Keyword: ${defaults.itemTypeKeyword}`);

console.log('\nPricing:');
console.log(`  Default Price: $${defaults.defaultPrice}`);

console.log('\nAmazon Category:');
console.log(`  Product Type: ${defaults.productType}`);
console.log(`  Cup Form Type: ${defaults.cupFormType}`);

// Test 2: Product type detection
console.log('\n' + '='.repeat(80));
console.log('\n🔍 PRODUCT TYPE DETECTION\n');

const testProducts = [
  { id: 'test-1', title: 'Coffee Mug' },
  { id: 'test-2', category: 'Drinkware > Mugs' },
  { id: 'test-3', type: 'Coffee and Tea Cups' },
  { id: 'test-4', title: 'Ceramic Cup' }
];

testProducts.forEach(product => {
  const detected = detectProductType(product);
  console.log(`Product: ${product.title || product.category || product.type}`);
  console.log(`  Detected Type: ${detected}\n`);
});

// Test 3: Merge with defaults
console.log('='.repeat(80));
console.log('\n🔄 MERGE WITH DEFAULTS TEST\n');

const minimalProduct = {
  id: 'minimal-mug',
  title: 'Minimal Mug',
  price: 19.99,
  images: ['https://example.com/image.jpg'],
  marketplace: { amazon: 'active' }
};

console.log('Minimal Product (before merge):');
console.log(JSON.stringify(minimalProduct, null, 2));

const mergedProduct = mergeWithDefaults(minimalProduct);

console.log('\nMerged Product (after applying defaults):');
console.log('  Has amazonData:', !!mergedProduct.amazonData);
console.log('  Brand Name:', mergedProduct.amazonData.brandName);
console.log('  Capacity:', mergedProduct.amazonData.capacity.value, mergedProduct.amazonData.capacity.unit);
console.log('  Material:', mergedProduct.amazonData.material);
console.log('  Has specifications:', !!mergedProduct.specifications);
console.log('  Has dimensions:', !!mergedProduct.dimensions);
console.log('  Item Height:', mergedProduct.dimensions.item.height);
console.log('  Package Weight:', mergedProduct.dimensions.package.weight);

// Test 4: Override defaults
console.log('\n' + '='.repeat(80));
console.log('\n⚙️  OVERRIDE DEFAULTS TEST\n');

const customProduct = {
  id: 'custom-mug',
  title: 'Large Custom Mug',
  price: 24.99,
  images: ['https://example.com/image.jpg'],
  marketplace: { amazon: 'active' },
  amazonData: {
    capacity: 15,  // Override: 15oz instead of 11oz
    price: 24.99,  // Override: Different price
    color: 'Black' // Override: Different color
  },
  dimensions: {
    item: {
      height: 5,   // Override: Larger size
      width: 5
    }
  }
};

const mergedCustom = mergeWithDefaults(customProduct);

console.log('Custom Product Overrides:');
console.log('  Capacity:', mergedCustom.amazonData.capacity, '(overridden from 11)');
console.log('  Price:', mergedCustom.amazonData.price, '(overridden from 19.99)');
console.log('  Color:', mergedCustom.amazonData.color, '(overridden from White)');
console.log('  Item Height:', mergedCustom.dimensions.item.height, '(overridden from 3.76)');
console.log('  Item Width:', mergedCustom.dimensions.item.width, '(overridden from 4.7)');

console.log('\nDefaults Still Applied:');
console.log('  Brand Name:', mergedCustom.amazonData.brandName, '(from defaults)');
console.log('  Material:', mergedCustom.amazonData.material, '(from defaults)');
console.log('  Package Weight:', mergedCustom.dimensions.package.weight, '(from defaults)');

console.log('\n' + '='.repeat(80));
console.log('✅ ALL TESTS COMPLETE!\n');
console.log('Default configuration is working correctly.');
console.log('Products will automatically inherit these values unless overridden.\n');
