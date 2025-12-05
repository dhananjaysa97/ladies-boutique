import { getLatestProducts } from '@/data/products';
import { ProductGrid } from '@/components/ProductGrid';

export default async function HomePage() {
  const latest = await getLatestProducts();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-r from-pink-100/90 via-rose-50 to-amber-50 p-8 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1 space-y-3">
          <p className="text-xs font-semibold tracking-wide text-pink-600 uppercase">
            New Season · New You
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Curated styles for every moment.
          </h1>
          <p className="text-sm md:text-base text-gray-700 max-w-xl">
            Discover dresses, tops, ethnic wear, and loungewear handpicked for comfort and elegance.
          </p>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3 text-xs text-gray-600">
          <div className="bg-white/70 backdrop-blur rounded-2xl p-3 shadow-sm">
            <p className="font-semibold text-pink-700 mb-1">Express Shipping</p>
            <p>Fast dispatch so your outfits arrive right on time.</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-2xl p-3 shadow-sm">
            <p className="font-semibold text-pink-700 mb-1">Handpicked Fabrics</p>
            <p>Soft, breathable materials for all-day comfort.</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-2xl p-3 shadow-sm">
            <p className="font-semibold text-pink-700 mb-1">Secure Checkout</p>
            <p>Powered by Stripe for smooth and safe payments.</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-2xl p-3 shadow-sm">
            <p className="font-semibold text-pink-700 mb-1">Easy Returns</p>
            <p>Hassle-free exchanges on eligible orders.</p>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Latest Collection</h2>
        <ProductGrid products={latest} />
      </section>
    </div>
  );
}
