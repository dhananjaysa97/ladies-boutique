'use client';

import { AllProductsMode } from '@/lib/types';
import { ProductGrid } from '@/components/ProductGrid';

export default function ShopPage() {
  // const{allProducts} = useProductsContext();
  return (
      
        <ProductGrid mode={AllProductsMode} title='Shop All' />
  );
}
