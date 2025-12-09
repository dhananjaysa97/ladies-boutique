import { ProductGrid } from '@/components/ProductGrid';
import { HotProducts } from '@/lib/types';

export default async function HotPage() {
  return (
    <div className="space-y-1">
      <h1 className="text-1xl font-semibold">Hot Right Now</h1>
      <p className="text-sm text-gray-600">
        Bestsellers and trending outfits loved by our customers.
      </p>
      <ProductGrid mode={HotProducts}/>
    </div>
  );
}
