/**
 * Image Helper Utilities
 * 
 * Provides helper functions for image URL handling, conversion, and validation
 * Works with Firebase Storage image URLs
 * 
 * @module imageHelpers
 */

import { 
  convertShopifyUrl, 
  getImageUrl, 
  getPlaceholderImage,
  isValidImageUrl,
  PLACEHOLDER_IMAGE_URL 
} from '../config/images';

/**
 * Convert a Shopify CDN URL to Firebase Storage URL
 * This is the main conversion function used throughout the app
 * 
 * @param {string} url - Shopify CDN URL or any image URL
 * @returns {string} Firebase Storage URL or fallback URL
 */
export const getFirebaseImageUrl = (url) => {
  if (!url) return getPlaceholderImage();
  
  // If already Firebase Storage URL (new format with ?alt=media), return as is
  if (url.includes('firebasestorage.googleapis.com') && url.includes('?alt=media')) {
    return url;
  }
  
  // If old Firebase Storage URL format or Shopify URL, convert it
  if (url.includes('storage.googleapis.com') || url.includes('firebasestorage.googleapis.com') || url.includes('cdn.shopify.com')) {
    return convertShopifyUrl(url);
  }
  
  // For other URLs (placeholders, data URIs, etc.), return as is
  return url;
};

/**
 * Process product images array - convert all URLs to Firebase
 * 
 * @param {Array<string>} images - Array of image URLs
 * @returns {Array<string>} Array of converted Firebase Storage URLs
 */
export const processProductImages = (images) => {
  if (!Array.isArray(images) || images.length === 0) {
    return [];
  }
  
  return images.map(url => getFirebaseImageUrl(url));
};

/**
 * Process variant image - convert URL to Firebase
 * 
 * @param {string} variantImg - Variant image URL
 * @returns {string} Converted Firebase Storage URL
 */
export const processVariantImage = (variantImg) => {
  if (!variantImg) return getPlaceholderImage();
  return getFirebaseImageUrl(variantImg);
};

/**
 * Get the first image from product images array with Firebase URL
 * 
 * @param {Array<string>} images - Product images array
 * @returns {string} First image URL or placeholder
 */
export const getFirstProductImage = (images) => {
  if (!Array.isArray(images) || images.length === 0) {
    return getPlaceholderImage();
  }
  
  return getFirebaseImageUrl(images[0]);
};

/**
 * Validate image URL and return fallback if invalid
 * 
 * @param {string} url - Image URL to validate
 * @returns {string} Valid URL or placeholder
 */
export const validateImageUrl = (url) => {
  if (!isValidImageUrl(url)) {
    return getPlaceholderImage();
  }
  return url;
};

/**
 * Handle image load error - returns placeholder
 * 
 * @returns {string} Placeholder image URL
 */
export const handleImageError = () => {
  return getPlaceholderImage();
};

/**
 * Batch convert product objects to use Firebase URLs
 * This can be used during data migration or initialization
 * 
 * @param {Object} product - Product object
 * @returns {Object} Product object with converted image URLs
 */
export const convertProductImages = (product) => {
  if (!product) return product;
  
  const converted = { ...product };
  
  // Convert images array
  if (Array.isArray(product.images)) {
    converted.images = processProductImages(product.images);
  }
  
  // Convert variant images
  if (Array.isArray(product.variants)) {
    converted.variants = product.variants.map(variant => ({
      ...variant,
      variantImg: variant.variantImg ? processVariantImage(variant.variantImg) : null
    }));
  }
  
  return converted;
};

// Re-export placeholder function for convenience
export { getPlaceholderImage };

