import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { searchProducts } from '../../utils/dataHelpers';

/**
 * SearchBar Component
 * Advanced search input with debounce, suggestions dropdown, and clear button
 * Features mobile-optimized layout and keyboard navigation
 */
const SearchBar = ({ 
  onSearch, 
  placeholder = "Search products...", 
  initialValue = "",
  showSuggestions = true,
  debounceMs = 300,
  maxSuggestions = 5
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update initial value when prop changes
  useEffect(() => {
    setSearchQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
      setShowDropdown(false);
    }
  };

  const performSearch = (query) => {
    if (onSearch) {
      onSearch(query);
    } else {
      // Navigate to search results page if no handler provided
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Show dropdown when typing
    if (value.trim() && showSuggestions) {
      setShowDropdown(true);
      setIsSearching(true);
    } else {
      setShowDropdown(false);
      setSuggestions([]);
    }

    // Debounced search
    debounceTimer.current = setTimeout(() => {
      if (value.trim()) {
        // Get search results for suggestions
        const results = searchProducts(value);
        setSuggestions(results.slice(0, maxSuggestions));
        setIsSearching(false);
        
        // Also trigger the search callback
        if (onSearch) {
          onSearch(value);
        }
      } else {
        setSuggestions([]);
        setIsSearching(false);
        if (onSearch) {
          onSearch('');
        }
      }
    }, debounceMs);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    
    if (onSearch) {
      onSearch('');
    }
  };

  const handleSuggestionClick = (product) => {
    setShowDropdown(false);
    setSearchQuery('');
    navigate(`/product/${product.id}`);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;

      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          performSearch(searchQuery);
          setShowDropdown(false);
        }
        break;

      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;

      default:
        break;
    }
  };

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchQuery.trim() && suggestions.length > 0) {
                setShowDropdown(true);
              }
            }}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            aria-label="Search products"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls="search-suggestions"
          />
          
          {/* Search Icon */}
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          
          {/* Clear Button or Loading Spinner */}
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              {isSearching ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && showDropdown && suggestions.length > 0 && (
        <div 
          id="search-suggestions"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto animate-fade-in"
          role="listbox"
        >
          {suggestions.map((product, index) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              onClick={() => handleSuggestionClick(product)}
              className={`flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? 'bg-primary-50' : ''
              }`}
              role="option"
              aria-selected={index === selectedIndex}
            >
              {/* Product Image */}
              <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg overflow-hidden mr-4">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                />
              </div>
              
              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {highlightMatch(product.title, searchQuery)}
                </h4>
                <p className="text-sm text-gray-600 truncate">
                  {product.description.short}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-primary-600">
                    ${product.price}
                  </span>
                  {product.inStock ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow Icon */}
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}

          {/* View All Results */}
          <button
            onClick={() => {
              performSearch(searchQuery);
              setShowDropdown(false);
            }}
            className="w-full p-3 text-center text-primary-600 hover:bg-primary-50 font-medium transition-colors border-t border-gray-200"
          >
            View all results for "{searchQuery}"
          </button>
        </div>
      )}

      {/* No Results Message */}
      {showSuggestions && showDropdown && !isSearching && searchQuery.trim() && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-6 text-center animate-fade-in">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 font-medium">No products found</p>
          <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
        </div>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
  initialValue: PropTypes.string,
  showSuggestions: PropTypes.bool,
  debounceMs: PropTypes.number,
  maxSuggestions: PropTypes.number,
};

export default SearchBar;
