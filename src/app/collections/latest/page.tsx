import { getLatestProducts } from '@/data/products';
import { ProductGrid } from '@/components/ProductGrid';
import { LatestProducts } from '@/lib/types';

export default async function LatestPage() {
  
  return (
    <div className="space-y-1 ">
      <h1 className="text-1xl font-semibold">Latest Collection</h1>
      <p className="text-sm text-gray-600">
        Fresh styles just added to Leena&apos;s Boutique.
      </p>
      <ProductGrid mode={LatestProducts} />
    </div>
  );
}
