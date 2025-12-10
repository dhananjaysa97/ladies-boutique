'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
} from 'react';
import { 
  Product, 
  ProductsStatus, 
  ProductFilterState, 
  defaultProductFilterState,
  ProductsContextValue 
} from '@/lib/types';

import { upsertProductInList, buildProductsCollections, applyProductFilters } from './ProductsContextHelper'

const ProductsContext = createContext<ProductsContextValue | undefined>(
  undefined
);

interface ProductProviderProps {
  initialProducts?: Product[];
  children: ReactNode;
}

export const ProductsProvider: React.FC<ProductProviderProps> = ({
  initialProducts = [],
  children,
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 1️⃣ First derive map + hot + latest from allProducts
  const { productsMap, hotProducts, latestProducts } = useMemo(
    () => buildProductsCollections(allProducts),
    [allProducts]
  );

  const [filters, setFilters] = useState<ProductFilterState>(defaultProductFilterState);
  
  // 2️⃣ Then derive filteredProducts using selected list + all filters
  const filteredProducts = useMemo(() => 
    applyProductFilters(filters, latestProducts, hotProducts, allProducts)
    ,[allProducts, filters, hotProducts, latestProducts]);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      const products: Product[] = data.products ?? [];
      setAllProducts(products);
    } catch (err) {
      console.error('Error fetching products', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductById = useCallback(
    (id: string) => productsMap[id],
    [productsMap]
  );

  const createProduct = useCallback(async (payload: Product) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error('Failed to save product', await res.text());
        return;
      }

      const updated = await res.json();
      const saved: Product = updated.product ?? payload;

      setAllProducts(prev => upsertProductInList(prev, saved));
    } catch (err) {
      console.error('Error saving product', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const upsertProduct = (p: Product) => {
    setAllProducts(prev => upsertProductInList(prev, p));
  };

  const removeProduct = (id: string) => {
    setAllProducts(prev => prev.filter(p => p.id !== id));
  };

  useEffect(() => {
    if (initialProducts.length === 0) {
      fetchAll();
    } else {
      // if SSR gave us data, ensure loading is false
      setLoading(false);
    }
  }, [initialProducts, fetchAll]);

  const productStatus: ProductsStatus = {
    loading,
    error,
  };

  const value: ProductsContextValue = {
    allProducts,
    hotProducts,
    latestProducts,
    productsMap,
    filters,
    productStatus,
    filteredProducts,
    setFilters,
    createProduct,
    upsertProduct,
    removeProduct,
    getProductById,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProductsContext = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error('useProducts must be used within ProductsProvider');
  }
  return ctx;
};
