import { Link } from 'react-router-dom';

/**
 * Footer Component
 * Site-wide footer with contact info, social links, quick links, and copyright
 * Responsive design with multi-column layout
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-600 text-white mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About / Brand */}
          <div>
            <img 
              src="/src/assets/thecustomhub.svg" 
              alt="The CustomHub" 
              className="h-8 mb-4 w-auto"
            />
            <p className="text-gray-400 mb-4 leading-relaxed">
              Your source for authentic Indian cultural merchandise 
              and custom American lifestyle apparel. Based in USA.
            </p>
            <p className="text-sm text-gray-500">
              Indian Cultural Apparel • Custom Designs for American Life
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/category/apparel" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Indian Cultural Apparel
                </Link>
              </li>
              <li>
                <Link 
                  to="/category/apparel" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Diwali & Festival Wear
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Regional Indian Designs
                </Link>
              </li>
            </ul>
          </div>

          {/* Custom Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Custom</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/custom-orders" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sports Teams
                </Link>
              </li>
              <li>
                <Link 
                  to="/custom-orders" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  School & Clubs
                </Link>
              </li>
              <li>
                <Link 
                  to="/custom-orders" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Family Events
                </Link>
              </li>
              <li>
                <Link 
                  to="/custom-orders" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Pop Culture
                </Link>
              </li>
              <li>
                <Link 
                  to="/custom-orders" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Bulk Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:personalizedbyrisa@gmail.com" className="hover:text-white transition-colors">
                  personalizedbyrisa@gmail.com
                </a>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+15087334489" className="hover:text-white transition-colors">
                  +1 (508) 733-4489
                </a>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div>Mon-Fri: 9am - 6pm EST</div>
                  <div className="text-sm">Sat-Sun: Closed</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              <a
                href="https://www.facebook.com/profile.php?id=100089498294090"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              
              <a
                href="https://www.instagram.com/thekustomhub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
              <a
                href="https://www.etsy.com/shop/ShopTheCustomHub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
                aria-label="Etsy"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.564 2.445c0-.325.033-.652.099-.98.083-.394.234-.74.413-.99.18-.233.407-.457.695-.663a3.544 3.544 0 0 1 1.095-.549c.365-.14.777-.22 1.23-.22.452 0 .864.08 1.23.22a3.544 3.544 0 0 1 1.095.549c.288.206.515.43.695.663.18.25.33.596.413.99.066.328.099.655.099.98v.31h4.781c.717 0 1.362.12 1.936.36.574.24 1.07.58 1.488 1.02.42.44.75.97.99 1.59.24.62.36 1.3.36 2.04 0 .74-.12 1.42-.36 2.04-.24.62-.57 1.15-.99 1.59-.42.44-.914.78-1.488 1.02-.574.24-1.219.36-1.936.36h-3.172v5.78c0 .4-.03.78-.09 1.14-.06.36-.15.7-.27 1.02-.12.32-.27.61-.45.87-.18.26-.39.49-.63.69-.24.2-.51.37-.81.51-.3.14-.63.25-.99.33-.36.08-.75.12-1.17.12-.42 0-.81-.04-1.17-.12-.36-.08-.69-.19-.99-.33-.3-.14-.57-.31-.81-.51-.24-.2-.45-.43-.63-.69-.18-.26-.33-.55-.45-.87-.12-.32-.21-.66-.27-1.02-.06-.36-.09-.74-.09-1.14V2.445zm1.737 1.244v4.609h3.186c.74 0 1.318-.19 1.737-.57.419-.38.628-.91.628-1.588 0-.677-.21-1.208-.628-1.588-.419-.38-.997-.57-1.737-.57h-3.186z"/>
                </svg>
              </a>
              
              <a
                href="https://pinterest.com/thecustomhub"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
                aria-label="Pinterest"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                </svg>
              </a>
            </div>
            <p className="text-sm text-gray-500">
              Stay connected for updates and exclusive offers
            </p>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe for exclusive offers and new arrivals
            </p>
            <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                required
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} The CustomHub. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#terms" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#shipping" className="hover:text-white transition-colors">
                Shipping Policy
              </a>
            </div>
          </div>

          {/* Made with love note */}
          <p className="text-gray-500 text-xs text-center mt-4">
            Made with ❤️ for cultural enthusiasts everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
