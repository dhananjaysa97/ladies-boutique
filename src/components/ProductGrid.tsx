'use client';

import React, { useState, useEffect } from "react";
import ProductCard  from './ProductCard';
import { ProductGridProps, AllProductsMode, ProductFilterState } from '@/lib/types';
import { useProductsContext } from "@/context/ProductsContext";

import { SearchFilterComponent } from "./SearchFilterComponent";

export const ProductGrid: React.FC<ProductGridProps> = ({ mode = AllProductsMode, title }) => {

  const [mounted, setMounted] = useState(false);
  const { filteredProducts } = useProductsContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
  <div >
    <div className="grid gap-1 grid-cols-1 grid-cols-2  items-center justify-center ">  
      <h1 className="text-2xl font-semibold ">{title}</h1>
      <SearchFilterComponent/>
    </div>
    <div className="grid gap-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {filteredProducts.map((p, idx) => (
        <ProductCard key={p.id} product={p} index={idx + 1} />
      ))}
    </div>
  </div>
);

};
