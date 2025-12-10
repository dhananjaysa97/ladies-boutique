// src/components/__tests__/ProductCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../ProductCard';
import { Product } from '@/lib/types';

// ✅ All Jest mocks use names starting with `mock*`
const mockAddToCart = jest.fn();
const mockUpdateQuantity = jest.fn();
const mockRemoveProduct = jest.fn();

// Mock next-auth session (non-admin user)
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
}));

// Simple Link mock for Next.js
jest.mock('next/link', () => {
  return ({ href, children }: any) => <a href={href}>{children}</a>;
});

// Avoid real portals during tests
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

// Mock CartContext with our mock functions
jest.mock('@/context/CartContext', () => ({
  useCart: () => ({
    items: [],
    addToCart: mockAddToCart,
    updateQuantity: mockUpdateQuantity,
  }),
}));

// Mock ProductsContext (for removeProduct)
jest.mock('@/context/ProductsContext', () => ({
  useProductsContext: () => ({
    removeProduct: mockRemoveProduct,
  }),
}));

// Mock components used inside ProductCard
jest.mock('@/components/EditProduct', () => () => <div>EditProduct</div>);
jest.mock('@/components/ModalComponent', () => ({ children }: any) => (
  <div>{children}</div>
));

// Minimal valid product for the card
const mockProduct: Product = {
  id: '1',
  name: 'Test Dress',
  description: 'A very nice dress',
  price: 49.99,
  imageUrl: '/products/placeholder.jpg',
  gallery: [],
  images: [],
  category: 'Dress',
  sizes: ['S', 'M'],
  color: 'Red',
  isHot: false,
  isLatest: false,
  operationMode: 'create',
};

describe('ProductCard', () => {
  beforeEach(() => {
    mockAddToCart.mockClear();
    mockUpdateQuantity.mockClear();
    mockRemoveProduct.mockClear();
  });

  it('calls addToCart when the + (increase) button is clicked', () => {
    render(<ProductCard product={mockProduct} />);

    // Button is wired to handlePlus → addToCart(...)
    const plusButton = screen.getByRole('button', {
      name: /increase quantity/i,
    });

    fireEvent.click(plusButton);

    expect(mockAddToCart).toHaveBeenCalledTimes(1);
    expect(mockAddToCart).toHaveBeenCalledWith(
      mockProduct,
      mockProduct.sizes[0] // initial selected size
    );
  });
});
