import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import ProductGrid from '../../components/ProductGrid';
import SearchBar from '../../components/SearchBar';
import { 
  searchProducts, 
  sortProducts, 
  filterProducts,
  getAllCategories 
} from '../../utils/dataHelpers';

/**
 * Search Results Page
 * Displays search results with filters, sorting, and URL query parameter support
 */
const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allResults, setAllResults] = useState([]);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [categories, setCategories] = useState([]);

  const searchQuery = searchParams.get('q') || '';

  // Price filter options
  const priceRanges = {
    'all': { label: 'All Prices', min: 0, max: Infinity },
    'under-25': { label: 'Under $25', min: 0, max: 25 },
    '25-50': { label: '$25 - $50', min: 25, max: 50 },
    'over-50': { label: 'Over $50', min: 50, max: Infinity }
  };

  useEffect(() => {
    const cats = getAllCategories();
    setCategories(cats);
  }, []);

  useEffect(() => {
    // Perform search when query changes
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setAllResults([]);
        setDisplayedResults([]);
        return;
      }

      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const results = searchProducts(searchQuery);
      setAllResults(results);
      setDisplayedResults(results);
      setLoading(false);
    };

    performSearch();
  }, [searchQuery]);

  useEffect(() => {
    // Apply filters and sorting
    let processed = [...allResults];

    // Category filter
    if (categoryFilter !== 'all') {
      processed = processed.filter(p => p.category === categoryFilter);
    }

    // Price filter
    if (priceFilter !== 'all') {
      const range = priceRanges[priceFilter];
      processed = processed.filter(p => 
        p.price >= range.min && p.price <= range.max
      );
    }

    // Sort (relevance is already sorted from search)
    if (sortBy !== 'relevance') {
      processed = sortProducts(processed, sortBy);
    }

    setDisplayedResults(processed);
  }, [allResults, sortBy, categoryFilter, priceFilter]);

  const handleSearch = (query) => {
    if (query.trim()) {
      setSearchParams({ q: query });
    } else {
      setSearchParams({});
    }
  };

  const handleClearFilters = () => {
    setSortBy('relevance');
    setCategoryFilter('all');
    setPriceFilter('all');
  };

  const hasActiveFilters = sortBy !== 'relevance' || categoryFilter !== 'all' || priceFilter !== 'all';

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO 
        title={searchQuery ? `Search Results for "${searchQuery}" - The Custom Hub` : 'Search Products - The Custom Hub'}
        description={`Search results for "${searchQuery}" in our Bengali and Bollywood cultural merchandise catalog.`}
        canonical={`https://thecustomhub.com/search?q=${encodeURIComponent(searchQuery)}`}
      />

      <div className="min-h-screen py-8 bg-gray-50">
        <div className="container-custom">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {searchQuery ? (
                <>
                  Search Results for "<span className="text-primary-600">{searchQuery}</span>"
                </>
              ) : (
                'Search Products'
              )}
            </h1>
            
            {/* Search Bar */}
            <div className="max-w-2xl">
              <SearchBar 
                onSearch={handleSearch}
                initialValue={searchQuery}
                placeholder="Search products..."
                showSuggestions={false}
              />
            </div>
          </div>

          {searchQuery && (
            <>
              {/* Filters and Sort */}
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Category Filter */}
                  <div className="md:col-span-4">
                    <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      id="category-filter"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Filter */}
                  <div className="md:col-span-3">
                    <label htmlFor="price-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <select
                      id="price-filter"
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    >
                      {Object.entries(priceRanges).map(([key, range]) => (
                        <option key={key} value={key}>{range.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="md:col-span-4">
                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      id="sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="name-asc">Name: A to Z</option>
                      <option value="name-desc">Name: Z to A</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <div className="md:col-span-1 flex items-end">
                      <button 
                        onClick={handleClearFilters}
                        className="w-full px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium border border-primary-200 hover:border-primary-300 rounded-lg transition-colors"
                        title="Clear filters"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {categoryFilter !== 'all' && (
                      <span className="inline-flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                        Category: {categories.find(c => c.id === categoryFilter)?.name}
                        <button 
                          onClick={() => setCategoryFilter('all')}
                          className="ml-2 hover:text-primary-900"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {sortBy !== 'relevance' && (
                      <span className="inline-flex items-center bg-secondary-100 text-secondary-800 px-3 py-1 rounded-full text-sm">
                        Sort: {sortBy === 'name-asc' ? 'A-Z' : sortBy === 'name-desc' ? 'Z-A' : sortBy === 'price-asc' ? 'Price ↑' : 'Price ↓'}
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

              {/* Results Count */}
              <div className="mb-6">
                <p className="text-gray-600">
                  {displayedResults.length > 0 ? (
                    <>
                      Showing <span className="font-semibold">{displayedResults.length}</span> of <span className="font-semibold">{allResults.length}</span> results
                    </>
                  ) : (
                    'No results found'
                  )}
                </p>
              </div>

              {/* Results Grid */}
              <ProductGrid 
                products={displayedResults}
                loading={loading}
                emptyMessage={`No products found matching "${searchQuery}"`}
                emptyAction={
                  hasActiveFilters ? (
                    <button 
                      onClick={handleClearFilters}
                      className="btn-outline mr-3"
                    >
                      Clear Filters
                    </button>
                  ) : null
                }
              />
            </>
          )}

          {/* Empty State (no search query) */}
          {!searchQuery && (
            <div className="text-center py-16">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                Start Your Search
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Search our collection of Bengali and Bollywood cultural merchandise
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/category/apparel" className="btn-primary">
                  Browse Apparel
                </Link>
                <Link to="/category/home-decor" className="btn-outline">
                  Browse Home Decor
                </Link>
                <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchResults;

