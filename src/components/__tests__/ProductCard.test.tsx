import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../ProductCard';
import { CartProvider } from '@/context/CartContext';
import { Product } from '@/lib/types';

const product: Product = {
  id: 'test',
  name: 'Test Dress',
  description: 'A lovely test dress.',
  price: 49.99,
  imageUrl: '/test.jpg',
  category: 'Dresses',
  sizes: ['S', 'M'],
  color: 'Pink',
};

test('renders product info and Add to cart button', () => {
  render(
    <CartProvider>
      <ProductCard product={product} />
    </CartProvider>
  );

  expect(screen.getByText('Test Dress')).toBeInTheDocument();
  expect(screen.getByText('A lovely test dress.')).toBeInTheDocument();
  expect(screen.getByText('$49.99')).toBeInTheDocument();

  const button = screen.getByRole('button', { name: /add to cart/i });
  fireEvent.click(button);
});
