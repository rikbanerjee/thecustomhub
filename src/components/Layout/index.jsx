import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from '../Header';
import Footer from '../Footer';

/**
 * Layout Component
 * Wraps all pages with consistent Header and Footer
 * Handles scroll restoration and main content area styling
 */
const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Site Header - Sticky navigation */}
      <Header />
      
      {/* Main Content Area */}
      <main 
        className="flex-grow"
        role="main"
        id="main-content"
      >
        <Outlet />
      </main>
      
      {/* Site Footer */}
      <Footer />
      
      {/* Skip to main content link (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>
    </div>
  );
};

export default Layout;
