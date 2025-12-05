import { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface Props {
  products: Product[];
}

export const ProductGrid: React.FC<Props> = ({ products }) => {
  if (products.length === 0) {
    return <p className="text-gray-500 text-sm">No products found.</p>;
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p, idx) => (
        <ProductCard key={p.id} product={p} index={idx + 1} />
      ))}
    </div>
  );
};
