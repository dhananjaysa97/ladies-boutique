import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="space-y-4 max-w-lg">
      <h1 className="text-2xl font-semibold text-emerald-700">Payment successful!</h1>
      <p className="text-sm text-gray-700">
        Thank you for your purchase. A confirmation email will be sent to you shortly.
      </p>
      <Link
        href="/"
        className="inline-flex px-4 py-2 rounded-full bg-pink-500 text-white hover:bg-pink-600 text-sm"
      >
        Back to home
      </Link>
    </div>
  );
}
