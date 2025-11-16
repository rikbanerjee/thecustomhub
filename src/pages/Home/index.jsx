import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import ProductGrid from '../../components/ProductGrid';
import CategoryCard from '../../components/CategoryCard';
import { getAllCategories, getFeaturedProducts, getProductStats } from '../../utils/dataHelpers';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching with loading state
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate network delay for better UX demonstration
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const featured = getFeaturedProducts(8);
      const cats = getAllCategories();
      const catalogStats = getProductStats();
      
      setFeaturedProducts(featured);
      setCategories(cats);
      setStats(catalogStats);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO 
        title="The Custom Hub - Bengali & Bollywood Cultural Merchandise"
        description="Discover unique Bengali and Bollywood cultural merchandise. Shop authentic Indian and American cultural products including apparel, home decor, and accessories."
        keywords="Bengali merchandise, Bollywood products, Indian cultural items, NRI gifts, Durga Puja, cultural apparel"
        ogTitle="The Custom Hub - Celebrate Your Heritage"
        ogDescription="Unique Bengali and Bollywood cultural merchandise"
        canonical="https://thecustomhub.com/"
      />

      <div className="min-h-screen page-transition">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-20 md:py-28">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="heading-font text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 animate-fade-in">
                Celebrate Your Heritage
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-primary-50 animate-fade-in" style={{ animationDelay: '100ms' }}>
                Discover unique Bengali and Bollywood cultural merchandise
              </p>
              <p className="text-lg md:text-xl mb-8 text-primary-100 animate-fade-in" style={{ animationDelay: '200ms' }}>
                {stats && (
                  <>
                    Shop from {stats.totalProducts}+ products across {stats.totalCategories} categories
                  </>
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '300ms' }}>
                {categories.length > 0 && (
                  <>
                    <Link 
                      to={`/category/${categories[0]?.id}`} 
                      className="btn-secondary inline-block"
                    >
                      Shop {categories[0]?.name}
                    </Link>
                    {categories.length > 1 && (
                      <Link 
                        to={`/category/${categories[1]?.id}`} 
                        className="bg-white text-primary-600 hover:bg-primary-50 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 inline-block"
                      >
                        Browse {categories[1]?.name}
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        {stats && !loading && (
          <section className="bg-white border-b border-gray-200 py-8">
            <div className="container-custom">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <div className="text-3xl md:text-4xl font-bold text-primary-600">
                    {stats.totalProducts}+
                  </div>
                  <div className="text-gray-600 mt-1">Products</div>
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <div className="text-3xl md:text-4xl font-bold text-primary-600">
                    {stats.totalCategories}
                  </div>
                  <div className="text-gray-600 mt-1">Categories</div>
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                  <div className="text-3xl md:text-4xl font-bold text-primary-600">
                    100%
                  </div>
                  <div className="text-gray-600 mt-1">Authentic</div>
                </div>
                <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                  <div className="text-3xl md:text-4xl font-bold text-primary-600">
                    ${stats.minPrice}+
                  </div>
                  <div className="text-gray-600 mt-1">Starting Price</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section className="py-16 section-soft">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="heading-font text-3xl md:text-4xl font-semibold mb-4">
                Shop by Category
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Explore our curated collections of Bengali and Bollywood merchandise
              </p>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category, index) => (
                  <div 
                    key={category.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CategoryCard category={category} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="heading-font text-3xl md:text-4xl font-semibold mb-4">
                Featured Products
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Hand-picked favorites from our collection
              </p>
            </div>
            
            <ProductGrid 
              products={featuredProducts}
              loading={loading}
              columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
              emptyMessage="No featured products available at the moment"
            />
            
            {!loading && featuredProducts.length > 0 && categories.length > 0 && (
              <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <Link to={`/category/${categories[0]?.id}`} className="btn-primary mr-4">
                  Browse All Products
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="heading-font text-3xl md:text-4xl font-semibold mb-6">
                    About The Custom Hub
                  </h2>
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    We bring together the best of Bengali and Bollywood cultural heritage 
                    through unique, high-quality merchandise. Perfect for celebrating 
                    your identity or anyone who appreciates rich cultural traditions.
                  </p>
                  <p className="text-gray-600 mb-6">
                    From authentic Durga Puja merchandise to vintage Bollywood posters, 
                    each product tells a story of our vibrant cultural heritage. We're 
                    passionate about making these treasures accessible to everyone.
                  </p>
                  <Link to="/contact" className="btn-outline">
                    Learn More
                  </Link>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <div className="text-4xl mb-3">🎨</div>
                    <h3 className="font-semibold mb-2">Authentic</h3>
                    <p className="text-sm text-gray-600">Genuine cultural products</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <div className="text-4xl mb-3">✨</div>
                    <h3 className="font-semibold mb-2">Quality</h3>
                    <p className="text-sm text-gray-600">Premium materials</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <div className="text-4xl mb-3">🚚</div>
                    <h3 className="font-semibold mb-2">Fast Shipping</h3>
                    <p className="text-sm text-gray-600">Quick delivery</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <div className="text-4xl mb-3">💝</div>
                    <h3 className="font-semibold mb-2">Perfect Gifts</h3>
                    <p className="text-sm text-gray-600">For every occasion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call-to-Action Section */}
        <section className="py-16 bg-gradient-to-r from-secondary-600 to-secondary-500 text-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="heading-font text-3xl md:text-4xl font-semibold mb-6">
                Ready to Celebrate Your Heritage?
              </h2>
              <p className="text-xl mb-8 text-secondary-50">
                Join thousands of happy customers who trust The Custom Hub for authentic cultural merchandise
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {categories.length > 0 && (
                  <Link 
                    to={`/category/${categories[0]?.id}`} 
                    className="bg-white text-secondary-600 hover:bg-secondary-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-block"
                  >
                    Start Shopping
                  </Link>
                )}
                <Link 
                  to="/contact" 
                  className="border-2 border-white text-white hover:bg-white hover:text-secondary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-block"
                >
                  Custom Orders
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 bg-white border-t border-gray-200">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="heading-font text-2xl font-semibold mb-4">Stay Updated</h3>
              <p className="text-gray-600 mb-6">
                Subscribe to our newsletter for exclusive offers and new product announcements
              </p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <button 
                  type="submit"
                  className="btn-primary whitespace-nowrap"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
