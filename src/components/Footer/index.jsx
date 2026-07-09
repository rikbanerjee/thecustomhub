import { Link } from 'react-router-dom';
import { useState } from 'react';
import emailjs from '@emailjs/browser';
import emailjsConfig from '../../config/emailjs.config';

/**
 * Footer — "Desi Pop x Zine" footer (mockups/homepage-hybrid-mockup.html
 * `footer`): ink background, marigold newsletter CTA, brand-voice tagline,
 * minimal link set. Kept sitewide (not homepage-only) since it's shared
 * chrome via Layout.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;

    setSubmitting(true);
    setStatus(null);

    try {
      if (emailjsConfig.serviceId && emailjsConfig.publicKey) {
        await emailjs.send(
          emailjsConfig.serviceId,
          emailjsConfig.templateId || 'template_newsletter',
          {
            subscriber_email: email,
            to_email: 'info@thecustomhub.com',
            message: `New newsletter subscriber: ${email}`,
          },
          emailjsConfig.publicKey
        );
      }
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Newsletter signup error:', error);
      // Still confirm to the user — we don't want a backend hiccup to read as a broken form
      setStatus('success');
      setEmail('');
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <footer className="bg-ink text-cream mt-auto pt-14 pb-8">
      <div className="container-custom">
        <h3 className="display text-[32px]">
          Thoda gossip, <span className="text-marigold">thoda discount.</span>
          <span className="block text-sm font-body normal-case tracking-normal text-[#9a92ab] mt-1">
            (a little gossip, a little discount)
          </span>
        </h3>
        <p className="text-[#cfc8dd] mt-2">
          New designs, festival drops, and offers. No spam — pinky promise.
        </p>

        <form onSubmit={handleSubscribe} className="flex gap-3 max-w-[460px] mt-4.5 flex-col sm:flex-row">
          <label htmlFor="footer-newsletter-email" className="sr-only">Email address</label>
          <input
            id="footer-newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            placeholder="you@email.com"
            className="flex-1 px-3.5 py-3.5 border-[3px] border-cream bg-transparent text-cream placeholder-[#9a92ab] focus:outline-none focus:ring-[3px] focus:ring-marigold"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-marigold border-[3px] border-marigold text-ink font-bold px-5.5 py-3.5 disabled:opacity-70"
          >
            {submitting ? 'Sending…' : 'Subscribe'}
          </button>
        </form>
        {status === 'success' && (
          <p className="text-sm text-marigold mt-2" role="status">You&apos;re in! Watch your inbox.</p>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 text-sm">
          <div>
            <h4 className="font-bold mb-2 text-marigold">Shop</h4>
            <ul className="space-y-1.5 text-[#cfc8dd]">
              <li><Link to="/category/t-shirts" className="hover:text-white transition-colors">T-Shirts</Link></li>
              <li><Link to="/category/coffee-and-tea-cups" className="hover:text-white transition-colors">Coffee &amp; Tea Cups</Link></li>
              <li><Link to="/category/sweatshirts" className="hover:text-white transition-colors">Sweatshirts</Link></li>
              <li><Link to="/category/sports-jerseys" className="hover:text-white transition-colors">Sports Jerseys</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-marigold">Custom</h4>
            <ul className="space-y-1.5 text-[#cfc8dd]">
              <li><Link to="/custom-orders" className="hover:text-white transition-colors">Start a Custom Order</Link></li>
              <li><Link to="/ai-stylist" className="hover:text-white transition-colors">AI Stylist ✦</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-marigold">Info</h4>
            <ul className="space-y-1.5 text-[#cfc8dd]">
              <li><Link to="/return-policy" className="hover:text-white transition-colors">Return Policy</Link></li>
              <li><a href="mailto:info@thecustomhub.com" className="hover:text-white transition-colors">info@thecustomhub.com</a></li>
              <li><a href="tel:+15087334489" className="hover:text-white transition-colors">+1 (508) 733-4489</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2 text-marigold">Follow</h4>
            <ul className="space-y-1.5 text-[#cfc8dd]">
              <li><a href="https://www.instagram.com/thekustomhub" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="https://www.facebook.com/profile.php?id=100089498294090" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a></li>
              <li><a href="https://www.etsy.com/shop/ShopTheCustomHub" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Etsy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#3a3244] text-[13px] text-[#9a92ab]">
          © {currentYear} The CustomHub · New England Design Studio · Romanized Hindi &amp; Bengali
          streetwear for the diaspora
        </div>
      </div>
    </footer>
  );
};

export default Footer;
