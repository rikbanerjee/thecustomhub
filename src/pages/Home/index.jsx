import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import ProductGrid from '../../components/ProductGrid';
import CategoryCard from '../../components/CategoryCard';
import HeroCarousel from '../../components/HeroCarousel';
import { getAllCategories, getFeaturedProducts } from '../../utils/dataHelpers';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching with loading state
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate network delay for better UX demonstration
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const featured = getFeaturedProducts(8);
      const cats = getAllCategories();
      
      setFeaturedProducts(featured);
      setCategories(cats);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO 
        title="The CustomHub - Indian Cultural Apparel & Custom American Lifestyle Merchandise"
        description="Authentic Indian cultural products + custom tees for sports, school events, Taylor Swift concerts, family vacations & more. Based in USA with fast shipping."
        keywords="indian merchandise, diwali shirts, custom t-shirts, sports team apparel, robotics team shirts, family reunion tees, concert group shirts, taylor swift merch, custom holiday shirts, bulk custom apparel USA"
        ogTitle="The CustomHub - Indian Cultural Apparel & Custom American Lifestyle Merchandise"
        ogDescription="Authentic Indian cultural products + custom tees for sports, school events, Taylor Swift concerts, family vacations & more."
        canonical="https://thecustomhub.com/"
      />

      <div className="min-h-screen page-transition">
        {/* Hero Carousel Section */}
        {!loading && categories.length > 0 && (
          <HeroCarousel
            slides={[
              {
                title: 'Celebrate Your Culture, Customize Your Style',
                subtitle: 'Authentic Indian heritage apparel • Custom tees for every American moment',
                description: 'From Diwali celebrations to Taylor Swift concerts, we\'ve got your custom apparel covered',
                background: 'linear-gradient(135deg, var(--color-deep-brown) 0%, var(--color-warm-taupe) 100%)',
                cta: [
                  { text: 'Shop', link: `/category/${categories[0]?.id}` },
                  { text: 'Create Custom Design', link: '/custom-orders' }
                ]
              },
              {
                title: 'Indian Cultural Pride Meets American Life',
                subtitle: 'Authentic Indian heritage apparel • Custom tees for every American moment',
                description: 'From Diwali celebrations to Taylor Swift concerts, we\'ve got your custom apparel covered',
                background: 'linear-gradient(135deg, var(--color-warm-taupe) 0%, var(--color-golden-tan) 100%)',
                cta: [
                  { text: 'Shop', link: `/category/${categories[0]?.id}` },
                  { text: 'Create Custom Design', link: '/custom-orders' }
                ]
              },
              {
                title: 'Custom Designs for Every Occasion',
                subtitle: 'Sports teams, school clubs, family vacations, concert squads, holiday parties',
                description: 'Whatever your occasion, we create custom merchandise that brings your group together',
                background: 'linear-gradient(135deg, var(--color-deep-brown) 0%, #5a4a3a 100%)',
                cta: [
                  { text: 'Start Your Custom Design', link: '/custom-orders' },
                  { text: 'Shop', link: `/category/${categories[0]?.id}` }
                ]
              }
            ]}
            autoRotateInterval={5000}
            showDots={true}
            showArrows={true}
          />
        )}
        
        {/* Fallback Hero Section (if carousel not ready) */}
        {loading && (
          <section className="bg-gradient-to-r from-primary-600 to-primary-500 text-white py-20 md:py-28">
            <div className="container-custom">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="heading-font text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 animate-fade-in">
                  Celebrate Your Culture, Customize Your Style
                </h1>
                <p className="text-xl md:text-2xl mb-4 text-primary-50 animate-fade-in" style={{ animationDelay: '100ms' }}>
                  Authentic Indian heritage apparel • Custom tees for every American moment
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Link to="/category/apparel" className="bg-white text-primary-600 hover:bg-primary-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
                    Shop
                  </Link>
                  <Link to="/custom-orders" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-block">
                    Create Custom Design
                  </Link>
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
                Explore our curated collections of Indian cultural merchandise and Bollywood products
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

        {/* Trust Signals */}
        <section className="py-12 bg-gradient-to-r from-primary-50 to-secondary-50 border-y border-gray-200">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              <div className="animate-fade-in">
                <div className="text-2xl mb-2">✓</div>
                <div className="text-sm font-medium text-gray-700">Made in USA</div>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="text-2xl mb-2">✓</div>
                <div className="text-sm font-medium text-gray-700">Fast 2-3 Week Turnaround</div>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="text-2xl mb-2">✓</div>
                <div className="text-sm font-medium text-gray-700">Bulk Discounts Available</div>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="text-2xl mb-2">✓</div>
                <div className="text-sm font-medium text-gray-700">Free Design Mockups</div>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                <div className="text-2xl mb-2">✓</div>
                <div className="text-sm font-medium text-gray-700">No Minimums</div>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
                <div className="text-2xl mb-2">✓</div>
                <div className="text-sm font-medium text-gray-700">Group Discounts on Custom Orders</div>
              </div>
            </div>
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
                Hand-picked favorites from our authentic Indian cultural merchandise
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

        {/* Custom Designs Section */}
        <section className="py-16 bg-gradient-to-br from-secondary-50 to-primary-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="heading-font text-3xl md:text-4xl font-semibold mb-4">
                Custom Designs for Every Occasion
              </h2>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Beyond our Indian cultural collection, we create custom apparel for all your American lifestyle moments.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <div className="card p-6 hover:shadow-lg transition-shadow animate-fade-in">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold mb-3">Sports & Teams</h3>
                <p className="text-gray-600">Youth sports, fantasy leagues, tailgate parties, March Madness</p>
              </div>
              
              <div className="card p-6 hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-3">School & Competitions</h3>
                <p className="text-gray-600">Robotics teams, science olympiad, debate clubs, academic tournaments</p>
              </div>
              
              <div className="card p-6 hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
                <h3 className="text-xl font-semibold mb-3">Family Events</h3>
                <p className="text-gray-600">Reunions, vacation tees, matching family outfits, milestone celebrations</p>
              </div>
              
              <div className="card p-6 hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold mb-3">Holidays & Parties</h3>
                <p className="text-gray-600">Thanksgiving, 4th of July, Christmas pajamas, birthday parties</p>
              </div>
              
              <div className="card p-6 hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: '400ms' }}>
                <div className="text-4xl mb-4">🎤</div>
                <h3 className="text-xl font-semibold mb-3">Pop Culture & Concerts</h3>
                <p className="text-gray-600">Taylor Swift Eras Tour, Beyoncé, Diljit Dosanjh, Bad Bunny, sports stars</p>
              </div>
              
              <div className="card p-6 hover:shadow-lg transition-shadow animate-fade-in" style={{ animationDelay: '500ms' }}>
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold mb-3">Corporate & Groups</h3>
                <p className="text-gray-600">Company events, Greek life, volunteer groups, club merchandise</p>
              </div>
            </div>
            
            <div className="text-center">
              <Link to="/custom-orders" className="btn-primary text-lg px-8 py-4">
                Start Your Custom Design
              </Link>
            </div>
          </div>
        </section>

        {/* Trending Now Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h3 className="heading-font text-2xl md:text-3xl font-semibold mb-4 flex items-center justify-center">
                <span className="text-3xl mr-3">🔥</span>
                Trending Custom Designs
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="card p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🏈</div>
                <div className="text-sm font-medium">Super Bowl Party Shirts</div>
              </div>
              <div className="card p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🎤</div>
                <div className="text-sm font-medium">Taylor Swift KC Tour Squad</div>
              </div>
              <div className="card p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🤖</div>
                <div className="text-sm font-medium">FIRST Robotics Regionals</div>
              </div>
              <div className="card p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🦃</div>
                <div className="text-sm font-medium">Thanksgiving Family Matching</div>
              </div>
              <div className="card p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🏀</div>
                <div className="text-sm font-medium">March Madness Brackets</div>
              </div>
              <div className="card p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-2xl mb-2">🎭</div>
                <div className="text-sm font-medium">School Musical Cast Shirts</div>
              </div>
            </div>
            
            <div className="text-center">
              <Link to="/custom-orders" className="btn-outline">
                Start Your Custom Design
              </Link>
            </div>
          </div>
        </section>

        {/* Inspiration Gallery Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="heading-font text-3xl md:text-4xl font-semibold mb-4">
                Recent Custom Projects
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Get inspired by what we've created for other customers
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { emoji: '⚽', title: 'Youth Soccer Team' },
                { emoji: '🤖', title: 'FRC Robotics Team' },
                { emoji: '👨‍👩‍👧‍👦', title: 'Disney Vacation Family' },
                { emoji: '🎤', title: 'Taylor Swift Eras Squad' },
                { emoji: '🦃', title: 'Thanksgiving Dinner' },
                { emoji: '🎉', title: 'Durga Puja Group' }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="card p-6 text-center hover:shadow-lg transition-shadow animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-6xl">{item.emoji}</div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="heading-font text-3xl md:text-4xl font-semibold mb-6">
                    About The CustomHub
                  </h2>
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    The CustomHub was born from a simple need: quality Indian cultural 
                    merchandise for the diaspora in America. We started with Durga Puja 
                    tees and Diwali apparel, celebrating India's rich traditions.
                  </p>
                  <p className="text-gray-600 mb-6">
                    As we grew, our customers asked us to create custom designs for their 
                    American lives too—Little League teams, robotics competitions, Taylor 
                    Swift concert groups, family vacation tees, and more.
                  </p>
                  <p className="text-gray-600 mb-6">
                    Today, we're proud to serve both worlds: authentic Indian cultural 
                    products + custom American lifestyle apparel. Because being Indian 
                    American means celebrating ALL your moments.
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
                Ready to Celebrate Your Culture & Style?
              </h2>
              <p className="text-xl mb-8 text-secondary-50">
                Join thousands of happy customers who trust The CustomHub for authentic Indian cultural merchandise and custom American lifestyle apparel
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {categories.length > 0 && (
                  <Link 
                    to={`/category/${categories[0]?.id}`} 
                    className="bg-white text-secondary-600 hover:bg-secondary-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-block"
                  >
                    Shop
                  </Link>
                )}
                <Link 
                  to="/custom-orders" 
                  className="border-2 border-white text-white hover:bg-white hover:text-secondary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-block"
                >
                  Create Custom Design
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
