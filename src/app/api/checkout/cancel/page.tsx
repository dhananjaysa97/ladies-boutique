'use client'

import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-semibold text-yellow-700">Payment cancelled</h1>
      <p className="text-sm text-gray-700">
        Your payment was cancelled. You can review your cart and try again.
      </p>
      <Link
        href="/cart"
        className="inline-flex px-4 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 text-sm"
      >
        Back to cart
      </Link>
    </div>
  );
}
