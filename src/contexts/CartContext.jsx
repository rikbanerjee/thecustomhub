import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { firebaseFunctions } from '../lib/firebase';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('tch_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  // Persist cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('tch_cart', JSON.stringify(items));
  }, [items]);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  /**
   * Add a product (and optional variant) to the cart.
   * Opens the cart drawer automatically.
   * @param {Object} product - Normalized product object from dataHelpers
   * @param {Object|null} variant - Variant object from product.variants, or null
   */
  const addItem = useCallback((product, variant = null) => {
    const itemId = variant?.sku
      ? `${product.id}--${variant.sku}`
      : product.id;

    const price = variant?.price
      ? parseFloat(variant.price)
      : parseFloat(product.price) || 0;

    const image = product.images?.[0] || '';

    const variantLabel = variant
      ? [variant.option1, variant.option2, variant.option3]
          .filter((o) => o && o !== 'Default Title')
          .join(' / ')
      : null;

    setItems((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: itemId,
          productId: product.id,
          title: product.title,
          price,
          image,
          quantity: 1,
          variantSku: variant?.sku || null,
          variantLabel,
        },
      ];
    });

    setDrawerOpen(true);
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  /**
   * Capture a WhatsApp order lead in Firestore before the customer opens
   * the WhatsApp link. Errors are swallowed so they never block navigation.
   */
  const captureWhatsAppLead = useCallback(() => {
    const saveWhatsAppLeadFn = httpsCallable(
      firebaseFunctions,
      'saveWhatsAppLead'
    );
    return saveWhatsAppLeadFn({
      items: items.map((i) => ({
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        variantLabel: i.variantLabel,
      })),
      subtotal,
    }).catch((err) => {
      // Intentionally silent — never block the WhatsApp link on a backend error
      console.warn('WhatsApp lead capture failed (non-blocking):', err);
    });
  }, [items, subtotal]);

  /**
   * Initiate Stripe Checkout.
   * Stores a cart snapshot in sessionStorage for the success page,
   * then calls the Firebase Cloud Function to create the session.
   */
  const checkout = useCallback(async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      // Snapshot for the success page email
      sessionStorage.setItem(
        'tch_pending_order',
        JSON.stringify({
          items: items.map((i) => ({
            title: i.title,
            price: i.price,
            quantity: i.quantity,
            variantLabel: i.variantLabel,
          })),
          subtotal,
          timestamp: new Date().toISOString(),
        })
      );

      const createCheckoutSession = httpsCallable(
        firebaseFunctions,
        'createCheckoutSession'
      );

      const payload = {
        items: items.map((i) => ({
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
      };

      const result = await createCheckoutSession(payload);
      window.location.href = result.data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError(
        'Unable to start checkout. Please try again or contact us via WhatsApp.'
      );
      setCheckoutLoading(false);
    }
  }, [items, subtotal]);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        captureWhatsAppLead,
        drawerOpen,
        openDrawer,
        closeDrawer,
        checkout,
        checkoutLoading,
        checkoutError,
        setCheckoutError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
