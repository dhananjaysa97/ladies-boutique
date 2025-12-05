'use client';

import { useCart } from '@/context/CartContext';

interface MiniCartProps {
  onClose: () => void;
  onViewCart: () => void;
  onCheckout: () => void;
}

export const MiniCart: React.FC<MiniCartProps> = ({
  onClose,
  onViewCart,
  onCheckout,
}) => {
  const { items, total, removeFromCart } = useCart();

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div
        className="absolute right-0 mt-2 w-72 bg-white/95 border border-gray-100 rounded-2xl shadow-lg p-3 text-sm z-40"
        role="dialog"
        aria-label="Mini cart"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-xs">Cart</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        <p className="text-gray-500 mb-2 text-xs">
          Your cart is empty. Browse the latest collection to add items.
        </p>
        <button
          type="button"
          onClick={onViewCart}
          className="inline-flex items-center px-3 py-1.5 rounded-full bg-pink-500 text-white text-xs hover:bg-pink-600"
        >
          Go to shop
        </button>
      </div>
    );
  }

  return (
    <div
      className="absolute right-0 mt-2 w-80 bg-white/95 border border-gray-100 rounded-2xl shadow-lg p-3 text-sm z-40"
      role="dialog"
      aria-label="Mini cart"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-xs">
          Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>

      <ul className="max-h-64 overflow-y-auto divide-y divide-gray-100 mb-3">
        {items.map((item, index) => (
          <li
            key={item.product.id + item.size + index}
            className="py-2 flex gap-2"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium line-clamp-1">
                {item.product.name}
              </p>
              <p className="text-[11px] text-gray-500">
                Size: {item.size} · Qty: {item.quantity}
              </p>
              <p className="text-[11px] text-pink-700 font-semibold">
                ${(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeFromCart(item.product.id, item.size)}
              className="text-[11px] text-red-500 hover:underline self-start"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-600">Subtotal</span>
        <span className="text-sm font-semibold text-pink-700">
          ${total.toFixed(2)}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onViewCart}
          className="flex-1 inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-gray-300 text-xs text-gray-700 hover:bg-gray-50"
        >
          View cart
        </button>
        <button
          type="button"
          onClick={onCheckout}
          className="flex-1 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-pink-500 text-xs text-white hover:bg-pink-600"
        >
          Checkout
        </button>
      </div>
    </div>
  );
};
