'use client';

import React, { useState, useEffect, useMemo } from "react";
import ProductCard  from './ProductCard';
import { Product, ProductGridProps, AllProducts } from '@/lib/types';
import { useProductsContext } from "@/context/ProductsContext";
import {
  ProductFilterState,
  ProductFilters,
} from '@/components/ProductFilters';

export const ProductGrid: React.FC<ProductGridProps> = ({ mode = AllProducts }) => {

  const [mounted, setMounted] = useState(false);
  // const [loading, setLoading] = useState(true);
  const { allProducts, hotProducts, latestProducts } = useProductsContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [filters, setFilters] = useState<ProductFilterState>({
    sizes: [],
    colors: [],
    minPrice: undefined,
    maxPrice: undefined,
  });
  


  let products : Product[] = mode === 'hot' ? 
    hotProducts : mode === 'latest' ? latestProducts : allProducts;

   const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (filters.sizes.length > 0) {
        const hasSize = p.sizes?.some((s: any) => filters.sizes.includes(s));
        if (!hasSize) return false;
      }
      if (filters.colors.length > 0) {
        if (!p.color) return false;
        const normalized = p.color.toLowerCase();
        const match = filters.colors.some(c =>
          normalized.includes(c.toLowerCase())
        );
        if (!match) return false;
      }
      if (filters.minPrice != null && p.price < filters.minPrice) return false;
      if (filters.maxPrice != null && p.price > filters.maxPrice) return false;
      return true;
    });
  }, [products, filters]);
  

  return (
  <div>
    <div className="flex items-center justify-between mb-1">
      <ProductFilters value={filters} onChange={setFilters} />
    </div>

    <div className="grid gap-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {filteredProducts.map((p, idx) => (
        <ProductCard key={p.id} product={p} index={idx + 1} />
      ))}
    </div>
  </div>
);

};
