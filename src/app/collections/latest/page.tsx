import { getLatestProducts } from '@/data/products';
import { ProductGrid } from '@/components/ProductGrid';

export default async function LatestPage() {
  const products = await getLatestProducts();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Latest Collection</h1>
      <p className="text-sm text-gray-600">
        Fresh styles just added to Leena&apos;s Boutique.
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
