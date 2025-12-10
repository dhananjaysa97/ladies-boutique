import { ProductGrid } from '@/components/ProductGrid';
import { HotProductsMode } from '@/lib/types';

export default async function HotPage() {
  return (
    <ProductGrid mode={HotProductsMode} title='Hot Right Now. Bestsellers and trending outfits loved by our customers.'/>
  );
}
