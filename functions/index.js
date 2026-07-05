/* eslint-disable */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const Stripe = require("stripe");

initializeApp();

// Track B3/B4 — RetailAgentOS discovery endpoints (ucpManifest, productSchema).
Object.assign(exports, require("./raos"));

// Stripe secret key stored in Firebase Secret Manager
// Set it once with: firebase functions:secrets:set STRIPE_SECRET_KEY
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

/**
 * createCheckoutSession
 *
 * Callable Firebase Cloud Function (v2) that creates a Stripe Checkout Session
 * from the cart items passed by the React frontend.
 *
 * Setup:
 *   firebase functions:secrets:set STRIPE_SECRET_KEY
 *   (paste sk_live_... when prompted — stored securely in Secret Manager)
 *   firebase deploy --only functions
 *
 * For local emulator testing set the env var directly:
 *   export STRIPE_SECRET_KEY=sk_test_...
 *   firebase emulators:start --only functions
 */
exports.createCheckoutSession = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    const secretKey = stripeSecretKey.value();

    if (!secretKey) {
      throw new HttpsError(
        "failed-precondition",
        "Stripe secret key is not configured. Run: firebase functions:secrets:set STRIPE_SECRET_KEY"
      );
    }

    const { items } = request.data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "Cart items array is required and must not be empty."
      );
    }

    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });

    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
          ...(item.image ? { images: [item.image] } : {}),
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: Number(item.quantity),
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url:
        "https://thecustomhub.com/order-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://thecustomhub.com/cart",
      ...(request.data.customerEmail
        ? { customer_email: request.data.customerEmail }
        : {}),
      metadata: { source: "thecustomhub-web" },
    });

    return { url: session.url };
  }
);
