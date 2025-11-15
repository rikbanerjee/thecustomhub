import { Link } from 'react-router-dom';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { getFirebaseImageUrl, getPlaceholderImage } from '../../utils/imageHelpers';

/**
 * CategoryCard Component
 * Displays a category with image, name, description, and product count
 * Features smooth hover effects and transitions
 */
const CategoryCard = ({ category }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <Link
      to={`/category/${category.id}`}
      className="card group block h-full transform transition-all duration-300 hover:-translate-y-1"
      aria-label={`Browse ${category.name} products`}
    >
      {/* Category Image/Icon */}
      <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center overflow-hidden relative">
        {/* Loading skeleton */}
        {!imageLoaded && category.image && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        {category.image && !imageError ? (
          <img 
            src={getFirebaseImageUrl(category.image)} 
            alt={category.name}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-all duration-500 ${
              imageLoaded 
                ? 'opacity-100 group-hover:scale-110' 
                : 'opacity-0'
            }`}
          />
        ) : (
          // Fallback icon with animation
          <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
            {getCategoryIcon(category.id)}
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Product count badge on hover */}
        {category.productCount > 0 && (
          <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <span className="bg-white text-primary-600 text-sm font-semibold px-3 py-1 rounded-full shadow-lg inline-block">
              {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'}
            </span>
          </div>
        )}
      </div>

      {/* Category Info */}
      <div className="p-6 text-center">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 transition-colors">
          {category.name}
        </h3>
        
        {category.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {category.description}
          </p>
        )}
        
        {/* Browse link */}
        <div className="inline-flex items-center text-primary-600 text-sm font-medium group-hover:gap-2 transition-all">
          Browse
          <svg 
            className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

/**
 * Get appropriate icon for category
 * @param {string} categoryId - Category identifier
 * @returns {string} Emoji icon
 */
const getCategoryIcon = (categoryId) => {
  const icons = {
    'apparel': '👕',
    'home-decor': '🏠',
    'accessories': '👜',
    'gifts': '🎁',
    't-shirts': '👔',
    'hoodies': '🧥',
    'mugs': '☕',
    'bags': '🎒',
  };
  return icons[categoryId] || '🎨';
};

CategoryCard.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    image: PropTypes.string,
    productCount: PropTypes.number,
  }).isRequired,
};

export default CategoryCard;
