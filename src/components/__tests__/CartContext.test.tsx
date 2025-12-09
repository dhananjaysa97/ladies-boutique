import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import { Product } from '@/lib/types';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CartProvider>{children}</CartProvider>
);

const sampleProduct: Product = {
  id: 'p1',
  name: 'Test Dress',
  description: 'A dress',
  price: 50,
  imageUrl: '/test.jpg',
  category: 'Dresses',
  sizes: ['S', 'M'],
  color: 'Pink',
  isHot: false,
  isLatest: false,
  gallery: [],
};

describe('CartContext', () => {
  it('adds items and increments quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct, 'M');
      result.current.addToCart(sampleProduct, 'M');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.total).toBe(100);
  });

  it('removes items', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(sampleProduct, 'M');
      result.current.removeFromCart(sampleProduct.id, 'M');
    });

    expect(result.current.items).toHaveLength(0);
  });
});
