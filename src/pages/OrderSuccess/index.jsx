import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import { useCart } from '../../contexts/CartContext';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const sessionId = searchParams.get('session_id');
  const cartClearedRef = useRef(false);

  useEffect(() => {
    if (cartClearedRef.current) return;
    cartClearedRef.current = true;

    // Clear cart on successful payment
    clearCart();

    // Clean up the pre-redirect cart snapshot (no longer needed — the Stripe
    // webhook handles order persistence and owner notification server-side).
    try {
      sessionStorage.removeItem('tch_pending_order');
    } catch {
      // ignore
    }
  }, [clearCart]);

  return (
    <>
      <SEO title="Order Confirmed - The Custom Hub" />

      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full text-center">
          {/* Success animation */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 mb-2">
            Thank you for your purchase. Your desi swag is on its way! 🎉
          </p>

          {sessionId && (
            <p className="text-sm text-gray-400 mb-6">
              Order reference:{' '}
              <span className="font-mono text-gray-600">
                {sessionId.slice(0, 24)}…
              </span>
            </p>
          )}

          {/* What happens next */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 text-left space-y-4">
            <h2 className="font-bold text-gray-800">What happens next?</h2>
            <ul className="space-y-3">
              {[
                {
                  icon: '📧',
                  text: 'Stripe has sent a payment confirmation to your email address.',
                },
                {
                  icon: '🎨',
                  text: 'We\'ll begin crafting your order. Custom items may take 3–5 business days.',
                },
                {
                  icon: '📦',
                  text: 'Once shipped, you\'ll receive a tracking number via email.',
                },
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <span className="text-xl">{step.icon}</span>
                  <span>{step.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary">
              Continue Shopping
            </Link>
            <a
              href="https://wa.me/15087334489"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-green-500 text-green-700 hover:bg-green-50 font-semibold py-2.5 px-6 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
