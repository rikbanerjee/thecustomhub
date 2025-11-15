import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import ProductGrid from '../../components/ProductGrid';
import SearchBar from '../../components/SearchBar';
import { 
  getProductsByCategory, 
  getCategoryById, 
  searchProducts,
  sortProducts 
} from '../../utils/dataHelpers';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name-asc');
  const [priceFilter, setPriceFilter] = useState('all');

  // Price filter options
  const priceRanges = {
    'all': { label: 'All Prices', min: 0, max: Infinity },
    'under-25': { label: 'Under $25', min: 0, max: 25 },
    '25-50': { label: '$25 - $50', min: 25, max: 50 },
    'over-50': { label: 'Over $50', min: 50, max: Infinity }
  };

  useEffect(() => {
    // Fetch category data
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Find the category
      const foundCategory = getCategoryById(categoryName);
      setCategory(foundCategory);

      // Get all products in this category
      const products = getProductsByCategory(categoryName);
      setAllProducts(products);
      setFilteredProducts(products);
      setDisplayedProducts(products);
      
      setLoading(false);
    };

    fetchData();
  }, [categoryName]);

  useEffect(() => {
    // Apply search filter
    let filtered = allProducts;
    
    if (searchQuery.trim() !== '') {
      const searchResults = searchProducts(searchQuery);
      // Only show results that are in this category
      filtered = searchResults.filter(
        product => product.category === categoryName
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchQuery, allProducts, categoryName]);

  useEffect(() => {
    // Apply price filter and sorting
    let processed = [...filteredProducts];
    
    // Price filter
    if (priceFilter !== 'all') {
      const range = priceRanges[priceFilter];
      processed = processed.filter(p => 
        p.price >= range.min && p.price <= range.max
      );
    }
    
    // Sorting
    processed = sortProducts(processed, sortBy);
    
    setDisplayedProducts(processed);
  }, [filteredProducts, sortBy, priceFilter]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('name-asc');
    setPriceFilter('all');
  };

  const hasActiveFilters = searchQuery || sortBy !== 'name-asc' || priceFilter !== 'all';

  if (!loading && !category) {
    return (
      <>
        <SEO 
          title="Category Not Found - The Custom Hub"
        />
        
        <div className="min-h-screen py-8">
          <div className="container-custom">
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🔍</div>
              <h1 className="text-3xl font-bold mb-4">Category Not Found</h1>
              <p className="text-gray-600 mb-6">
                The category you're looking for doesn't exist or has been removed.
              </p>
              <Link to="/" className="btn-primary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      {category && (
        <SEO 
          title={`${category.name} - Bengali & Bollywood Merchandise | The Custom Hub`}
          description={`Shop ${category.name.toLowerCase()} - ${category.description}. Browse our collection of authentic Bengali and Bollywood cultural products.`}
          keywords={`${category.name}, Bengali ${category.name}, Bollywood merchandise, cultural products`}
          canonical={`https://thecustomhub.com/category/${categoryName}`}
        />
      )}

      <div className="min-h-screen py-8 bg-gray-50">
        <div className="container-custom">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm" aria-label="Breadcrumb">
            <Link to="/" className="text-primary-600 hover:underline">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-600">{category?.name || 'Loading...'}</span>
          </nav>

          {/* Category Header */}
          {!loading && category && (
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-8 animate-fade-in">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {category.image && (
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-24 h-24 object-cover rounded-lg shadow-md"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">{category.name}</h1>
                  {category.description && (
                    <p className="text-gray-600 text-lg">{category.description}</p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <span>{allProducts.length} {allProducts.length === 1 ? 'product' : 'products'} available</span>
                    {allProducts.length > 0 && (
                      <>
                        <span>•</span>
                        <span>
                          {displayedProducts.filter(p => p.inStock).length} in stock
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          {!loading && (
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Search Bar */}
                <div className="md:col-span-5">
                  <SearchBar 
                    onSearch={handleSearch}
                    placeholder={`Search in ${category?.name || 'category'}...`}
                    initialValue={searchQuery}
                  />
                </div>

                {/* Sort Dropdown */}
                <div className="md:col-span-3">
                  <label htmlFor="sort" className="sr-only">Sort by</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>

                {/* Price Filter */}
                <div className="md:col-span-3">
                  <label htmlFor="price" className="sr-only">Filter by price</label>
                  <select
                    id="price"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                  >
                    {Object.entries(priceRanges).map(([key, range]) => (
                      <option key={key} value={key}>{range.label}</option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="md:col-span-1 flex items-center">
                    <button 
                      onClick={handleClearFilters}
                      className="w-full px-4 py-3 text-sm text-primary-600 hover:text-primary-700 font-medium border border-primary-200 hover:border-primary-300 rounded-lg transition-colors"
                      title="Clear all filters"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {searchQuery && (
                    <span className="inline-flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                      Search: "{searchQuery}"
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="ml-2 hover:text-primary-900"
                        aria-label="Clear search"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {sortBy !== 'name-asc' && (
                    <span className="inline-flex items-center bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm">
                      Sort: {sortBy === 'name-desc' ? 'Z to A' : sortBy === 'price-asc' ? 'Price ↑' : 'Price ↓'}
                    </span>
                  )}
                  {priceFilter !== 'all' && (
                    <span className="inline-flex items-center bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm">
                      Price: {priceRanges[priceFilter].label}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Results Count */}
          {!loading && (
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing {displayedProducts.length} of {allProducts.length} {allProducts.length === 1 ? 'product' : 'products'}
              </p>
              {hasActiveFilters && (
                <button 
                  onClick={handleClearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Reset all filters
                </button>
              )}
            </div>
          )}

          {/* Products Grid */}
          <ProductGrid 
            products={displayedProducts}
            loading={loading}
            emptyMessage={
              searchQuery 
                ? `No products found matching "${searchQuery}"`
                : hasActiveFilters
                ? "No products match your filters"
                : allProducts.length === 0
                ? `No products available in ${category?.name || 'this category'} yet`
                : "No products found"
            }
            emptyAction={
              hasActiveFilters ? (
                <button 
                  onClick={handleClearFilters}
                  className="btn-outline"
                >
                  Clear All Filters
                </button>
              ) : allProducts.length === 0 ? (
                <Link to="/" className="btn-primary">
                  Browse Other Categories
                </Link>
              ) : null
            }
          />

          {/* Category Info Footer */}
          {!loading && displayedProducts.length > 0 && (
            <div className="mt-12 bg-white rounded-lg shadow-sm p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">About {category?.name}</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {category?.description || `Explore our curated collection of ${category?.name.toLowerCase()} featuring authentic Bengali and Bollywood cultural designs. Each product is carefully selected to celebrate your heritage with quality and style.`}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact" className="btn-outline">
                  Custom Orders Available
                </Link>
                <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                  Browse Other Categories
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
