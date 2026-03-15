import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const ReturnPolicy = () => {
  return (
    <>
      <SEO
        title="Return & Refund Policy - The Custom Hub"
        description="Learn about The CustomHub's return and refund policy. 15-day return window, conditions, and how to initiate a return."
        canonical="https://thecustomhub.com/return-policy"
      />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom max-w-3xl">

          {/* Breadcrumb */}
          <nav className="mb-6 text-sm" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li><Link to="/" className="text-primary-600 hover:underline">Home</Link></li>
              <li><span className="text-gray-400">/</span></li>
              <li className="text-gray-600">Return &amp; Refund Policy</li>
            </ol>
          </nav>

          <div className="bg-white rounded-2xl shadow-sm px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Return &amp; Refund Policy</h1>
            <p className="text-sm text-gray-400 mb-8">Last updated: March 2025</p>

            <p className="text-gray-600 leading-relaxed mb-8">
              At The CustomHub, we take pride in every item we create. We are a small,
              independent design studio based in Massachusetts and we stand behind the quality
              of our products. Please read this policy carefully before making a purchase.
            </p>

            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                Return Window
              </h2>
              <p className="text-gray-600 leading-relaxed">
                You have <strong>15 days from the date of delivery</strong> to request a return.
                Requests made after this window will not be accepted. To check your delivery date,
                refer to the shipping confirmation email sent by Stripe or your carrier.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                Condition Requirements
              </h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                To be eligible for a return, items must meet <strong>all</strong> of the following conditions:
              </p>
              <ul className="space-y-2 text-gray-600">
                {[
                  'Item is in its original, unopened packaging',
                  'Item has not been used, worn, or washed',
                  'All original tags and labels are intact',
                  'Item is free from odours, stains, or damage caused by the customer',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-gray-500 text-sm mt-3 italic">
                Exception: Items that arrive defective or damaged are exempt from these conditions.
                See Section 4 for details.
              </p>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                Non-Returnable Items
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm leading-relaxed">
                <p className="font-semibold mb-1">Custom &amp; Personalized Orders are Final Sale.</p>
                <p>
                  Items that were customized or personalized specifically for you — including
                  custom photo mugs, name prints, personalized apparel, and event merchandise —
                  cannot be returned or exchanged as they are made to order. If you have any
                  concerns about a personalized item, please{' '}
                  <a href="mailto:personalizedbyrisa@gmail.com" className="underline font-medium">
                    contact us
                  </a>{' '}
                  and we will do our best to help.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                Defective or Incorrect Orders
              </h2>
              <p className="text-gray-600 leading-relaxed">
                If you receive an item that is defective, damaged in transit, or different from
                what you ordered, please reach out to us within 15 days of delivery. We will
                work with you to make it right. Contact us via email or WhatsApp with your
                order reference and a photo of the issue.
              </p>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                Refunds
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Refunds are issued for genuine, qualifying returns only. Once we receive and
                inspect the returned item, we will notify you of the approval or rejection of
                your refund. Approved refunds are processed back to your original payment method
                within <strong>7 business days</strong> of receiving the item. Please allow
                additional time for your bank or card provider to post the credit.
              </p>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">6</span>
                Return Shipping
              </h2>
              <p className="text-gray-600 leading-relaxed">
                The customer is responsible for return shipping costs. We are a small business
                based in Massachusetts and this policy helps us prevent misuse while keeping
                our prices accessible for everyone. We recommend using a trackable shipping
                method — The CustomHub is not responsible for items lost in return transit.
              </p>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">7</span>
                Sale Items
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Items purchased on sale or at a discounted price may be subject to different
                return conditions. Please contact us directly for any concerns regarding a
                sale item — we handle these on a case-by-case basis and will always aim to
                find a fair resolution.
              </p>
            </section>

            {/* Section 8 — How to return */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">8</span>
                How to Start a Return
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To initiate a return, simply reach out to us — no complicated forms required:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="mailto:personalizedbyrisa@gmail.com"
                  className="flex items-center gap-3 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-xl p-4 transition-colors"
                >
                  <svg className="w-6 h-6 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-primary-800 text-sm">Email Us</p>
                    <p className="text-primary-600 text-xs">personalizedbyrisa@gmail.com</p>
                  </div>
                </a>
                <a
                  href="https://wa.me/15087334489"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 transition-colors"
                >
                  <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-green-800 text-sm">WhatsApp</p>
                    <p className="text-green-600 text-xs">+1 (508) 733-4489</p>
                  </div>
                </a>
              </div>
              <p className="text-gray-500 text-sm mt-3">
                Please include your order reference number and a brief description of the reason
                for the return. We typically respond within 1 business day.
              </p>
            </section>

            {/* Closing note */}
            <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-600 leading-relaxed">
              <p>
                We are a small, family-run business and we genuinely care about every customer.
                If something isn't right, please talk to us first — we are always willing to
                find a fair solution. Thank you for supporting The CustomHub. 🙏
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReturnPolicy;
