'use client';

import { useState, ChangeEvent } from 'react';
import { Product, Size } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface Props {
  product: Product;
}

export const ProductDetailClient: React.FC<Props> = ({ product }) => {
  const { addToCart, items, updateQuantity } = useCart();
  const [selectedSize, setSelectedSize] = useState<Size | null>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : null
  );
  const [added, setAdded] = useState(false);

  const quantityForSelectedSize =
    selectedSize != null
      ? items.find(
          i => i.product.id === product.id && i.size === selectedSize
        )?.quantity ?? 0
      : 0;

  const handlePlus = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleMinus = () => {
    if (!selectedSize) return;
    if (quantityForSelectedSize <= 0) return;
    updateQuantity(product, selectedSize, quantityForSelectedSize - 1);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!selectedSize) return;
    const value = e.target.value;
    if (value === '') {
      updateQuantity(product, selectedSize, 0);
      return;
    }
    const num = parseInt(value, 10);
    if (Number.isNaN(num)) return;
    updateQuantity(product, selectedSize, num);
  };

  const displayQty = quantityForSelectedSize > 0 ? quantityForSelectedSize : 0;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Large image */}
        <div>
          <div className="overflow-hidden rounded-3xl bg-white/70 border border-white/80 shadow-sm">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-80 md:h-96 object-cover"
            />
          </div>
        </div>

        {/* Details + size selection + quantity controls */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {product.category}
              {product.color ? ` · ${product.color}` : ''}
            </p>
          </div>

          <p className="text-base text-gray-700">{product.description}</p>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-800">Select size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes?.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`px-3 py-1 text-xs rounded-full border ${
                    selectedSize === s
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-2xl font-semibold text-pink-700">
              ${product.price.toFixed(2)}
            </span>

            {displayQty > 0 && (
              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                {displayQty} in cart
              </span>
            )}
          </div>

          {/* Quantity controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMinus}
              className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 text-base disabled:opacity-50"
              aria-label="Decrease quantity"
              disabled={!selectedSize}
            >
              –
            </button>
            <input
              type="number"
              min={0}
              className="w-12 text-center text-sm rounded-full border border-gray-300 px-2 py-1"
              value={displayQty}
              onChange={handleInputChange}
              aria-label="Quantity for selected size"
            />
            <button
              type="button"
              onClick={handlePlus}
              className="h-8 w-8 flex items-center justify-center rounded-full border border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white text-base disabled:opacity-60"
              aria-label="Increase quantity"
              disabled={!selectedSize}
            >
              +
            </button>
          </div>

          <div aria-live="polite" aria-atomic="true">
            {added && (
              <p className="mt-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-2xl px-3 py-2 inline-block">
                Added to cart!
              </p>
            )}
          </div>

          {(product.isHot || product.isLatest) && (
            <div className="flex gap-2 text-xs mt-2">
              {product.isLatest && (
                <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  New arrival
                </span>
              )}
              {product.isHot && (
                <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">
                  Trending
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
