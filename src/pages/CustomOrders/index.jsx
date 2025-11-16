import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const CustomOrders = () => {
  return (
    <>
      <SEO 
        title="Custom Apparel Orders - The CustomHub"
        description="Custom apparel for sports teams, school clubs, family vacations, concert squads, holiday parties & more. Get a free quote for your custom design."
        keywords="custom t-shirts, sports team apparel, robotics team shirts, family reunion tees, concert group shirts, custom holiday shirts, bulk custom apparel"
        canonical="https://thecustomhub.com/custom-orders"
      />

      <div className="min-h-screen py-8 bg-primary-50 page-transition">
        <div className="container-custom">
          {/* Hero Section */}
          <div className="text-center mb-12 py-12 animate-fade-in">
            <h1 className="heading-font text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
              Custom Apparel for Every American Moment
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
              Sports teams. School clubs. Family vacations. Concert squads. Holiday parties. 
              Whatever your occasion, we create custom merchandise that brings your group together.
            </p>
          </div>

          {/* Popular Custom Categories */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Popular Custom Categories</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {/* Sports & Fitness */}
              <div className="card p-6 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-2xl font-semibold mb-4">Sports & Fitness</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Youth sports teams (soccer, baseball, basketball)</li>
                  <li>• Fantasy football leagues</li>
                  <li>• Running clubs and 5K teams</li>
                  <li>• Gym and fitness groups</li>
                  <li>• Tailgate parties</li>
                </ul>
              </div>

              {/* School & Activities */}
              <div className="card p-6 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">🎓</div>
                <h3 className="text-2xl font-semibold mb-4">School & Activities</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Robotics teams (FRC, FTC, VEX)</li>
                  <li>• Science Olympiad</li>
                  <li>• Debate and Model UN</li>
                  <li>• Band and choir groups</li>
                  <li>• School spirit wear</li>
                  <li>• Academic competition teams</li>
                </ul>
              </div>

              {/* Family & Celebrations */}
              <div className="card p-6 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
                <h3 className="text-2xl font-semibold mb-4">Family & Celebrations</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Family reunion tees</li>
                  <li>• Vacation matching outfits</li>
                  <li>• Milestone birthdays (Sweet 16, 50th, etc.)</li>
                  <li>• Baby announcements</li>
                  <li>• Wedding parties</li>
                  <li>• Disney/Universal trips</li>
                </ul>
              </div>

              {/* Holidays & Events */}
              <div className="card p-6 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-semibold mb-4">Holidays & Events</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Thanksgiving dinner matching tees</li>
                  <li>• 4th of July party shirts</li>
                  <li>• Christmas pajama sets</li>
                  <li>• Halloween group costumes</li>
                  <li>• Super Bowl parties</li>
                </ul>
              </div>

              {/* Pop Culture & Concerts */}
              <div className="card p-6 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">🎤</div>
                <h3 className="text-2xl font-semibold mb-4">Pop Culture & Concerts</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Taylor Swift Eras Tour groups</li>
                  <li>• Beyoncé Renaissance tour</li>
                  <li>• Diljit Dosanjh concerts</li>
                  <li>• Travis Kelce/Chiefs fans</li>
                  <li>• Bad Bunny, Sabrina Carpenter fans</li>
                  <li>• Movie premieres (Barbenheimer style)</li>
                </ul>
              </div>

              {/* Corporate & Organizations */}
              <div className="card p-6 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">🏢</div>
                <h3 className="text-2xl font-semibold mb-4">Corporate & Organizations</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Company team-building events</li>
                  <li>• Sorority/fraternity gear</li>
                  <li>• Volunteer organizations</li>
                  <li>• Non-profit fundraisers</li>
                  <li>• Corporate retreats</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Our Process */}
          <section className="mb-16 bg-white rounded-lg shadow-sm p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                <h3 className="font-semibold mb-2">Tell us your vision</h3>
                <p className="text-sm text-gray-600">Or we'll help you brainstorm!</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                <h3 className="font-semibold mb-2">We create mockup designs</h3>
                <p className="text-sm text-gray-600">Free design mockups included</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                <h3 className="font-semibold mb-2">You review and approve</h3>
                <p className="text-sm text-gray-600">Revisions until perfect</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">4</div>
                <h3 className="font-semibold mb-2">We print and ship</h3>
                <p className="text-sm text-gray-600">Fast 2-3 week turnaround</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">5</div>
                <h3 className="font-semibold mb-2">You rock your custom gear!</h3>
                <p className="text-sm text-gray-600">Show off your style</p>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Pricing & Discounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="card p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">1-11 items</h3>
                <p className="text-gray-600">Premium pricing</p>
              </div>
              <div className="card p-6 text-center bg-primary-50 border-2 border-primary-300">
                <h3 className="text-xl font-semibold mb-2">12-24 items</h3>
                <p className="text-primary-600 font-semibold">15% discount</p>
              </div>
              <div className="card p-6 text-center bg-secondary-50 border-2 border-secondary-300">
                <h3 className="text-xl font-semibold mb-2">25-49 items</h3>
                <p className="text-secondary-600 font-semibold">20% discount</p>
              </div>
              <div className="card p-6 text-center bg-green-50 border-2 border-green-300">
                <h3 className="text-xl font-semibold mb-2">50+ items</h3>
                <p className="text-green-600 font-semibold">25% discount + free design</p>
              </div>
            </div>
          </section>

          {/* Turnaround */}
          <section className="mb-16 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Turnaround Times</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="card p-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Standard</h3>
                <p className="text-2xl font-bold text-primary-600 mb-2">2-3 weeks</p>
                <p className="text-gray-600 text-sm">Standard processing</p>
              </div>
              <div className="card p-6 text-center bg-yellow-50 border-2 border-yellow-300">
                <h3 className="text-xl font-semibold mb-2">Rush</h3>
                <p className="text-2xl font-bold text-yellow-600 mb-2">7-10 days</p>
                <p className="text-gray-600 text-sm">Additional fee applies</p>
              </div>
              <div className="card p-6 text-center bg-red-50 border-2 border-red-300">
                <h3 className="text-xl font-semibold mb-2">Super Rush</h3>
                <p className="text-2xl font-bold text-red-600 mb-2">3-5 days</p>
                <p className="text-gray-600 text-sm">Limited availability</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-12 bg-gradient-to-r from-secondary-600 to-secondary-500 text-white rounded-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-secondary-50 max-w-2xl mx-auto">
              Get a free quote and design mockup for your custom apparel order
            </p>
            <Link 
              to="/contact" 
              className="bg-white text-secondary-600 hover:bg-secondary-50 font-semibold py-4 px-8 rounded-lg transition-colors duration-200 inline-block text-lg"
            >
              Get a Free Quote
            </Link>
          </section>
        </div>
      </div>
    </>
  );
};

export default CustomOrders;

