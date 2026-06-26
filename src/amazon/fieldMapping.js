/**
 * Amazon Field Mapping Configuration
 * Maps product data to Amazon DRINKING_CUP template columns
 */

import { detectProductType, getDefaultValue } from './productDefaults.js';

/**
 * Get Amazon-specific data (supports both marketplace.amazon and amazonData)
 */
function getAmazonData(product, field) {
  // Try amazonData first (new structure)
  if (product.amazonData && product.amazonData[field] !== undefined) {
    return product.amazonData[field];
  }
  // Fall back to marketplace.amazon (nested structure)
  if (product.marketplace?.amazon && typeof product.marketplace.amazon === 'object' && product.marketplace.amazon[field] !== undefined) {
    return product.marketplace.amazon[field];
  }
  return null;
}

/**
 * Get value with default fallback
 */
function getValueWithDefault(product, field, path) {
  const productType = detectProductType(product);
  const defaultValue = getDefaultValue(productType, field);
  
  // Try to get from product data first
  if (path) {
    const parts = path.split('.');
    let value = product;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) break;
    }
    if (value !== undefined) return value;
  }
  
  // Fall back to default
  return defaultValue;
}

/**
 * Get the value for a specific Amazon field
 * @param {Object} product - Product object from products.json
 * @param {string} fieldName - Amazon field name
 * @returns {string|number|null} - Value for the field
 */
export function getFieldValue(product, fieldName) {
  const productType = detectProductType(product);
  
  const mapping = {
    // === REQUIRED FIELDS ===
    'SKU': product.sku || product.id,
    'Product Type': 'DRINKING_CUP',  // Must be uppercase as per Amazon template
    'Listing Action': 'Create or Replace (Full Update)',  // Must match exact Amazon value
    'Item Name': getAmazonTitle(product),
    'Brand Name': getAmazonData(product, 'brandName') || getValueWithDefault(product, 'brandName') || product.vendor || 'Green-Chili',
    'Main Image URL': product.images?.[0] || '',
    'Item Condition': 'new',  // Must be lowercase as per Amazon
    'Fulfillment Channel Code (US)': getAmazonData(product, 'fulfillmentChannel') || getValueWithDefault(product, 'fulfillmentChannel') || 'DEFAULT',
    'Quantity (US)': getAmazonData(product, 'quantity') || getValueWithDefault(product, 'defaultQuantity') || 20,
    'Your Price USD (Sell on Amazon, US)': getAmazonData(product, 'price') || product.price || getValueWithDefault(product, 'defaultPrice') || 19.99,

    // === PRODUCT DETAILS ===
    'Product Description': stripHtml(product.description).substring(0, 2000),
    'Manufacturer': getAmazonData(product, 'manufacturer') || getValueWithDefault(product, 'manufacturer') || 'The CustomHub',
    'Item Type Keyword': getAmazonData(product, 'itemTypeKeyword') || getValueWithDefault(product, 'itemTypeKeyword') || 'coffee-mugs',
    
    // === IMAGES (Additional) ===
    'Other Image URL': product.images?.[1] || '',
    'Other Image URL_2': product.images?.[2] || '',
    'Other Image URL_3': product.images?.[3] || '',
    'Other Image URL_4': product.images?.[4] || '',
    'Other Image URL_5': product.images?.[5] || '',
    'Other Image URL_6': product.images?.[6] || '',
    'Other Image URL_7': product.images?.[7] || '',
    'Other Image URL_8': product.images?.[8] || '',

    // === BULLET POINTS ===
    'Bullet Point': getBulletPoint(product, 0),
    'Bullet Point_2': getBulletPoint(product, 1),
    'Bullet Point_3': getBulletPoint(product, 2),
    'Bullet Point_4': getBulletPoint(product, 3),
    'Bullet Point_5': getBulletPoint(product, 4),

    // === KEYWORDS & FEATURES ===
    'Generic Keyword': getKeywords(product),
    'Special Features': getSpecialFeature(product, 0),
    'Special Features_2': getSpecialFeature(product, 1),
    'Special Features_3': getSpecialFeature(product, 2),
    'Special Features_4': getSpecialFeature(product, 3),
    'Special Features_5': getSpecialFeature(product, 4),

    // === ATTRIBUTES ===
    'Material': product.specifications?.material || getAmazonData(product, 'material') || getValueWithDefault(product, 'material') || 'Ceramic',
    'Number of Items': product.specifications?.numberOfItems || getValueWithDefault(product, 'numberOfItems') || 1,
    'Color': product.specifications?.color || getAmazonData(product, 'color') || 'White',
    'Capacity': product.specifications?.capacity?.value || getAmazonData(product, 'capacity') || getValueWithDefault(product, 'capacity')?.value || 11,
    'Capacity Unit': product.specifications?.capacity?.unit || getValueWithDefault(product, 'capacity')?.unit || 'fl oz',
    'Included Components': product.specifications?.includedComponents || getAmazonData(product, 'includedComponents') || getValueWithDefault(product, 'includedComponents') || '1 Mug',
    'Drinking Cup Form Type': getAmazonData(product, 'cupFormType') || getValueWithDefault(product, 'cupFormType') || 'Mug',
    'Has Handle': product.specifications?.hasHandle !== undefined ? (product.specifications.hasHandle ? 'Yes' : 'No') : (getValueWithDefault(product, 'hasHandle') ? 'Yes' : 'No'),
    'Is the item dishwasher safe?': product.specifications?.dishwasherSafe !== undefined ? (product.specifications.dishwasherSafe ? 'Yes' : 'No') : (getValueWithDefault(product, 'dishwasherSafe') ? 'Yes' : ''),

    // === DIMENSIONS ===
    'Item Height': product.dimensions?.item?.height || getValueWithDefault(product, 'itemDimensions')?.height || '',
    'Item Height Unit': product.dimensions?.item?.unit || getValueWithDefault(product, 'itemDimensions')?.unit || 'inches',
    'Item Width Widest Point': product.dimensions?.item?.width || getValueWithDefault(product, 'itemDimensions')?.width || '',
    'Item Width Unit': product.dimensions?.item?.unit || getValueWithDefault(product, 'itemDimensions')?.unit || 'inches',
    'Item Package Length': product.dimensions?.package?.length || getValueWithDefault(product, 'packageDimensions')?.length || '',
    'Package Length Unit': product.dimensions?.package?.unit || getValueWithDefault(product, 'packageDimensions')?.unit || 'inches',
    'Item Package Width': product.dimensions?.package?.width || getValueWithDefault(product, 'packageDimensions')?.width || '',
    'Package Width Unit': product.dimensions?.package?.unit || getValueWithDefault(product, 'packageDimensions')?.unit || 'inches',
    'Item Package Height': product.dimensions?.package?.height || getValueWithDefault(product, 'packageDimensions')?.height || '',
    'Package Height Unit': product.dimensions?.package?.unit || getValueWithDefault(product, 'packageDimensions')?.unit || 'inches',
    'Package Weight': product.dimensions?.package?.weight || getValueWithDefault(product, 'packageDimensions')?.weight || 0.4,
    'Package Weight Unit': product.dimensions?.package?.weightUnit || getValueWithDefault(product, 'packageDimensions')?.weightUnit || 'pounds',

    // === COMPLIANCE ===
    'Country of Origin': product.countryOfOrigin || getAmazonData(product, 'countryOfOrigin') || getValueWithDefault(product, 'countryOfOrigin') || 'US',
    'Are batteries required?': 'No',
    'Are batteries included?': 'No',
    'Is This Product Subject To Buyer Age Restrictions': 'No',
    'California Proposition 65 Warning Type': getAmazonData(product, 'prop65Warning') || '',
    'Contains PFAS': 'No',
    'Contains Battery or Cell': 'No',
  };

  return mapping[fieldName] !== undefined ? mapping[fieldName] : '';
}

/**
 * Get Amazon-optimized title
 */
function getAmazonTitle(product) {
  const amazonTitle = getAmazonData(product, 'title');
  if (amazonTitle) {
    return amazonTitle;
  }
  
  // Generate optimized title (max 200 chars)
  let title = product.title;
  
  // Add key attributes if not present
  const capacity = product.specifications?.capacity?.value || getAmazonData(product, 'capacity') || 11;
  if (!title.includes('oz') && !title.includes('Oz')) {
    title += ` - ${capacity}oz`;
  }
  
  return title.substring(0, 200);
}

/**
 * Get bullet point by index
 */
function getBulletPoint(product, index) {
  const bullets = getAmazonData(product, 'bulletPoints') || [];
  return bullets[index] || '';
}

/**
 * Get special feature by index
 */
function getSpecialFeature(product, index) {
  const productType = detectProductType(product);
  const defaultFeatures = getDefaultValue(productType, 'specialFeatures') || [];
  
  const features = getAmazonData(product, 'specialFeatures') || 
                   product.specifications?.specialFeatures || 
                   defaultFeatures;
  return features[index] || '';
}

/**
 * Get search keywords
 */
function getKeywords(product) {
  const keywords = getAmazonData(product, 'keywords');
  if (keywords) {
    return keywords;
  }
  
  // Generate from tags
  if (product.tags && Array.isArray(product.tags)) {
    return product.tags.join(', ').toLowerCase();
  }
  
  return '';
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get all field mappings for a product
 */
export function getAllFieldMappings(product) {
  const fields = [
    'SKU',
    'Product Type',
    'Listing Action',
    'Item Name',
    'Brand Name',
    'Main Image URL',
    'Other Image URL',
    'Other Image URL_2',
    'Other Image URL_3',
    'Other Image URL_4',
    'Other Image URL_5',
    'Other Image URL_6',
    'Other Image URL_7',
    'Other Image URL_8',
    'Product Description',
    'Bullet Point',
    'Bullet Point_2',
    'Bullet Point_3',
    'Bullet Point_4',
    'Bullet Point_5',
    'Generic Keyword',
    'Special Features',
    'Special Features_2',
    'Special Features_3',
    'Special Features_4',
    'Special Features_5',
    'Material',
    'Number of Items',
    'Color',
    'Capacity',
    'Capacity Unit',
    'Included Components',
    'Drinking Cup Form Type',
    'Has Handle',
    'Is the item dishwasher safe?',
    'Item Height',
    'Item Height Unit',
    'Item Width Widest Point',
    'Item Width Unit',
    'Item Package Length',
    'Package Length Unit',
    'Item Package Width',
    'Package Width Unit',
    'Item Package Height',
    'Package Height Unit',
    'Package Weight',
    'Package Weight Unit',
    'Country of Origin',
    'Are batteries required?',
    'Are batteries included?',
    'Is This Product Subject To Buyer Age Restrictions',
    'California Proposition 65 Warning Type',
    'Contains PFAS',
    'Contains Battery or Cell',
    'Item Condition',
    'Fulfillment Channel Code (US)',
    'Quantity (US)',
    'Your Price USD (Sell on Amazon, US)',
    'Manufacturer',
    'Item Type Keyword',
  ];

  const mappings = {};
  fields.forEach(field => {
    mappings[field] = getFieldValue(product, field);
  });

  return mappings;
}
