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
import { useCart } from '../../contexts/CartContext';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageZoom, setImageZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [imageLoadStatus, setImageLoadStatus] = useState({});
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

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

  // Meaningful variants (skip null/empty rows and "Default Title")
  const meaningfulVariants = (product.variants || []).filter(
    (v) => v.price && v.option1 && v.option1 !== 'Default Title'
  );

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

              {/* Variant Selector */}
              {meaningfulVariants.length > 0 && (
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Size / Option
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {meaningfulVariants.map((v) => {
                      const label = [v.option1, v.option2, v.option3]
                        .filter((o) => o && o !== 'Default Title')
                        .join(' / ');
                      const isSelected = selectedVariant?.sku === v.sku;
                      return (
                        <button
                          key={v.sku || label}
                          onClick={() => setSelectedVariant(isSelected ? null : v)}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                            isSelected
                              ? 'border-primary-600 bg-primary-600 text-white'
                              : 'border-gray-200 hover:border-primary-400 text-gray-700'
                          }`}
                        >
                          {label}
                          {v.price && ` — ${formatPrice(parseFloat(v.price))}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              {product.inStock && (
                <div className="mb-5">
                  <button
                    onClick={() => {
                      const variant = meaningfulVariants.length > 0 ? (selectedVariant || meaningfulVariants[0]) : null;
                      addItem(product, variant);
                      setAddedToCart(true);
                      setTimeout(() => setAddedToCart(false), 2000);
                    }}
                    className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 px-6 rounded-xl transition-all ${
                      addedToCart
                        ? 'bg-green-600 text-white'
                        : 'bg-primary-400 hover:bg-primary-500 text-primary-900'
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Added to Cart!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Also Available On — only show when external links exist */}
              {availableLinks.length > 0 && product.inStock && (
                <div className="space-y-3 mb-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Also Available On</p>
                  {availableLinks.map(([platform, url]) => {
                    const isEtsy = platform.toLowerCase() === 'etsy';
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between w-full font-semibold py-3 px-6 rounded-lg transition-colors group ${
                          isEtsy
                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                            : 'bg-primary-600 hover:bg-primary-700 text-white'
                        }`}
                      >
                        <span className="capitalize">
                          {isEtsy ? 'Shop on Etsy' : `Buy on ${platform}`}
                        </span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* WhatsApp Order Button — always visible */}
              <div className="mb-6">
                <a
                  href={`https://wa.me/15087334489?text=${encodeURIComponent(`Hi! I'm interested in ordering "${product.title}" from TheCustomHub. Could you help me place the order? Thanks!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Order via WhatsApp
                </a>
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
