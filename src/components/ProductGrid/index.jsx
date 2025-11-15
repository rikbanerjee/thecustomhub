import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ProductCard from '../ProductCard';

/**
 * ProductGrid Component
 * Container for displaying multiple ProductCard components in a responsive grid
 * Handles loading states, empty states, and responsive layouts
 */
const ProductGrid = ({ 
  products = [], 
  loading = false, 
  emptyMessage = "No products found",
  emptyAction = null,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 }
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger fade-in animation when component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Build responsive grid classes
  const gridClasses = `
    grid gap-6
    grid-cols-${columns.xs}
    sm:grid-cols-${columns.sm}
    md:grid-cols-${columns.md}
    lg:grid-cols-${columns.lg}
  `.trim().replace(/\s+/g, ' ');

  // Loading state
  if (loading) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <svg 
            className="w-24 h-24 mx-auto text-gray-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 mb-6">
          Try adjusting your filters or search terms
        </p>
        {emptyAction && (
          <div>
            {emptyAction}
          </div>
        )}
      </div>
    );
  }

  // Product grid
  return (
    <div 
      className={`
        ${gridClasses}
        transition-opacity duration-500
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-fade-in"
          style={{ 
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'both'
          }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

/**
 * SkeletonCard Component
 * Loading placeholder that mimics the ProductCard layout
 */
const SkeletonCard = () => {
  return (
    <div className="card overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200 animate-pulse" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
        </div>
        
        {/* Price skeleton */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
        </div>
      </div>
    </div>
  );
};

ProductGrid.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.shape({
        short: PropTypes.string.isRequired,
        long: PropTypes.string.isRequired,
      }).isRequired,
      price: PropTypes.number.isRequired,
      images: PropTypes.arrayOf(PropTypes.string).isRequired,
      category: PropTypes.string.isRequired,
      inStock: PropTypes.bool.isRequired,
    })
  ),
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  emptyAction: PropTypes.node,
  columns: PropTypes.shape({
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
  }),
};

export default ProductGrid;

