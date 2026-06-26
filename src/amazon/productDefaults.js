/**
 * Product Default Configurations
 * 
 * These are the standard values for different product types.
 * The generator will automatically use these defaults if specific values
 * are not provided in the product data.
 */

export const PRODUCT_DEFAULTS = {
  'coffee-mugs': {
    // Brand & Manufacturing
    brandName: 'Green-Chili',
    manufacturer: 'The CustomHub',
    countryOfOrigin: 'US',
    
    // Product Specifications
    capacity: {
      value: 11,
      unit: 'fl oz'
    },
    material: 'Ceramic',
    hasHandle: true,
    dishwasherSafe: true,
    microwaveSafe: true,
    numberOfItems: 1,
    includedComponents: '1 Mug',
    
    // Special Features (standard for all mugs)
    specialFeatures: [
      'Microwave Safe',
      'Dishwasher Safe',
      'Heat Resistant',
      'Durable'
    ],
    
    // Dimensions - Item (the mug itself)
    itemDimensions: {
      height: 3.76,
      width: 4.7,
      unit: 'inches'
    },
    
    // Dimensions - Package (shipping box)
    packageDimensions: {
      length: 6,
      width: 5,
      height: 4,
      weight: 0.4,
      weightUnit: 'pounds',
      unit: 'inches'
    },
    
    // Fulfillment & Inventory
    fulfillmentChannel: 'DEFAULT',
    defaultQuantity: 20,
    itemTypeKeyword: 'coffee-mugs',
    
    // Pricing
    defaultPrice: 19.99,
    
    // Amazon Category
    productType: 'drinking_cup',
    cupFormType: 'Mug'
  }
};

/**
 * Get default values for a product type
 * @param {string} productType - Product type (e.g., 'coffee-mugs')
 * @returns {Object} Default values for that product type
 */
export function getDefaults(productType) {
  return PRODUCT_DEFAULTS[productType] || {};
}

/**
 * Get default value for a specific field
 * @param {string} productType - Product type (e.g., 'coffee-mugs')
 * @param {string} field - Field name
 * @returns {*} Default value for that field
 */
export function getDefaultValue(productType, field) {
  const defaults = getDefaults(productType);
  return defaults[field];
}

/**
 * Merge product data with defaults
 * Product-specific values override defaults
 * @param {Object} product - Product data
 * @param {string} productType - Product type
 * @returns {Object} Merged data
 */
export function mergeWithDefaults(product, productType = 'coffee-mugs') {
  const defaults = getDefaults(productType);
  
  return {
    ...product,
    amazonData: {
      ...defaults,
      ...(product.amazonData || {})
    },
    specifications: {
      capacity: defaults.capacity,
      material: defaults.material,
      hasHandle: defaults.hasHandle,
      dishwasherSafe: defaults.dishwasherSafe,
      microwaveSafe: defaults.microwaveSafe,
      numberOfItems: defaults.numberOfItems,
      includedComponents: defaults.includedComponents,
      ...(product.specifications || {})
    },
    dimensions: {
      item: defaults.itemDimensions,
      package: defaults.packageDimensions,
      ...(product.dimensions || {})
    },
    countryOfOrigin: product.countryOfOrigin || defaults.countryOfOrigin
  };
}

/**
 * Detect product type from product data
 * @param {Object} product - Product data
 * @returns {string} Detected product type
 */
export function detectProductType(product) {
  // Check explicit type
  if (product.productType) {
    return product.productType;
  }
  
  // Check category
  const category = (product.category || '').toLowerCase();
  if (category.includes('mug') || category.includes('cup') || category.includes('drinkware')) {
    return 'coffee-mugs';
  }
  
  // Check type field
  const type = (product.type || '').toLowerCase();
  if (type.includes('mug') || type.includes('cup')) {
    return 'coffee-mugs';
  }
  
  // Check title
  const title = (product.title || '').toLowerCase();
  if (title.includes('mug') || title.includes('cup')) {
    return 'coffee-mugs';
  }
  
  // Default
  return 'coffee-mugs';
}
