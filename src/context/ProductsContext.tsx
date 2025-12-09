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
import { Product, ProductsStatus } from '@/lib/types';

interface ProductsContextValue {
  allProducts: Product[];
  hotProducts: Product[];
  latestProducts: Product[];
  productsMap: Record<string, Product>;
  productStatus: ProductsStatus;
  createProduct: (p: Product) => Promise<void>;
  upsertProduct: (p: Product) => void;
  removeProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextValue | undefined>(
  undefined
);

interface ProductProviderProps {
  initialProducts?: Product[];
  children: ReactNode;
}

function parseDate(d: string | Date | null | undefined): Date {
  if (!d) return new Date(0);
  return d instanceof Date ? d : new Date(d);
}

// Build derived collections from allProducts
function buildProductsCollections(products: Product[]) {
  const productsMap: Record<string, Product> = {};

  for (const p of products) {
    if (p.id) {
      productsMap[p.id] = p;
    }
  }

  const hotProducts = products.filter(p => p.isHot);

  const latestProducts = products
    .filter(p => p.isLatest)
    .slice()
    .sort(
      (a, b) =>
        parseDate(b.createdAt as any).getTime() -
        parseDate(a.createdAt as any).getTime()
    );

  return { productsMap, hotProducts, latestProducts };
}

function upsertProductInList(list: Product[], saved: Product): Product[] {
  const idx = list.findIndex(x => x.id === saved.id);

  if (idx === -1) {
    // Add new to front
    return [saved, ...list];
  }

  const copy = [...list];
  copy[idx] = saved;
  return copy;
}

export const ProductsProvider: React.FC<ProductProviderProps> = ({
  initialProducts = [],
  children,
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const { productsMap, hotProducts, latestProducts } = useMemo(
    () => buildProductsCollections(allProducts),
    [allProducts]
  );

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
    // If initialProducts came from server, we still refresh client side
    fetchAll();
  }, [fetchAll]);

  const productStatus: ProductsStatus = {
    loading,
    error,
  };

  const value: ProductsContextValue = {
    allProducts,
    hotProducts,
    latestProducts,
    productsMap,
    productStatus,
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
