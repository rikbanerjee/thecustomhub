/**
 * Data Helper Functions for Product Management
 * These functions provide easy access to product and category data from products.json
 * 
 * UPDATED: Now dynamically extracts categories from Shopify product data
 * 
 * @module dataHelpers
 */

import productsData from '../data/products.json';
import { getFirebaseImageUrl } from './imageHelpers';

/**
 * Get all products from the data store
 * Handles both array format (Shopify) and object format (sample data)
 * @returns {Array} Array of all product objects
 */
export const getAllProducts = () => {
  // Handle array format (Shopify export)
  if (Array.isArray(productsData)) {
    return productsData;
  }
  
  // Handle object format (sample data with categories and products keys)
  if (productsData.products && Array.isArray(productsData.products)) {
    return productsData.products;
  }
  
  return [];
};

/**
 * Extract product price from variants
 * @param {Object} product - Product object
 * @returns {number} Product price
 */
const getProductPrice = (product) => {
  // If product has price property directly
  if (product.price !== undefined) {
    return typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  }
  
  // If product has variants array (Shopify format)
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    const firstVariant = product.variants[0];
    return firstVariant.price || 0;
  }
  
  return 0;
};

/**
 * Extract product description
 * @param {Object} product - Product object
 * @returns {Object} Object with short and long descriptions
 */
const getProductDescription = (product) => {
  // If product has description object with short/long
  if (product.description && typeof product.description === 'object') {
    return {
      short: product.description.short || '',
      long: product.description.long || ''
    };
  }
  
  // If product has HTML description (Shopify format)
  if (product.description && typeof product.description === 'string') {
    // Strip HTML tags for short description
    const plainText = product.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const short = plainText.substring(0, 150) + (plainText.length > 150 ? '...' : '');
    
    return {
      short,
      long: plainText
    };
  }
  
  return { short: '', long: '' };
};

/**
 * Check if product is in stock
 * @param {Object} product - Product object
 * @returns {boolean} True if in stock
 */
const isProductInStock = (product) => {
  // If product has inStock property directly
  if (product.inStock !== undefined) {
    return product.inStock;
  }
  
  // If product has variants (Shopify format)
  if (product.variants && Array.isArray(product.variants)) {
    // Check if any variant has inventory
    return product.variants.some(variant => 
      variant.inventoryQty && variant.inventoryQty > 0
    );
  }
  
  return true; // Default to in stock
};

/**
 * Normalize product object to consistent format
 * @param {Object} product - Raw product object
 * @returns {Object} Normalized product object
 */
const normalizeProduct = (product) => {
  const description = getProductDescription(product);
  const price = getProductPrice(product);
  const inStock = isProductInStock(product);
  
  // Extract simple category from hierarchical category
  // "Apparel & Accessories > Clothing > Clothing Tops > T-Shirts" → "Clothing"
  let simpleCategory = product.type || 'Other';
  
  // Create category ID (slugified)
  const categoryId = simpleCategory.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  return {
    ...product,
    id: product.id,
    title: product.title,
    description,
    price,
    images: product.images || [],
    category: categoryId,
    categoryName: simpleCategory,
    fullCategory: product.category || '',
    type: product.type || '',
    tags: product.tags || [],
    inStock,
    specifications: extractSpecifications(product),
    externalLinks: extractExternalLinks(product),
    variants: product.variants || []
  };
};

/**
 * Extract specifications from product
 * @param {Object} product - Product object
 * @returns {Object} Specifications object
 */
const extractSpecifications = (product) => {
  const specs = {};
  
  // If specifications already exist
  if (product.specifications) {
    return product.specifications;
  }
  
  // Extract from variants
  if (product.variants && product.variants.length > 0) {
    const sizes = new Set();
    const colors = new Set();
    
    product.variants.forEach(variant => {
      if (variant.option1) sizes.add(variant.option1);
      if (variant.option2) colors.add(variant.option2);
    });
    
    if (sizes.size > 0) {
      specs['Sizes Available'] = Array.from(sizes).join(', ');
    }
    if (colors.size > 0) {
      specs['Colors'] = Array.from(colors).join(', ');
    }
  }
  
  // Add vendor
  if (product.vendor) {
    specs['Brand'] = product.vendor;
  }
  
  // Add type
  if (product.type) {
    specs['Product Type'] = product.type;
  }
  
  return specs;
};

/**
 * Extract external purchase links
 * @param {Object} product - Product object
 * @returns {Object} External links object
 */
const extractExternalLinks = (product) => {
  // If external links already exist
  if (product.externalLinks) {
    return product.externalLinks;
  }
  
  // Default: link to home page or product inquiry
  return {
    amazon: '',
    walmart: '',
    etsy: ''
  };
};

/**
 * Get all categories dynamically extracted from products
 * @returns {Array} Array of category objects
 */
export const getAllCategories = () => {
  const products = getAllProducts();
  const categoryMap = new Map();
  
  products.forEach(product => {
    const type = product.type || 'Other';
    const categoryId = type.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        id: categoryId,
        name: type,
        description: `Browse our collection of ${type.toLowerCase()}`,
        image: product.images && product.images[0] 
          ? getFirebaseImageUrl(product.images[0]) 
          : '',
        productCount: 0
      });
    }
    
    // Increment product count
    const category = categoryMap.get(categoryId);
    category.productCount++;
    
    // Update image if current category image is empty
    if (!category.image && product.images && product.images[0]) {
      category.image = getFirebaseImageUrl(product.images[0]);
    }
  });
  
  // Convert map to array and sort by product count (descending)
  return Array.from(categoryMap.values()).sort((a, b) => b.productCount - a.productCount);
};

/**
 * Get a single product by its ID (normalized)
 * @param {string} id - The unique product identifier
 * @returns {Object|null} Normalized product object if found, null otherwise
 */
export const getProductById = (id) => {
  if (!id) return null;
  
  const products = getAllProducts();
  const product = products.find(p => p.id === id);
  
  return product ? normalizeProduct(product) : null;
};

/**
 * Get all products in a specific category (normalized)
 * @param {string} category - The category ID (slugified type)
 * @returns {Array} Array of normalized products in the specified category
 */
export const getProductsByCategory = (category) => {
  if (!category) return [];
  
  const products = getAllProducts();
  const categoryId = category.toLowerCase();
  
  return products
    .filter(product => {
      const productType = product.type || 'Other';
      const productCategoryId = productType.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return productCategoryId === categoryId;
    })
    .map(normalizeProduct);
};

/**
 * Get all products in a specific subcategory
 * @param {string} subcategory - The subcategory name
 * @returns {Array} Array of products in the specified subcategory
 */
export const getProductsBySubcategory = (subcategory) => {
  if (!subcategory) return [];
  
  const products = getAllProducts();
  return products
    .filter(product => {
      const productSubcat = product.subcategory || '';
      return productSubcat.toLowerCase() === subcategory.toLowerCase();
    })
    .map(normalizeProduct);
};

/**
 * Search products by query string (returns normalized products)
 * Searches through title, description, tags, type, and category
 * @param {string} query - Search query string
 * @returns {Array} Array of matching products, sorted by relevance
 */
export const searchProducts = (query) => {
  if (!query || typeof query !== 'string') return [];
  
  const lowerQuery = query.toLowerCase().trim();
  if (lowerQuery === '') return [];
  
  const products = getAllProducts();
  
  // Score-based relevance search
  const scoredProducts = products.map(product => {
    let score = 0;
    const title = (product.title || '').toLowerCase();
    const description = (product.description || '').toString().toLowerCase();
    const type = (product.type || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    const tags = (product.tags || []).map(t => t.toLowerCase()).join(' ');
    
    // Higher score for title matches
    if (title.includes(lowerQuery)) {
      score += 10;
    }
    
    // Medium score for tag matches
    if (tags.includes(lowerQuery)) {
      score += 5;
    }
    
    // Lower score for description matches
    if (description.includes(lowerQuery)) {
      score += 3;
    }
    
    // Minimal score for category/type matches
    if (type.includes(lowerQuery) || category.includes(lowerQuery)) {
      score += 1;
    }
    
    return { product, score };
  });
  
  // Filter products with score > 0, sort by score, and normalize
  return scoredProducts
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => normalizeProduct(item.product));
};

/**
 * Get products by tag
 * @param {string} tag - Tag to filter by
 * @returns {Array} Array of products with the specified tag
 */
export const getProductsByTag = (tag) => {
  if (!tag) return [];
  
  const products = getAllProducts();
  const lowerTag = tag.toLowerCase();
  
  return products
    .filter(product => 
      product.tags && product.tags.some(t => t.toLowerCase() === lowerTag)
    )
    .map(normalizeProduct);
};

/**
 * Get in-stock products only (normalized)
 * @returns {Array} Array of products that are currently in stock
 */
export const getInStockProducts = () => {
  const products = getAllProducts();
  return products
    .filter(product => isProductInStock(product))
    .map(normalizeProduct);
};

/**
 * Get out-of-stock products
 * @returns {Array} Array of products that are currently out of stock
 */
export const getOutOfStockProducts = () => {
  const products = getAllProducts();
  return products
    .filter(product => !isProductInStock(product))
    .map(normalizeProduct);
};

/**
 * Get products within a price range (normalized)
 * @param {number} minPrice - Minimum price (inclusive)
 * @param {number} maxPrice - Maximum price (inclusive)
 * @returns {Array} Array of products within the price range
 */
export const getProductsByPriceRange = (minPrice, maxPrice) => {
  if (minPrice < 0 || maxPrice < minPrice) return [];
  
  const products = getAllProducts();
  return products
    .filter(product => {
      const price = getProductPrice(product);
      return price >= minPrice && price <= maxPrice;
    })
    .map(normalizeProduct);
};

/**
 * Get a category by its ID
 * @param {string} categoryId - The category ID
 * @returns {Object|null} Category object if found, null otherwise
 */
export const getCategoryById = (categoryId) => {
  if (!categoryId) return null;
  
  const categories = getAllCategories();
  return categories.find(cat => cat.id === categoryId) || null;
};

/**
 * Get featured/recommended products (normalized)
 * Returns the first N in-stock products
 * @param {number} count - Number of products to return (default: 6)
 * @returns {Array} Array of featured products
 */
export const getFeaturedProducts = (count = 6) => {
  const products = getInStockProducts();
  return products.slice(0, count);
};

/**
 * Filter products by multiple criteria (returns normalized products)
 * @param {Object} filters - Filter criteria object
 * @param {string} filters.category - Category ID to filter by
 * @param {string} filters.subcategory - Subcategory to filter by
 * @param {boolean} filters.inStock - Stock status to filter by
 * @param {number} filters.minPrice - Minimum price
 * @param {number} filters.maxPrice - Maximum price
 * @param {Array<string>} filters.tags - Array of tags to match
 * @returns {Array} Array of products matching all specified filters
 */
export const filterProducts = (filters = {}) => {
  let products = getAllProducts();
  
  if (filters.category) {
    const categoryId = filters.category.toLowerCase();
    products = products.filter(p => {
      const productType = p.type || 'Other';
      const productCategoryId = productType.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return productCategoryId === categoryId;
    });
  }
  
  if (filters.subcategory) {
    products = products.filter(p => 
      (p.subcategory || '').toLowerCase() === filters.subcategory.toLowerCase()
    );
  }
  
  if (typeof filters.inStock === 'boolean') {
    products = products.filter(p => isProductInStock(p) === filters.inStock);
  }
  
  if (typeof filters.minPrice === 'number') {
    products = products.filter(p => getProductPrice(p) >= filters.minPrice);
  }
  
  if (typeof filters.maxPrice === 'number') {
    products = products.filter(p => getProductPrice(p) <= filters.maxPrice);
  }
  
  if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
    products = products.filter(p => {
      if (!p.tags) return false;
      return filters.tags.some(filterTag => 
        p.tags.some(productTag => 
          productTag.toLowerCase() === filterTag.toLowerCase()
        )
      );
    });
  }
  
  return products.map(normalizeProduct);
};

/**
 * Sort products by various criteria (works with normalized products)
 * @param {Array} products - Array of products to sort
 * @param {string} sortBy - Sort criteria: 'price-asc', 'price-desc', 'name-asc', 'name-desc'
 * @returns {Array} Sorted array of products
 */
export const sortProducts = (products, sortBy = 'name-asc') => {
  if (!Array.isArray(products)) return [];
  
  const sorted = [...products]; // Create a copy to avoid mutating original
  
  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => {
        const priceA = a.price !== undefined ? a.price : getProductPrice(a);
        const priceB = b.price !== undefined ? b.price : getProductPrice(b);
        return priceA - priceB;
      });
    
    case 'price-desc':
      return sorted.sort((a, b) => {
        const priceA = a.price !== undefined ? a.price : getProductPrice(a);
        const priceB = b.price !== undefined ? b.price : getProductPrice(b);
        return priceB - priceA;
      });
    
    case 'name-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    
    case 'name-desc':
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    
    case 'relevance':
    default:
      return sorted; // Already sorted by relevance from search
  }
};

/**
 * Get related products based on category and tags (normalized)
 * @param {string} productId - ID of the product to find related products for
 * @param {number} count - Maximum number of related products to return (default: 4)
 * @returns {Array} Array of related products
 */
export const getRelatedProducts = (productId, count = 4) => {
  const currentProduct = getProductById(productId);
  if (!currentProduct) return [];
  
  const allProducts = getAllProducts()
    .filter(p => p.id !== productId); // Exclude current product
  
  // Score products based on similarity
  const scoredProducts = allProducts.map(product => {
    let score = 0;
    const productType = product.type || 'Other';
    const productCategoryId = productType.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Same category/type
    if (productCategoryId === currentProduct.category) {
      score += 5;
    }
    
    // Shared tags
    if (currentProduct.tags && product.tags) {
      const sharedTags = product.tags.filter(tag => 
        currentProduct.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
      score += sharedTags.length * 2;
    }
    
    return { product, score };
  });
  
  // Sort by score and return top N (normalized)
  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(item => normalizeProduct(item.product));
};

/**
 * Get unique tags from all products
 * @returns {Array<string>} Array of unique tags sorted alphabetically
 */
export const getAllTags = () => {
  const products = getAllProducts();
  const tagsSet = new Set();
  
  products.forEach(product => {
    if (product.tags && Array.isArray(product.tags)) {
      product.tags.forEach(tag => tagsSet.add(tag));
    }
  });
  
  return Array.from(tagsSet).sort();
};

/**
 * Get unique subcategories from all products
 * @returns {Array<string>} Array of unique subcategories
 */
export const getAllSubcategories = () => {
  const products = getAllProducts();
  const subcategoriesSet = new Set();
  
  products.forEach(product => {
    if (product.subcategory) {
      subcategoriesSet.add(product.subcategory);
    }
  });
  
  return Array.from(subcategoriesSet).sort();
};

/**
 * Get product statistics
 * @returns {Object} Object containing various statistics about the product catalog
 */
export const getProductStats = () => {
  const products = getAllProducts();
  const normalizedProducts = products.map(normalizeProduct);
  const prices = normalizedProducts.map(p => p.price).filter(p => p > 0);
  
  return {
    totalProducts: products.length,
    inStockCount: products.filter(isProductInStock).length,
    outOfStockCount: products.filter(p => !isProductInStock(p)).length,
    totalCategories: getAllCategories().length,
    totalTags: getAllTags().length,
    averagePrice: prices.length > 0 
      ? (prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2)
      : 0,
    minPrice: prices.length > 0 ? Math.min(...prices).toFixed(2) : 0,
    maxPrice: prices.length > 0 ? Math.max(...prices).toFixed(2) : 0
  };
};

/**
 * Format price to USD currency string
 * @param {number|string} price - Price to format
 * @returns {string} Formatted price string (e.g., "$24.99")
 */
export const formatPrice = (price) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numPrice);
};

/**
 * Get unique product types
 * @returns {Array<string>} Array of unique product types
 */
export const getAllTypes = () => {
  const products = getAllProducts();
  const typesSet = new Set();
  
  products.forEach(product => {
    if (product.type) {
      typesSet.add(product.type);
    }
  });
  
  return Array.from(typesSet).sort();
};
