import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SearchBar from '../SearchBar';
import { getAllCategories } from '../../utils/dataHelpers';

/**
 * Header Component
 * Site-wide navigation with logo, menu, search, categories dropdown, and mobile drawer
 * Features sticky positioning and accessibility optimizations
 */
const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories
    const cats = getAllCategories();
    setCategories(cats);
  }, []);

  useEffect(() => {
    // Handle scroll for sticky header effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Prevent body scroll when mobile menu is open
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setCategoriesOpen(false);
    setShowSearch(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setCategoriesOpen(false);
    setShowSearch(false);
  };

  const toggleCategories = () => {
    setCategoriesOpen(!categoriesOpen);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSearch(false);
    }
  };

  return (
    <>
      <header 
        className={`bg-primary-50/90 backdrop-blur sticky top-0 z-50 border-b border-soft-gray transition-shadow duration-300 ${
          isScrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="container-custom">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link 
              to="/" 
              className="text-2xl md:text-3xl font-bold heading-font text-primary-600 hover:text-primary-700 transition-colors"
              onClick={closeMobileMenu}
            >
              The Custom Hub
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6" role="navigation" aria-label="Main navigation">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `font-medium transition-colors ${
                    isActive ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                  }`
                }
              >
                Home
              </NavLink>

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleCategories}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setTimeout(() => setCategoriesOpen(false), 200);
                    }
                  }}
                  className="font-medium text-gray-700 hover:text-primary-600 transition-colors flex items-center"
                  aria-expanded={categoriesOpen}
                  aria-haspopup="true"
                >
                  Categories
                  <svg 
                    className={`w-4 h-4 ml-1 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {categoriesOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-fade-in"
                    role="menu"
                  >
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/category/${category.id}`}
                        className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                        onClick={() => setCategoriesOpen(false)}
                        role="menuitem"
                      >
                        <span className="text-2xl mr-3">
                          {getCategoryIcon(category.id)}
                        </span>
                        <div>
                          <div className="font-medium text-gray-800">{category.name}</div>
                          <div className="text-xs text-gray-500">
                            {category.productCount} products
                          </div>
                        </div>
                      </Link>
                    ))}
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Link
                        to="/"
                        className="flex items-center px-4 py-2 text-primary-600 hover:bg-primary-50 transition-colors font-medium"
                        onClick={() => setCategoriesOpen(false)}
                      >
                        View All Products
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `font-medium transition-colors ${
                    isActive ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
                  }`
                }
              >
                Contact
              </NavLink>

              {/* Search Icon */}
              <button
                onClick={toggleSearch}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle search"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </nav>

            {/* Mobile: Search + Menu Buttons */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                onClick={toggleSearch}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle search"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop Search Dropdown */}
          {showSearch && (
            <div className="py-4 border-t border-gray-200 animate-fade-in">
              <div className="max-w-2xl mx-auto">
                <SearchBar 
                  onSearch={handleSearch}
                  placeholder="Search Indian cultural merchandise..."
                  showSuggestions={true}
                  maxSuggestions={6}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Slide-out Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } shadow-2xl`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="text-xl font-bold text-primary-600">Menu</span>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Content */}
          <nav className="flex-1 overflow-y-auto py-4" role="navigation">
            <div className="flex flex-col space-y-1 px-4">
              {/* Search in Mobile Menu */}
              <div className="mb-4">
                <SearchBar 
                  onSearch={(query) => {
                    handleSearch(query);
                    closeMobileMenu();
                  }}
                  placeholder="Search..."
                  showSuggestions={false}
                />
              </div>

              <NavLink
                to="/"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `font-medium py-3 px-4 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                Home
              </NavLink>

              {/* Categories Section */}
              <div className="py-2">
                <button
                  onClick={toggleCategories}
                  className="flex items-center justify-between w-full font-medium py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  aria-expanded={categoriesOpen}
                >
                  <span>Categories</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {categoriesOpen && (
                  <div className="ml-4 mt-2 space-y-1 animate-fade-in">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/category/${category.id}`}
                        onClick={closeMobileMenu}
                        className="flex items-center py-2 px-4 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <span className="text-xl mr-3">{getCategoryIcon(category.id)}</span>
                        <span>{category.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <NavLink
                to="/contact"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `font-medium py-3 px-4 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                Contact
              </NavLink>
            </div>
          </nav>

          {/* Mobile Menu Footer */}
          <div className="border-t border-gray-200 p-4">
            <p className="text-sm text-gray-600 text-center">
              © {new Date().getFullYear()} The Custom Hub
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

/**
 * Get category icon by ID
 */
const getCategoryIcon = (categoryId) => {
  const icons = {
    'apparel': '👕',
    'home-decor': '🏠',
    'accessories': '👜',
    'gifts': '🎁',
  };
  return icons[categoryId] || '🎨';
};

export default Header;
