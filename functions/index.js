/* eslint-disable */
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();

/**
 * createCheckoutSession
 *
 * Callable Firebase Cloud Function that creates a Stripe Checkout Session
 * from the cart items passed by the React frontend.
 *
 * Setup:
 *   firebase functions:config:set stripe.secret_key="sk_live_..."
 *   firebase deploy --only functions
 *
 * For local emulator testing:
 *   export STRIPE_SECRET_KEY=sk_test_...
 *   firebase emulators:start --only functions
 */
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Resolve Stripe secret key (runtime config or env var for emulator)
  const secretKey =
    (functions.config().stripe && functions.config().stripe.secret_key) ||
    process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Stripe secret key is not configured. Run: firebase functions:config:set stripe.secret_key=\"sk_live_...\""
    );
  }

  const { items } = data;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new functions.https.HttpsError(
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
      // Stripe requires amount in cents
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
    ...(data.customerEmail ? { customer_email: data.customerEmail } : {}),
    metadata: {
      source: "thecustomhub-web",
    },
    // Enable customer receipt emails in Stripe Dashboard → Settings → Emails
    // They are sent automatically by Stripe once payment succeeds
  });

  return { url: session.url };
});
