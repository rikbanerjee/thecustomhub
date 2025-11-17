import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SEO from '../../components/SEO';
import ProductCard from '../../components/ProductCard';
import { 
  getProductById, 
  getCategoryById, 
  getRelatedProducts, 
  formatPrice 
} from '../../utils/dataHelpers';
import { getFirebaseImageUrl, getPlaceholderImage } from '../../utils/imageHelpers';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageZoom, setImageZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [imageLoadStatus, setImageLoadStatus] = useState({});
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const foundProduct = getProductById(productId);
      if (foundProduct) {
        setProduct(foundProduct);
        
        // Get related products
        const related = getRelatedProducts(productId, 4);
        setRelatedProducts(related);
      } else {
        // Product not found, redirect after a moment
        setTimeout(() => navigate('/'), 1500);
      }
      
      setLoading(false);
    };

    fetchData();
    // Reset to first image when product changes
    setSelectedImage(0);
    setImageLoadStatus({});
    setDescriptionExpanded(false);
  }, [productId, navigate]);

  // Handle image zoom on mouse move
  const handleMouseMove = (e) => {
    if (!imageZoom) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  };

  // Product not found state
  if (!loading && !product) {
    return (
      <>
        <SEO 
          title="Product Not Found - The Custom Hub"
        />
        
        <div className="min-h-screen py-8 page-transition">
          <div className="container-custom">
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🔍</div>
              <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
              <p className="text-gray-600 mb-6">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <div className="text-sm text-gray-500 mb-6">
                Redirecting to home page...
              </div>
              <Link to="/" className="btn-primary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen py-8 bg-primary-50 page-transition">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image skeleton */}
            <div>
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse mb-4" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
            
            {/* Info skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-10 bg-gray-200 rounded animate-pulse w-1/4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get category info based on product type (slugified)
  const categoryId = product.type?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') || '';
  const categoryInfo = getCategoryById(categoryId);
  const externalLinks = product.externalLinks || {};
  const availableLinks = Object.entries(externalLinks).filter(([_, url]) => url);

  // Get minimum price from variants
  const getMinPrice = () => {
    if (!product.variants || product.variants.length === 0) {
      return product.price || 0;
    }
    const prices = product.variants
      .map(v => parseFloat(v.price))
      .filter(p => !isNaN(p));
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  // Extract description text from HTML
  const getDescription = () => {
    if (product.description?.short && product.description?.long) {
      const shortText = product.description.short.replace(/<[^>]*>/g, '').trim();
      const longText = product.description.long.replace(/<[^>]*>/g, '').trim();
      return {
        short: product.description.short,
        long: product.description.long,
        isHtml: product.description.long.includes('<'),
        hasMore: shortText !== longText && longText.length > shortText.length
      };
    }
    
    // Parse HTML description
    const desc = product.description || '';
    const plainText = desc.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const isHtml = desc !== plainText && desc.includes('<');
    const hasMore = plainText.length > 200;
    
    return {
      short: plainText.substring(0, 200) + (hasMore ? '...' : ''),
      long: isHtml ? desc : plainText,
      isHtml: isHtml,
      hasMore: hasMore
    };
  };

  const description = getDescription();

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO 
        title={`${product.title} - ${categoryInfo?.name || 'Products'} | The Custom Hub`}
        description={description.short}
        keywords={`${product.title}, ${product.tags?.join(', ')}, Indian merchandise, Bollywood products, Indian cultural items`}
        canonical={`https://thecustomhub.com/product/${productId}`}
      />

      <div className="min-h-screen py-8 bg-gray-50">
        <div className="container-custom">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm animate-fade-in" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="text-primary-600 hover:underline">Home</Link>
              </li>
              <li><span className="text-gray-400">/</span></li>
              <li>
                <Link 
                  to={`/category/${categoryId}`} 
                  className="text-primary-600 hover:underline"
                >
                  {categoryInfo?.name || product.type || 'Products'}
                </Link>
              </li>
              <li><span className="text-gray-400">/</span></li>
              <li className="text-gray-600 truncate max-w-xs">{product.title}</li>
            </ol>
          </nav>

          {/* Main Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Image Gallery */}
            <div className="animate-fade-in">
              {/* Main Image */}
              <div 
                className="card mb-4 overflow-hidden cursor-zoom-in"
                onMouseEnter={() => setImageZoom(true)}
                onMouseLeave={() => setImageZoom(false)}
                onMouseMove={handleMouseMove}
              >
                <div className="aspect-square bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={(() => {
                      const originalUrl = product.images && product.images.length > 0
                        ? (product.images[selectedImage] || product.images[0])
                        : null;
                      const finalUrl = originalUrl 
                        ? getFirebaseImageUrl(originalUrl)
                        : getPlaceholderImage();
                      
                      return finalUrl;
                    })()}
                    alt={`${product.title} - Image ${selectedImage + 1}`}
                    className={`max-h-full max-w-full object-contain p-8 transition-transform duration-300 ${
                      imageZoom ? 'scale-150' : 'scale-100'
                    }`}
                    style={imageZoom ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                    } : {}}
                    onLoad={(e) => {
                      const imgKey = `main-${selectedImage}`;
                      setImageLoadStatus(prev => ({ ...prev, [imgKey]: 'success' }));
                    }}
                    onError={(e) => {
                      const imgKey = `main-${selectedImage}`;
                      setImageLoadStatus(prev => ({ ...prev, [imgKey]: 'error' }));
                      e.target.src = getPlaceholderImage();
                    }}
                  />
                  
                  {/* Stock Badge */}
                  <div className="absolute top-4 right-4">
                    {product.inStock ? (
                      <span className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                        ✓ In Stock
                      </span>
                    ) : (
                      <span className="bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Zoom Hint */}
                  {!imageZoom && (
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                      Hover to zoom
                    </div>
                  )}
                </div>
              </div>
              
              {/* Thumbnail Carousel */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`card aspect-square flex items-center justify-center transition-all ${
                        selectedImage === index 
                          ? 'ring-2 ring-primary-600 shadow-lg' 
                          : 'hover:ring-2 hover:ring-primary-300'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img
                        src={getFirebaseImageUrl(image)}
                        alt={`${product.title} thumbnail ${index + 1}`}
                        className="max-h-full max-w-full object-contain p-2"
                        onLoad={(e) => {
                          const imgKey = `thumb-${index}`;
                          setImageLoadStatus(prev => ({ ...prev, [imgKey]: 'success' }));
                        }}
                        onError={(e) => {
                          const imgKey = `thumb-${index}`;
                          setImageLoadStatus(prev => ({ ...prev, [imgKey]: 'error' }));
                          e.target.src = getPlaceholderImage();
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information Panel */}
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              {/* Category Badge */}
              <div className="mb-4">
                <Link 
                  to={`/category/${categoryId}`}
                  className="inline-flex items-center bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-200 transition-colors"
                >
                  <span className="mr-2">{categoryInfo?.name || product.type}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                {product.vendor && (
                  <span className="ml-2 text-gray-500 text-sm">
                    • by {product.vendor}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.title}</h1>
              
              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary-600">
                  {formatPrice(getMinPrice())}
                </span>
                {product.variants && product.variants.length > 1 && (
                  <span className="ml-2 text-gray-500 text-sm">starting from</span>
                )}
                {!product.inStock && (
                  <span className="ml-4 text-gray-500">Currently Unavailable</span>
                )}
              </div>

              {/* Description with Read More/Less */}
              <div className="mb-6 border-l-4 border-primary-600 pl-4">
                <div className="text-lg text-gray-700 leading-relaxed">
                  {descriptionExpanded ? (
                    description.isHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: description.long }} />
                    ) : (
                      <p>{description.long}</p>
                    )
                  ) : (
                    <p>{description.short}</p>
                  )}
                </div>
                {description.hasMore && (
                  <button
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className="mt-2 text-primary-600 hover:text-primary-700 font-semibold text-sm inline-flex items-center transition-colors"
                  >
                    {descriptionExpanded ? (
                      <>
                        Read Less
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        Read More
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {product.tags.slice(0, 6).map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications Table */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Specifications
                  </h3>
                  <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <span className="font-medium text-gray-700">{key}:</span>
                        <span className="text-gray-600 text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Call-to-Action Buttons */}
              <div className="space-y-3 mb-6">
                <h3 className="text-lg font-semibold flex items-center">
                  <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Where to Buy
                </h3>
                
                {product.inStock && availableLinks.length > 0 ? (
                  <>
                    {availableLinks.map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors group"
                      >
                        <span className="capitalize">Buy on {platform}</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </>
                ) : (
                  <div className="bg-gray-100 text-gray-600 text-center py-3 px-6 rounded-lg">
                    Currently unavailable for purchase
                  </div>
                )}
                
                {/* Contact Us Button */}
                <Link 
                  to="/contact"
                  className="flex items-center justify-center w-full border-2 border-secondary-600 text-secondary-600 hover:bg-secondary-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us for Orders
                </Link>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-r from-secondary-50 to-primary-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-secondary-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">💡 Love our designs?</p>
                    <p className="mb-2">We can create custom tees for your next family vacation, sports team, or Taylor Swift concert group too!</p>
                    <Link 
                      to="/custom-orders"
                      className="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center"
                    >
                      Get Custom Quote
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {relatedProducts.length > 0 && (
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold flex items-center">
                  <svg className="w-6 h-6 mr-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  You May Also Like
                </h2>
                <Link 
                  to={`/category/${categoryId}`}
                  className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
                >
                  View All
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
