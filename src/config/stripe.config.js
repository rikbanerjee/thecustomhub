// Stripe Configuration
// Add VITE_STRIPE_PUBLIC_KEY to your .env file
// Get your keys from: https://dashboard.stripe.com/apikeys

const stripeConfig = {
  publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || ''
};

export default stripeConfig;
