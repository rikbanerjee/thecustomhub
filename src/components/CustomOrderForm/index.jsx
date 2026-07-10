import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { firebaseFunctions } from '../../lib/firebase';

/**
 * CustomOrderForm — homepage "Got an idea? Bol daal." section
 * (mockups/homepage-hybrid-mockup.html `.order-form-wrap`). A lightweight
 * lead-capture form; the full stepper flow lives on /custom-orders.
 *
 * Sends via the shared sendInquiryEmail Cloud Function (type: 'quick-lead'),
 * same server-side path as every other lead form on the site.
 */
const CustomOrderForm = () => {
  const [form, setForm] = useState({ name: '', email: '', type: 'T-Shirts', qty: 'Just 1', idea: '' });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.name.trim() || !form.email.trim()) {
      setStatus('error');
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const sendInquiryEmail = httpsCallable(firebaseFunctions, 'sendInquiryEmail');
      await sendInquiryEmail({
        type: 'quick-lead',
        name: form.name,
        email: form.email,
        orderType: form.type,
        quantity: form.qty,
        idea: form.idea,
      });

      setStatus('success');
      setForm({ name: '', email: '', type: 'T-Shirts', qty: 'Just 1', idea: '' });
    } catch (error) {
      console.error('Custom order form submission error:', error);
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pop-border pop-shadow-marigold bg-white grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr]">
      {/* Info panel */}
      <div className="bg-peacock text-cream p-9 flex flex-col justify-center">
        <h2 className="display text-[clamp(24px,2.6vw,34px)] leading-tight">
          Got an idea?
          <br />
          <em className="not-italic text-marigold">Bol daal.</em>
        </h2>
        <p className="mt-3.5 text-[15px] text-[#d8eeee] max-w-[38ch]">
          Tell us what you&apos;re celebrating — we&apos;ll send a free design mockup within 24
          hours. No commitment, no minimums.
        </p>
        <ul className="mt-5 flex flex-col gap-2.5 text-sm font-semibold">
          {[
            'Free design mockup before you pay',
            'Bulk & group discounts',
            '2–3 week turnaround',
            'Local pickup in MA available',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <span className="w-[22px] h-[22px] flex-shrink-0 bg-marigold text-ink rounded-full flex items-center justify-center text-xs font-bold">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Form panel */}
      <form onSubmit={handleSubmit} className="p-8 md:p-9" noValidate>
        {status === 'success' && (
          <p className="mb-4 text-sm font-semibold text-peacock" role="status">
            Ho gaya! We&apos;ll be in touch within 24 hours. (&quot;Ho gaya&quot; = it&apos;s done!)
          </p>
        )}
        {status === 'error' && (
          <p className="mb-4 text-sm font-semibold text-rani" role="alert">
            Kuch gadbad ho gaya — something went wrong. Please try again, or WhatsApp us directly.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="cof-name" className="block text-[13px] font-bold mb-1.5">Your name</label>
            <input
              id="cof-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Priya Sharma"
              required
              disabled={submitting}
              className="w-full px-3.5 py-3 border-[2.5px] border-ink bg-cream text-ink focus:outline-none focus:ring-[3px] focus:ring-marigold focus:ring-offset-[-1px]"
            />
          </div>
          <div>
            <label htmlFor="cof-email" className="block text-[13px] font-bold mb-1.5">Email</label>
            <input
              id="cof-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@email.com"
              required
              disabled={submitting}
              className="w-full px-3.5 py-3 border-[2.5px] border-ink bg-cream text-ink focus:outline-none focus:ring-[3px] focus:ring-marigold focus:ring-offset-[-1px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
          <div>
            <label htmlFor="cof-type" className="block text-[13px] font-bold mb-1.5">What are we making?</label>
            <select
              id="cof-type"
              name="type"
              value={form.type}
              onChange={handleChange}
              disabled={submitting}
              className="w-full px-3.5 py-3 border-[2.5px] border-ink bg-cream text-ink focus:outline-none focus:ring-[3px] focus:ring-marigold focus:ring-offset-[-1px]"
            >
              <option>T-Shirts</option>
              <option>Sweatshirts / Hoodies</option>
              <option>Coffee &amp; Tea Cups</option>
              <option>Sports Jerseys</option>
              <option>Not sure yet</option>
            </select>
          </div>
          <div>
            <label htmlFor="cof-qty" className="block text-[13px] font-bold mb-1.5">How many?</label>
            <select
              id="cof-qty"
              name="qty"
              value={form.qty}
              onChange={handleChange}
              disabled={submitting}
              className="w-full px-3.5 py-3 border-[2.5px] border-ink bg-cream text-ink focus:outline-none focus:ring-[3px] focus:ring-marigold focus:ring-offset-[-1px]"
            >
              <option>Just 1</option>
              <option>2–10</option>
              <option>11–25</option>
              <option>26–50</option>
              <option>50+</option>
            </select>
          </div>
        </div>

        <label htmlFor="cof-idea" className="block text-[13px] font-bold mt-3.5 mb-1.5">Tell us the idea</label>
        <textarea
          id="cof-idea"
          name="idea"
          value={form.idea}
          onChange={handleChange}
          disabled={submitting}
          rows={3}
          placeholder="e.g. 20 tees for our Durga Puja committee — 'Dhaaker Taal' on the front, names on the back, need them by Oct 10…"
          className="w-full px-3.5 py-3 border-[2.5px] border-ink bg-cream text-ink resize-y focus:outline-none focus:ring-[3px] focus:ring-marigold focus:ring-offset-[-1px]"
        />

        <div className="flex items-center gap-4 flex-wrap mt-5">
          <button type="submit" className="btn-primary" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Sending…' : 'Get My Free Mockup'}
          </button>
          <span className="text-xs text-[#6a6376]">
            We reply within 24 hours. Prefer WhatsApp? Tap the green button anytime.
          </span>
        </div>
      </form>
    </div>
  );
};

export default CustomOrderForm;
