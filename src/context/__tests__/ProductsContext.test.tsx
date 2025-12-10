// src/context/__tests__/ProductsContext.test.tsx
import React, { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  ProductsProvider,
  useProductsContext,
} from '@/context/ProductsContext';
import {
  Product,
  defaultProductFilterState,
} from '@/lib/types';

const p1: Product = {
  id: '1',
  name: 'Pink Dress',
  description: 'Floral',
  price: 50,
  imageUrl: '/products/p1.jpg',
  category: 'Dresses',
  sizes: ['S', 'M'],
  color: 'Pink',
  isHot: true,
  isLatest: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  operationMode: 'create',
};

const p2: Product = {
  id: '2',
  name: 'Blue Jeans',
  description: 'Denim',
  price: 80,
  imageUrl: '/products/p2.jpg',
  category: 'Jeans',
  sizes: ['M'],
  color: 'Blue',
  isHot: false,
  isLatest: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  operationMode: 'create',
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <ProductsProvider initialProducts={[p1, p2]}>{children}</ProductsProvider>
);

describe('ProductsContext', () => {
  it('throws when used outside provider', () => {
    const { result } = renderHook(() => {
      try {
        return useProductsContext();
      } catch (e) {
        return e;
      }
    });

    expect(result.current).toBeInstanceOf(Error);
    expect((result.current as Error).message).toMatch(
      /useProducts must be used within ProductsProvider/
    );
  });

  it('exposes allProducts and filteredProducts', () => {
    const { result } = renderHook(() => useProductsContext(), { wrapper });

    expect(result.current.allProducts).toHaveLength(2);
    expect(result.current.filteredProducts).toHaveLength(2);
    expect(result.current.productStatus.loading).toBe(false);
  });

  it('filters products when filters change', () => {
    const { result } = renderHook(() => useProductsContext(), { wrapper });

    act(() => {
      result.current.setFilters({
        ...defaultProductFilterState,
        searchTerm: 'jeans',
      });
    });

    expect(result.current.filteredProducts).toHaveLength(1);
    expect(result.current.filteredProducts[0].id).toBe('2');
  });

  it('getProductById returns correct product', () => {
    const { result } = renderHook(() => useProductsContext(), { wrapper });

    const found = result.current.getProductById('1');
    expect(found?.name).toBe('Pink Dress');
  });

  it('upsertProduct updates allProducts', () => {
    const { result } = renderHook(() => useProductsContext(), { wrapper });

    act(() => {
      result.current.upsertProduct({
        ...p1,
        name: 'Updated Dress',
      });
    });

    const updated = result.current.allProducts.find(p => p.id === '1');
    expect(updated?.name).toBe('Updated Dress');
  });

  it('removeProduct removes from list', () => {
    const { result } = renderHook(() => useProductsContext(), { wrapper });

    act(() => {
      result.current.removeProduct('1');
    });

    expect(result.current.allProducts.map(p => p.id)).toEqual(['2']);
  });
});
