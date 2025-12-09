'use client';

import { useEffect, useMemo, useState } from 'react';
import { AllProducts, Product } from '@/lib/types';
import { ProductGrid } from '@/components/ProductGrid';
import {
  ProductFilterState,
  ProductFilters,
} from '@/components/ProductFilters';
import { useProductsContext } from '@/context/ProductsContext';

export default function ShopPage() {
  const{allProducts} = useProductsContext();
  return (
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Shop All</h1>
        <ProductGrid mode={AllProducts} />
    </div>
  );
}
