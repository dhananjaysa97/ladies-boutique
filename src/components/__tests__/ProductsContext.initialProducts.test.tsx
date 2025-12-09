import { render, screen } from '@testing-library/react';
import { ProductsProvider, useProductsContext } from '@/context/ProductsContext';
import { Product } from '@/lib/types';

function ProductsConsumer() {
  const { allProducts } = useProductsContext();
  return (
    <ul>
      {allProducts.map(p => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}

test('ProductsProvider seeds allProducts from initialProducts without flashing empty', () => {
  const initial: Product[] = [
    {
      id: 'seed-1',
      name: 'Seed Product',
      description: 'Seed from SSR',
      price: 99,
      imageUrl: '/seed.jpg',
      category: 'Dresses',
      sizes: ['M'],
      color: 'Pink',
    } as Product,
  ];

  // Make fetch never resolve to simulate a slow API and ensure
  // we still see the SSR products immediately.
  (global as any).fetch = jest.fn(
    () => new Promise(() => {}),
  );

  render(
    <ProductsProvider initialProducts={initial}>
      <ProductsConsumer />
    </ProductsProvider>,
  );

  // If initialProducts is wired correctly, we see this even though fetch never resolves.
  expect(screen.getByText('Seed Product')).toBeInTheDocument();
});
