/**
 * Firebase Storage Image Configuration
 * 
 * Centralized configuration for Firebase Storage image URLs
 * This allows easy updates if storage location changes in the future
 * 
 * @module images
 */

/**
 * Firebase Storage bucket name
 */
export const FIREBASE_STORAGE_BUCKET = 'thecustomhub-efb8a.firebasestorage.app';

/**
 * Firebase Storage base URL for product images
 * Format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media
 */
export const FIREBASE_STORAGE_BASE_URL = `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/`;

/**
 * Placeholder image URL (fallback for broken images)
 */
export const PLACEHOLDER_IMAGE_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

/**
 * Construct Firebase Storage public download URL from filename
 * Uses the correct Firebase Storage download URL format with ?alt=media
 * 
 * @param {string} filename - Image filename (e.g., "DussheraArrow.jpg")
 * @returns {string} Full Firebase Storage public download URL
 * 
 * @example
 * getImageUrl("DussheraArrow.jpg")
 * // Returns: "https://firebasestorage.googleapis.com/v0/b/thecustomhub-efb8a.appspot.com/o/images%2FDussheraArrow.jpg?alt=media"
 */
export const getImageUrl = (filename) => {
  if (!filename) return PLACEHOLDER_IMAGE_URL;
  
  // Remove any leading slashes or whitespace
  const cleanFilename = filename.trim().replace(/^\/+/, '');
  
  // Ensure we have a filename
  if (!cleanFilename) return PLACEHOLDER_IMAGE_URL;
  
  // Construct the file path: images/filename.jpg
  const filePath = `images/${cleanFilename}`;
  
  // URL-encode the path (images/ becomes images%2F)
  const encodedPath = encodeURIComponent(filePath);
  
  // Construct Firebase Storage public download URL
  // Format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{encodedPath}?alt=media
  return `${FIREBASE_STORAGE_BASE_URL}${encodedPath}?alt=media`;
};

/**
 * Extract filename from Shopify CDN URL and convert to Firebase Storage URL
 * Also handles converting old Firebase Storage URL format to new format
 * 
 * @param {string} shopifyUrl - Original Shopify CDN URL or Firebase Storage URL
 * @returns {string} Firebase Storage public download URL
 * 
 * @example
 * convertShopifyUrl("https://cdn.shopify.com/s/files/1/0690/7209/3284/files/DussheraArrow.jpg?v=1757564112")
 * // Returns: "https://firebasestorage.googleapis.com/v0/b/thecustomhub-efb8a.appspot.com/o/images%2FDussheraArrow.jpg?alt=media"
 */
export const convertShopifyUrl = (shopifyUrl) => {
  if (!shopifyUrl || typeof shopifyUrl !== 'string') {
    return PLACEHOLDER_IMAGE_URL;
  }
  
  // If already a Firebase Storage URL (old or new format), extract filename and convert
  if (shopifyUrl.includes('storage.googleapis.com') || shopifyUrl.includes('firebasestorage.googleapis.com')) {
    // Extract filename from old format: .../images/filename.jpg
    const oldFormatMatch = shopifyUrl.match(/\/images\/([^?]+)/);
    if (oldFormatMatch && oldFormatMatch[1]) {
      // Get the filename (may have path, get last part)
      const pathParts = oldFormatMatch[1].split('/');
      const filename = pathParts[pathParts.length - 1];
      // Decode if URL-encoded
      const decodedFilename = decodeURIComponent(filename);
      return getImageUrl(decodedFilename);
    }
    
    // Extract from new format: .../o/images%2Ffilename.jpg?alt=media
    const newFormatMatch = shopifyUrl.match(/\/o\/([^?]+)/);
    if (newFormatMatch && newFormatMatch[1]) {
      try {
        // Decode the encoded path
        const decodedPath = decodeURIComponent(newFormatMatch[1]);
        // Extract filename from path (e.g., "images/filename.jpg" -> "filename.jpg")
        if (decodedPath.startsWith('images/')) {
          const filename = decodedPath.replace('images/', '');
          return getImageUrl(filename);
        }
        // If already correct format, return as is
        if (shopifyUrl.includes('firebasestorage.googleapis.com') && shopifyUrl.includes('?alt=media')) {
          return shopifyUrl;
        }
      } catch (e) {
        console.warn('Error parsing Firebase URL:', shopifyUrl, e);
      }
    }
    
    // Fallback: try to extract filename from URL directly
    const urlParts = shopifyUrl.split('/');
    for (let i = urlParts.length - 1; i >= 0; i--) {
      if (urlParts[i].includes('.') && !urlParts[i].includes('?')) {
        const filename = urlParts[i].split('?')[0];
        const decodedFilename = decodeURIComponent(filename);
        return getImageUrl(decodedFilename);
      }
    }
    
    // If we can't parse it but it's already a Firebase URL, return as is
    return shopifyUrl;
  }
  
  // If not a Shopify URL, return as is (may be placeholder or other URL)
  if (!shopifyUrl.includes('cdn.shopify.com')) {
    return shopifyUrl;
  }
  
  try {
    // Extract filename from Shopify URL
    // Pattern: https://cdn.shopify.com/s/files/1/0690/7209/3284/files/FILENAME?params
    const urlMatch = shopifyUrl.match(/\/files\/([^?]+)/);
    
    if (urlMatch && urlMatch[1]) {
      // Decode URL-encoded filename and extract just the filename (last part after /)
      const fullPath = decodeURIComponent(urlMatch[1]);
      const filename = fullPath.split('/').pop();
      return getImageUrl(filename);
    }
    
    // Fallback: try to extract from URL directly
    const urlParts = shopifyUrl.split('/');
    for (let i = urlParts.length - 1; i >= 0; i--) {
      if (urlParts[i].includes('.') && !urlParts[i].includes('?')) {
        const filename = urlParts[i].split('?')[0];
        return getImageUrl(filename);
      }
    }
    
    // Return placeholder if extraction fails
    return PLACEHOLDER_IMAGE_URL;
  } catch (error) {
    console.warn('Error converting Shopify URL:', shopifyUrl, error);
    return PLACEHOLDER_IMAGE_URL;
  }
};

/**
 * Get product image URL (for organized storage structure)
 * This can be used if images are organized by product ID in the future
 * 
 * @param {string} productId - Product identifier
 * @param {string} filename - Image filename
 * @returns {string} Firebase Storage URL
 */
export const getProductImageUrl = (productId, filename) => {
  if (!filename) return PLACEHOLDER_IMAGE_URL;
  
  // For now, images are in a flat structure in /images/
  // If organized by product in future, change to: `${FIREBASE_STORAGE_BASE_URL}${productId}/${filename}`
  return getImageUrl(filename);
};

/**
 * Get placeholder image URL
 * 
 * @returns {string} Placeholder image URL
 */
export const getPlaceholderImage = () => {
  return PLACEHOLDER_IMAGE_URL;
};

/**
 * Validate if URL is a valid image URL
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL appears valid
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if it's a Firebase Storage URL, Shopify URL, data URI, or other http/https URL
  return url.startsWith('http://') || 
         url.startsWith('https://') || 
         url.startsWith('data:image/') ||
         url.includes('firebasestorage.googleapis.com') ||
         url.includes('storage.googleapis.com') ||
         url.includes('cdn.shopify.com');
};

