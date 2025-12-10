// src/context/__tests__/CartContext.test.tsx
import React, { ReactNode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';

const sampleProduct: Product = {
  id: 'p1',
  name: 'Sample Dress',
  description: 'Nice dress',
  price: 40,
  imageUrl: '/products/sample.jpg',
  category: 'Dresses',
  sizes: ['M'],
  color: 'Pink',
  isHot: false,
  isLatest: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  operationMode: 'create',
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.spyOn(Date, 'now').mockReturnValue(Date.now());
  });

  afterEach(() => {
    (Date.now as jest.Mock).mockRestore?.();
  });

  it('throws if useCart is used outside provider', () => {
    const { result } = renderHook(() => {
      try {
        return useCart();
      } catch (e) {
        return e;
      }
    });

    expect(result.current).toBeInstanceOf(Error);
    expect((result.current as Error).message).toMatch(
      /useCart must be used within CartProvider/
    );
  });

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct, 'M');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      product: { id: 'p1' },
      size: 'M',
      quantity: 1,
    });
  });

  it('increments quantity when same product+size added again', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct, 'M');
      result.current.addToCart(sampleProduct, 'M');
    });

    expect(result.current.items[0].quantity).toBe(2);
  });

  it('updates quantity with updateQuantity (min 1)', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct, 'M');
    });

    act(() => {
      result.current.updateQuantity(sampleProduct, 'M', 5);
    });

    expect(result.current.items[0].quantity).toBe(5);

    act(() => {
      result.current.updateQuantity(sampleProduct, 'M', 0);
    });

    // should clamp to 1
    expect(result.current.items[0].quantity).toBe(1);
  });

  it('removes item and clears cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct, 'M');
    });

    act(() => {
      result.current.removeFromCart('p1', 'M');
    });

    expect(result.current.items).toHaveLength(0);

    act(() => {
      result.current.addToCart(sampleProduct, 'M');
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('persists to localStorage', () => {
    const setItemSpy = jest.spyOn(window.localStorage.__proto__, 'setItem');

    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct, 'M');
    });

    expect(setItemSpy).toHaveBeenCalled();
    const payload = JSON.parse(
      window.localStorage.getItem('leenas-cart') || '{}'
    );
    expect(payload.items).toHaveLength(1);

    setItemSpy.mockRestore();
  });
});
