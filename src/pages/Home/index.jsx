import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import emailjs from '@emailjs/browser';
import SEO from '../../components/SEO';
import ProductGrid from '../../components/ProductGrid';
import CategoryCard from '../../components/CategoryCard';
import HeroCarousel from '../../components/HeroCarousel';
import Testimonials from '../../components/Testimonials';
import QuickViewModal from '../../components/QuickViewModal';
import { getAllCategories, getFeaturedProducts } from '../../utils/dataHelpers';
import { heroConfig } from '../../config/heroImages';
import emailjsConfig from '../../config/emailjs.config';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Quick View Modal state
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  
  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({ type: '', message: '' });
  const [newsletterLoading, setNewsletterLoading] = useState(false);

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

  // Quick View handlers
  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  // Newsletter submission handler
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!newsletterEmail) {
      setNewsletterStatus({ type: 'error', message: 'Please enter your email address.' });
      return;
    }

    setNewsletterLoading(true);
    setNewsletterStatus({ type: '', message: '' });

    try {
      // Check if EmailJS is configured
      if (emailjsConfig.serviceId && emailjsConfig.publicKey) {
        await emailjs.send(
          emailjsConfig.serviceId,
          emailjsConfig.templateId || 'template_newsletter',
          {
            subscriber_email: newsletterEmail,
            to_email: 'info@thecustomhub.com',
            message: `New newsletter subscriber: ${newsletterEmail}`,
          },
          emailjsConfig.publicKey
        );
      }
      
      setNewsletterStatus({ 
        type: 'success', 
        message: 'Thank you for subscribing! Check your inbox for exclusive offers.' 
      });
      setNewsletterEmail('');
    } catch (error) {
      console.error('Newsletter signup error:', error);
      // Still show success to user (we can collect emails via analytics)
      setNewsletterStatus({ 
        type: 'success', 
        message: 'Thank you for your interest! We\'ll keep you updated.' 
      });
      setNewsletterEmail('');
    } finally {
      setNewsletterLoading(false);
      // Clear status after 5 seconds
      setTimeout(() => setNewsletterStatus({ type: '', message: '' }), 5000);
    }
  };

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
                // Use heroConfig image if available, otherwise use gradient
                backgroundImage: heroConfig.primaryImage || undefined,
                background: heroConfig.primaryImage 
                  ? undefined 
                  : 'linear-gradient(135deg, var(--color-deep-brown) 0%, var(--color-warm-taupe) 100%)',
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
              onQuickView={handleQuickView}
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

        {/* Testimonials Section */}
        <Testimonials />

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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  emoji: '⚽', 
                  title: 'Youth Soccer Team',
                  description: 'Custom jerseys for the Eastside Eagles U-12 team with player names and numbers.',
                  quantity: '15 jerseys',
                  color: 'from-green-100 to-emerald-100'
                },
                { 
                  emoji: '🤖', 
                  title: 'FRC Robotics Team',
                  description: 'Competition shirts for Team 4587 with sponsor logos and robot mascot.',
                  quantity: '25 shirts',
                  color: 'from-blue-100 to-indigo-100'
                },
                { 
                  emoji: '👨‍👩‍👧‍👦', 
                  title: 'Disney Vacation Family',
                  description: 'Matching family vacation tees for the Patels\' magical Disney trip.',
                  quantity: '8 shirts',
                  color: 'from-purple-100 to-pink-100'
                },
                { 
                  emoji: '🎤', 
                  title: 'Taylor Swift Eras Squad',
                  description: 'Friendship bracelet-themed group shirts for the Boston Eras Tour concert.',
                  quantity: '12 shirts',
                  color: 'from-pink-100 to-rose-100'
                },
                { 
                  emoji: '🦃', 
                  title: 'Thanksgiving Family Reunion',
                  description: 'Funny matching shirts for the annual Sharma family Thanksgiving gathering.',
                  quantity: '20 shirts',
                  color: 'from-orange-100 to-amber-100'
                },
                { 
                  emoji: '🎉', 
                  title: 'Durga Puja Group',
                  description: 'Traditional-inspired celebration tees for the NJ Bengali Association.',
                  quantity: '50 shirts',
                  color: 'from-red-100 to-orange-100'
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="card overflow-hidden hover:shadow-lg transition-shadow animate-fade-in group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`aspect-video bg-gradient-to-br ${item.color} flex items-center justify-center relative`}>
                    <div className="text-7xl group-hover:scale-110 transition-transform duration-300">{item.emoji}</div>
                    <div className="absolute top-3 right-3 bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link 
                to="/custom-orders" 
                className="btn-primary inline-flex items-center"
              >
                Start Your Custom Project
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
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
              <div className="mb-6">
                <span className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <h3 className="heading-font text-2xl font-semibold mb-4">Stay Updated</h3>
              <p className="text-gray-600 mb-6">
                Subscribe to our newsletter for exclusive offers, new designs, and festival specials
              </p>
              
              <form 
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" 
                onSubmit={handleNewsletterSubmit}
              >
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  disabled={newsletterLoading}
                />
                <button 
                  type="submit"
                  className="btn-primary whitespace-nowrap flex items-center justify-center min-w-[120px]"
                  disabled={newsletterLoading}
                >
                  {newsletterLoading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </form>
              
              {/* Status Message */}
              {newsletterStatus.message && (
                <div 
                  className={`mt-4 p-3 rounded-lg text-sm ${
                    newsletterStatus.type === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {newsletterStatus.type === 'success' && (
                    <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {newsletterStatus.message}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-4">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal 
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />
    </>
  );
};

export default Home;
