import { getLatestProducts } from '@/data/products';
import { ProductGrid } from '@/components/ProductGrid';
import { LatestProductsMode } from '@/lib/types';

export default async function LatestPage() {
  
  return (
    <ProductGrid mode={LatestProductsMode} title='Latest Collection. Fresh styles just added to Leena&apos;s Boutique.' />
  );
}
