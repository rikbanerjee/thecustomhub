import { Link } from 'react-router-dom';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { formatPrice } from '../../utils/dataHelpers';
import { getFirebaseImageUrl, getPlaceholderImage } from '../../utils/imageHelpers';
import { useCart } from '../../contexts/CartContext';

/**
 * ProductCard Component
 * Displays a single product with image, title, price, and stock status
 * Includes hover effects, lazy loading, and low stock indicators
 */
const ProductCard = ({ product, onQuickView }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addItem(product, null);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Get minimum price from variants
  const getMinPrice = () => {
    if (!product.variants || product.variants.length === 0) {
      return product.price || 0; // Fallback to product.price if exists
    }
    const prices = product.variants
      .map(v => parseFloat(v.price))
      .filter(p => !isNaN(p));
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  // Get total inventory from variants
  const getTotalInventory = () => {
    if (!product.variants || product.variants.length === 0) return null;
    const total = product.variants.reduce((sum, v) => sum + (v.inventoryQty || 0), 0);
    return total;
  };

  const inventory = getTotalInventory();
  const isLowStock = inventory !== null && inventory > 0 && inventory <= 10;

  // Extract short description from HTML description or use first 150 chars
  const getShortDescription = () => {
    if (product.description?.short) {
      return product.description.short;
    }
    
    // Remove HTML tags and get first 150 characters
    const desc = product.description || '';
    const plainText = desc.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  return (
    <Link 
      to={`/product/${product.id}`} 
      className="card group block h-full"
      aria-label={`View details for ${product.title}`}
    >
      {/* Product Image */}
      <div className="aspect-square bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center overflow-hidden relative">
        {/* Loading skeleton */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        {/* Product Image */}
        {!imageError ? (
          <img
            src={product.images && product.images.length > 0 
              ? getFirebaseImageUrl(product.images[0]) 
              : getPlaceholderImage()}
            alt={product.title}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`max-h-full max-w-full object-contain p-4 transition-all duration-300 ${
              imageLoaded ? 'opacity-100 group-hover:scale-105' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Stock Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          {product.inStock ? (
            <>
              {isLowStock ? (
                <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg animate-pulse">
                  Only {inventory} left!
                </span>
              ) : (
                <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                  In Stock
                </span>
              )}
            </>
          ) : (
            <span className="bg-gray-800 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
              Out of Stock
            </span>
          )}
        </div>

        {/* Hover action buttons */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          {/* Quick View */}
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="bg-white/95 hover:bg-white text-gray-800 font-medium px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 text-sm whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Quick View
            </button>
          )}

          {/* Quick Add to Cart */}
          {product.inStock && (
            <button
              onClick={handleAddToCart}
              className={`font-medium px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 text-sm whitespace-nowrap transition-colors ${
                addedToCart
                  ? 'bg-green-600 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
              aria-label={addedToCart ? 'Added!' : `Add ${product.title} to cart`}
            >
              {addedToCart ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </>
              )}
            </button>
          )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col h-auto">
        {/* Title — min-height must equal exactly 2 lines (font-size 1.125rem *
            heading line-height 1.4 = 1.575rem/line) or -webkit-line-clamp
            renders a sliver of a 3rd line into the leftover space. */}
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary-600 transition-colors line-clamp-2 min-h-[3.15rem]">
          {product.title}
        </h3>
        
        {/* Short Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
          {getShortDescription()}
        </p>
        
        {/* Price and Action */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-xl font-bold text-primary-600">
            {formatPrice(getMinPrice())}
          </span>
          <span className="text-sm text-gray-500 group-hover:text-primary-600 transition-colors flex items-center">
            View Details
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.oneOfType([
      PropTypes.string, // HTML string from Shopify
      PropTypes.shape({
        short: PropTypes.string,
        long: PropTypes.string,
      })
    ]),
    price: PropTypes.number, // Optional, as we now use variants
    variants: PropTypes.arrayOf(PropTypes.shape({
      price: PropTypes.number,
      option1: PropTypes.string,
      option2: PropTypes.string,
      inventoryQty: PropTypes.number,
    })),
    images: PropTypes.arrayOf(PropTypes.string).isRequired,
    category: PropTypes.string,
    type: PropTypes.string,
    inStock: PropTypes.bool.isRequired,
  }).isRequired,
  onQuickView: PropTypes.func,
};

export default ProductCard;
