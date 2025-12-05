'use client';

import { useEffect, useMemo, useState } from 'react';
import { Product } from '@/lib/types';
import { ProductGrid } from '@/components/ProductGrid';
import {
  ProductFilterState,
  ProductFilters,
} from '@/components/ProductFilters';

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<ProductFilterState>({
    sizes: [],
    colors: [],
    minPrice: undefined,
    maxPrice: undefined,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setAllProducts(data.products);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
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
  }, [allProducts, filters]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Shop All</h1>
        <p className="text-sm text-gray-600">
          Browse all categories and refine by size, color, and price.
        </p>
      </div>
      <ProductFilters value={filters} onChange={setFilters} />
      {loading ? (
        <p className="text-gray-500 text-sm">Loading products…</p>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </div>
  );
}
