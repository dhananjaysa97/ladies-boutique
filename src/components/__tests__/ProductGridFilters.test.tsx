import { render, screen, fireEvent } from '@testing-library/react';
import { ProductsProvider } from '@/context/ProductsContext';
import { ProductGrid } from '../ProductGrid';
import { AllProducts, Product } from '@/lib/types';

function renderWithProducts(products: Product[]) {
  // Mock fetch so the background refresh doesn’t break the test
  (global as any).fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(products),
    } as any),
  );

  return render(
    <ProductsProvider initialProducts={products}>
      <ProductGrid mode={AllProducts} />
    </ProductsProvider>,
  );
}

const baseProducts: Product[] = [
  {
    id: '1',
    name: 'Pink S Dress',
    description: 'Pink dress size S',
    price: 50,
    imageUrl: '/pink-s.jpg',
    category: 'Dresses',
    sizes: ['S'],
    color: 'Pink',
  } as Product,
  {
    id: '2',
    name: 'Black L Dress',
    description: 'Black dress size L',
    price: 80,
    imageUrl: '/black-l.jpg',
    category: 'Dresses',
    sizes: ['L'],
    color: 'Black',
  } as Product,
  {
    id: '3',
    name: 'Beige M Kurti',
    description: 'Beige kurti size M',
    price: 20,
    imageUrl: '/beige-m.jpg',
    category: 'Kurtis',
    sizes: ['M'],
    color: 'Beige',
  } as Product,
];

test('filters products by size', () => {
  renderWithProducts(baseProducts);

  // Initially, all products should show
  expect(screen.getByText('Pink S Dress')).toBeInTheDocument();
  expect(screen.getByText('Black L Dress')).toBeInTheDocument();

  // Click size S
  const sizeButton = screen.getByRole('button', { name: 'S' });
  fireEvent.click(sizeButton);

  // Only the S product remains
  expect(screen.getByText('Pink S Dress')).toBeInTheDocument();
  expect(screen.queryByText('Black L Dress')).not.toBeInTheDocument();
  expect(screen.queryByText('Beige M Kurti')).not.toBeInTheDocument();
});

test('filters products by color', () => {
  renderWithProducts(baseProducts);

  // Click color Pink
  const pinkButton = screen.getByRole('button', { name: 'Pink' });
  fireEvent.click(pinkButton);

  expect(screen.getByText('Pink S Dress')).toBeInTheDocument();
  expect(screen.queryByText('Black L Dress')).not.toBeInTheDocument();
  expect(screen.queryByText('Beige M Kurti')).not.toBeInTheDocument();
});

test('filters products by price range', () => {
  renderWithProducts(baseProducts);

  // Set Min and Max price using the placeholders from ProductFilters.tsx
  fireEvent.change(screen.getByPlaceholderText('Min'), {
    target: { value: '30' },
  });
  fireEvent.change(screen.getByPlaceholderText('Max'), {
    target: { value: '60' },
  });

  // Click "Apply"
  const applyButton = screen.getByRole('button', { name: /apply/i });
  fireEvent.click(applyButton);

  // Only the product in the 30–60 range should remain
  expect(screen.getByText('Pink S Dress')).toBeInTheDocument();
  expect(screen.queryByText('Black L Dress')).not.toBeInTheDocument();
  expect(screen.queryByText('Beige M Kurti')).not.toBeInTheDocument();
});

test('clear filters brings all products back', () => {
  renderWithProducts(baseProducts);

  // Apply a size filter first
  const sizeButton = screen.getByRole('button', { name: 'S' });
  fireEvent.click(sizeButton);
  expect(screen.getByText('Pink S Dress')).toBeInTheDocument();
  expect(screen.queryByText('Black L Dress')).not.toBeInTheDocument();

  // Clear all filters
  const clearButton = screen.getByRole('button', { name: /clear all filters/i });
  fireEvent.click(clearButton);

  // All products should be visible again
  expect(screen.getByText('Pink S Dress')).toBeInTheDocument();
  expect(screen.getByText('Black L Dress')).toBeInTheDocument();
  expect(screen.getByText('Beige M Kurti')).toBeInTheDocument();
});
