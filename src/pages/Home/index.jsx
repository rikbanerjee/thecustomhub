import { Link } from 'react-router-dom';
import { useState } from 'react';
import SEO from '../../components/SEO';
import ProductGrid from '../../components/ProductGrid';
import CategoryCard from '../../components/CategoryCard';
import QuickViewModal from '../../components/QuickViewModal';
import Marquee from '../../components/Marquee';
import WordSwap from '../../components/WordSwap';
import FestivalBanner from '../../components/FestivalBanner';
import CustomOrderForm from '../../components/CustomOrderForm';
import Sticker from '../../components/ui/Sticker';
import { getAllCategories, getFeaturedProducts, getProductById } from '../../utils/dataHelpers';
import { getFirebaseImageUrl } from '../../utils/imageHelpers';

const HERO_WORDS = ['Filmy', 'Desi', 'Nerdy', 'Bangali', 'Jugaadu', 'Squad'];

const MARQUEE_ITEMS = [
  'FREE DESIGN MOCKUPS',
  'NO MINIMUMS',
  'LOCAL PICKUP IN MA',
  'SHIPS ACROSS USA & CANADA',
  'PAISA VASOOL GUARANTEED',
];

const QUOTES = [
  {
    text: '"Wore the Dhurander tee to a family wedding. Three uncles asked where to buy it. Zero regrets."',
    who: '— Priya S., Boston MA',
  },
  {
    text: '"Our robotics team shirts came out better than the robot. Fast turnaround, free mockups were clutch."',
    who: '— Coach Dan, Worcester MA',
  },
  {
    text: '"Sent the chai mug to my sister in Toronto for Rakhi. She sent back a crying-laughing emoji. Mission accomplished."',
    who: '— Arjun M., San Jose CA',
  },
];

const HERO_PRODUCT_ID = 'dhurander-bollywood-graphic-tee';

const Home = () => {
  // products.json is a static local import, so these reads are synchronous —
  // no loading state or effect needed; lazy initializers run once on mount.
  const [featuredProducts] = useState(() => getFeaturedProducts(8));
  const [categories] = useState(() => getAllCategories());
  const [heroProduct] = useState(
    () => getProductById(HERO_PRODUCT_ID) || getFeaturedProducts(1)[0] || null
  );

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  const totalDesigns = categories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <>
      <SEO
        title="The CustomHub | Custom Desi T-Shirts, Hoodies & Mugs — USA"
        description="Dual-lingo Hindi/Bengali & Bollywood t-shirts, hoodies, mugs and custom bulk apparel for teams & events. Ships across USA & Canada. Local pickup in MA."
        keywords="romanized hindi streetwear, bollywood pop culture, bengali pun, nri lifestyle gifts, diwali shirts, custom t-shirts, bulk custom apparel USA"
        ogTitle="The CustomHub | Custom Desi T-Shirts, Hoodies & Mugs"
        ogDescription="Dual-lingo desi apparel + custom bulk orders for teams, festivals & events. USA based."
        canonical="https://thecustomhub.com/"
      />

      <div className="min-h-screen page-transition bg-cream">
        <Marquee items={MARQUEE_ITEMS} />

        {/* HERO — static split, word-swap headline replaces the carousel */}
        <header className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-8 items-center max-w-[1200px] mx-auto px-6 pt-8 pb-9">
          <div>
            <h1 className="display text-[clamp(30px,3.8vw,50px)] leading-[1] text-ink">
              Wear your
              <br />
              <WordSwap words={HERO_WORDS} className="display text-[clamp(30px,3.8vw,50px)] leading-[1]" />
              <br />
              side.
            </h1>
            <p className="text-base mt-3.5 mb-4.5 max-w-[44ch] text-[#3d3548]">
              Dual-lingo tees, hoodies &amp; mugs for the desi diaspora — plus custom gear for
              your team, your squad, your office, your fam.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to={categories[0] ? `/category/${categories[0].id}` : '/'} className="btn-primary">
                Shop Desi Collection
              </Link>
              <Link to="/custom-orders" className="btn-outline">
                Custom for Your Crew
              </Link>
            </div>
            <div className="flex gap-2.5 flex-wrap mt-4">
              <Sticker rotate={-3}>100% Filmy</Sticker>
              <Sticker tone="pink" rotate={2}>Paisa Vasool</Sticker>
              <Sticker tone="teal" rotate={-1.5}>Nerd Approved</Sticker>
              <Sticker tone="ink" rotate={-3} to="/ai-stylist">✦ AI Stylist — find your vibe</Sticker>
            </div>
          </div>

          <div className="max-w-[330px] md:ml-auto mx-auto w-full">
            <div
              className="pop-border relative"
              style={{ boxShadow: '8px 8px 0 var(--color-marigold)' }}
            >
              {heroProduct && (
                <img
                  src={getFirebaseImageUrl(heroProduct.images?.[0])}
                  alt={heroProduct.title}
                  className="block w-full aspect-square object-cover"
                />
              )}
              {heroProduct && (
                <div
                  className="absolute bottom-3.5 right-3.5 bg-rani text-cream border-[3px] border-ink rounded-lg px-3.5 py-1.5 display text-lg"
                  style={{ transform: 'rotate(6deg)' }}
                >
                  ${heroProduct.price}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* SHOP BY CATEGORY */}
        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-6">
            <FestivalBanner />

            <div className="flex items-baseline justify-between gap-4 flex-wrap mb-8">
              <h2 className="display text-[clamp(24px,2.6vw,34px)] text-ink">
                Shop by <em className="not-italic text-rani">category</em>
              </h2>
              {categories.length > 0 && (
                <span className="font-bold text-peacock">
                  {categories.length} collections · {totalDesigns} designs and counting
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4.5">
              {categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} staggerIndex={index} />
              ))}
            </div>
          </div>
        </section>

        {/* BESTSELLERS */}
        <section className="py-12 bg-white border-y-[3px] border-ink">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex items-baseline justify-between gap-4 flex-wrap mb-8">
              <h2 className="display text-[clamp(24px,2.6vw,34px)] text-ink">
                Public <em className="not-italic text-rani">favorites</em>
              </h2>
              {categories.length > 0 && (
                <Link to={`/category/${categories[0].id}`} className="font-bold text-peacock hover:text-rani transition-colors">
                  View all →
                </Link>
              )}
            </div>

            <ProductGrid
              products={featuredProducts}
              loading={false}
              columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
              emptyMessage="No featured products available at the moment"
              onQuickView={handleQuickView}
            />
          </div>
        </section>

        {/* CUSTOM ORDERS STORY BLOCK */}
        <section className="py-14 bg-ink text-cream">
          <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-11 items-center">
            <div>
              <h2 className="display text-[clamp(28px,3.2vw,42px)] leading-[1.05]">
                Your crew.
                <br />
                Your design.
                <br />
                <em className="not-italic text-marigold">Ek dum custom.</em>
              </h2>
              <p className="mt-4.5 mb-6.5 text-[#cfc8dd] text-lg max-w-[48ch]">
                Robotics teams, Durga Puja committees, Eras Tour squads, Thanksgiving family
                chaos — send us the idea, we send you a free mockup. No minimums, bulk
                discounts, 2–3 week turnaround.
              </p>
              <Link
                to="/custom-orders"
                className="btn-primary"
                style={{ borderColor: 'var(--color-cream)', boxShadow: '5px 5px 0 var(--color-marigold)' }}
              >
                Start a Custom Order
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              {[
                { n: '50', t: "tees for the NJ Bengali Association's Durga Puja" },
                { n: '25', t: "shirts for FRC Team 4587's regionals run" },
                { n: '12', t: 'Eras Tour squad shirts, Boston night 2' },
                { n: '∞', t: "family reunion puns we're not ashamed of" },
              ].map((p) => (
                <div key={p.t} className="border-[2.5px] border-cream p-4.5 text-sm font-semibold">
                  <span className="display text-3xl text-marigold block">{p.n}</span>
                  {p.t}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF — quote strip */}
        <section className="py-14">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 className="display text-[clamp(24px,2.6vw,34px)] text-ink mb-8">
              Log <em className="not-italic text-rani">kya kahenge?</em> This, apparently.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
              {QUOTES.map((q) => (
                <div
                  key={q.who}
                  className="pop-border bg-white p-5.5"
                  style={{ boxShadow: '5px 5px 0 var(--color-chai)' }}
                >
                  <p className="text-[15px] leading-relaxed">{q.text}</p>
                  <div className="mt-3 font-bold text-[13px] text-peacock">{q.who}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CUSTOM ORDER FORM */}
        <section className="pt-5 pb-14">
          <div className="max-w-[1200px] mx-auto px-6">
            <CustomOrderForm />
          </div>
        </section>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />
    </>
  );
};

export default Home;
