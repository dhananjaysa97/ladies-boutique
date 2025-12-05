'use client';

import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Checkout failed');
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Invalid checkout URL returned from server');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      {items.length === 0 ? (
        <p className="text-sm text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-white/70 space-y-2 text-sm">
            <p>
              Items: <strong>{items.length}</strong>
            </p>
            <p>
              Total:{' '}
              <strong className="text-pink-700">${total.toFixed(2)}</strong>
            </p>
            <p className="text-xs text-gray-500">
              You&apos;ll be redirected to a secure Stripe payment page to complete your order.
            </p>
          </div>
          <div aria-live="polite" aria-atomic="true">
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
                {error}
              </p>
            )}
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-4 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-60 text-sm"
          >
            {loading ? 'Redirecting to payment…' : 'Pay with card'}
          </button>
        </>
      )}
    </div>
  );
}
