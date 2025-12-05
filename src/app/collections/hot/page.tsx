import { getHotProducts } from '@/data/products';
import { ProductGrid } from '@/components/ProductGrid';

export default async function HotPage() {
  const products = await getHotProducts();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Hot Right Now</h1>
      <p className="text-sm text-gray-600">
        Bestsellers and trending outfits loved by our customers.
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
