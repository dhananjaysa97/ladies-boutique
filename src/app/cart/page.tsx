'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, total, updateQuantity, removeFromCart, clearCart } = useCart();

  const handlePlus = (product: any, size: any, qty: number) => {
    updateQuantity(product, size, qty + 1);
  };

  const handleMinus = (product: any, size: any, qty: number) => {
    updateQuantity(product, size, qty - 1);
  };

  const handleQtyChange =
    (product: any, size: any, currentQty: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '') {
        updateQuantity(product, size, 0);
        return;
      }
      const num = parseInt(value, 10);
      if (Number.isNaN(num)) return;
      updateQuantity(product, size, num);
    };

  if (items.length === 0) {
    return (
      <section className="page-enter mt-6">
        <h1 className="text-xl font-semibold mb-3">Your cart</h1>
        <p className="text-sm text-gray-600 mb-4">
          Your cart is empty. Browse the latest collection to add items.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center px-4 py-2 rounded-full bg-pink-500 text-white text-sm hover:bg-pink-600"
        >
          Go to shop
        </Link>
      </section>
    );
  }

  return (
    <section className="page-enter mt-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Your cart</h1>
          <p className="text-xs text-gray-500 mt-1">
            You can also use voice commands like:
            <span className="ml-1 font-medium text-gray-700">
              &quot;increase item 1&quot;, &quot;decrease item 2&quot;,
              &quot;remove item 3&quot;, &quot;set item 1 to 4&quot;
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-red-500 hover:underline"
        >
          Clear cart
        </button>
      </div>

      <div className="bg-white/80 border border-white/70 rounded-2xl shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-100 text-sm">
          {items.map((item, index) => {
            const lineTotal = item.product.price * item.quantity;
            const idx = index + 1;

            return (
              <li
                key={item.product.id + item.size}
                className="flex items-center gap-3 px-4 py-3"
                data-cart-index={idx}
              >
                {/* Product image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/80 text-white">
                      {idx}
                    </span>
                    <p className="font-medium text-xs line-clamp-1">
                      {item.product.name}
                    </p>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Size: {item.size}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    ${item.product.price.toFixed(2)} each
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleMinus(item.product, item.size, item.quantity)
                    }
                    className="h-7 w-7 flex items-center justify-center rounded-full border border-gray-300 text-xs"
                    aria-label={`Decrease quantity for item ${idx}`}
                    data-role="cart-decrease"
                  >
                    –
                  </button>
                  <input
                    type="number"
                    min={0}
                    className="w-12 text-center text-xs rounded-full border border-gray-300 px-2 py-1"
                    value={item.quantity}
                    onChange={handleQtyChange(
                      item.product,
                      item.size,
                      item.quantity
                    )}
                    aria-label={`Quantity for item ${idx}`}
                    data-role="cart-qty-input"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handlePlus(item.product, item.size, item.quantity)
                    }
                    className="h-7 w-7 flex items-center justify-center rounded-full border border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white text-xs"
                    aria-label={`Increase quantity for item ${idx}`}
                    data-role="cart-increase"
                  >
                    +
                  </button>
                </div>

                {/* Line total + remove */}
                <div className="text-right w-20 flex-shrink-0">
                  <p className="text-xs font-semibold text-pink-700">
                    ${lineTotal.toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      removeFromCart(item.product.id, item.size)
                    }
                    className="mt-1 text-[10px] text-red-500 hover:underline"
                    data-role="cart-remove"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Summary */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-600">
            Items:{' '}
            <span className="font-semibold">
              {items.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>
          <div className="text-sm">
            Total:{' '}
            <span className="font-semibold text-pink-700">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/checkout"
          className="inline-flex items-center px-5 py-2 rounded-full bg-pink-500 text-white text-sm hover:bg-pink-600"
        >
          Proceed to checkout
        </Link>
      </div>
    </section>
  );
}
