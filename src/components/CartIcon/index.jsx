import { useCart } from '../../contexts/CartContext';

/**
 * CartIcon — shopping bag icon with animated item-count badge.
 * Clicking it toggles the CartDrawer.
 */
const CartIcon = () => {
  const { count, openDrawer } = useCart();

  return (
    <button
      onClick={openDrawer}
      className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label={`Open cart${count > 0 ? `, ${count} item${count !== 1 ? 's' : ''}` : ''}`}
    >
      {/* Shopping bag SVG */}
      <svg
        className="w-6 h-6 text-gray-700"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>

      {/* Item count badge */}
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] flex items-center justify-center bg-primary-600 text-white text-xs font-bold rounded-full px-1 animate-bounce-once"
          aria-hidden="true"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
};

export default CartIcon;
