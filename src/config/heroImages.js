/**
 * HERO BACKGROUND IMAGE CONFIGURATION
 * 
 * To add a hero background image:
 * 1. Upload your image to Firebase Storage or image CDN
 * 2. Copy the public URL
 * 3. Paste it in 'primaryImage' below
 * 4. If image fails to load or URL is empty, brownish gradient will show
 * 
 * Recommended image specs:
 * - Resolution: 1920x1080px or higher
 * - Format: JPG or WebP
 * - File size: Under 500KB (compressed)
 * - Content: Indian cultural imagery, product lifestyle shots, etc.
 * 
 * Example URLs:
 * - Firebase Storage: https://firebasestorage.googleapis.com/v0/b/.../hero-bg.jpg
 * - Cloudinary: https://res.cloudinary.com/.../hero-bg.jpg
 * 
 * To disable images and use gradients only, set primaryImage to null or empty string
 */

// Hero background image configuration
export const heroConfig = {
  // Primary hero image (main homepage)
  // Set to null or empty string to use gradient fallback
  primaryImage: import.meta.env.VITE_HERO_IMAGE_URL || null,

  // Alternative images (can rotate or A/B test)
  alternativeImages: [
    // Add more image URLs here if you want rotation
    // import.meta.env.VITE_HERO_IMAGE_ALT_1 || null,
    // import.meta.env.VITE_HERO_IMAGE_ALT_2 || null,
  ].filter(Boolean),

  // Fallback: if all images fail to load, use current gradient
  useFallbackGradient: true,

  // Overlay settings for text readability
  overlay: {
    enabled: true,
    color: 'rgba(139, 69, 19, 0.6)', // brownish overlay to maintain branding
    gradient: 'linear-gradient(135deg, rgba(139, 69, 19, 0.8) 0%, rgba(101, 67, 33, 0.7) 100%)'
  }
};

/**
 * Helper function to check if a string is a valid image URL
 */
export const isImageUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  return /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(str) || str.startsWith('http');
};

/**
 * Helper function to get background style with image and overlay
 */
export const getHeroBackgroundStyle = (imageUrl, overlayGradient, fallbackGradient) => {
  if (imageUrl && isImageUrl(imageUrl)) {
    return {
      backgroundImage: `url('${imageUrl}')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative'
    };
  }
  return {
    background: fallbackGradient || 'linear-gradient(135deg, #8b4513 0%, #654321 100%)'
  };
};

