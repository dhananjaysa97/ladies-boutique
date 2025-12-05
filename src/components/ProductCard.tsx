'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface Props {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<Props> = ({ product, index }) => {
  const { addToCart, updateQuantity, items } = useCart();
  const [hovered, setHovered] = useState(false);

  const defaultSize =
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;

  const quantityInCart = items
    .filter(i => i.product.id === product.id)
    .reduce((sum, i) => sum + i.quantity, 0);

  const handlePlus = () => {
    if (!defaultSize) return;
    addToCart(product, defaultSize);
  };

  const handleMinus = () => {
    if (!defaultSize) return;
    if (quantityInCart <= 0) return;

    const lineForDefault = items.find(
      i => i.product.id === product.id && i.size === defaultSize
    );

    if (lineForDefault) {
      const newQty = lineForDefault.quantity - 1;
      updateQuantity(product, defaultSize, newQty);
    }
  };

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    if (!defaultSize) return;
    const value = e.target.value;
    if (value === '') {
      updateQuantity(product, defaultSize, 0);
      return;
    }
    const num = parseInt(value, 10);
    if (Number.isNaN(num)) return;
    updateQuantity(product, defaultSize, num);
  };

  const displayQty = quantityInCart > 0 ? quantityInCart : 0;

  return (
    <div
      className="group bg-white/80 backdrop-blur rounded-2xl shadow-sm overflow-hidden flex flex-col border border-white/70"
      data-product-index={index ?? undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.id}`} data-role="open-details">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-40 w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* Number badge (for voice commands) */}
        {index != null && (
          <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-black/70 text-white">
            {index}
          </span>
        )}

        {/* Badges */}
        {product.isHot && (
          <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full bg-red-500 text-white">
            Hot
          </span>
        )}
        {product.isLatest && !product.isHot && (
          <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full bg-emerald-500 text-white">
            New
          </span>
        )}

        {/* Hover / focus controls: + [qty] - (explicit hover state for Safari) */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 transition-all duration-200
          ${hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
          group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100`}
        >
          <div className="pointer-events-auto bg-black/60 text-white text-xs flex items-center justify-center gap-2 px-3 py-2">
            <button
              type="button"
              onClick={handleMinus}
              className="h-6 w-6 flex items-center justify-center rounded-full bg-gray-700 hover:bg-gray-600 text-sm"
              aria-label="Decrease quantity"
            >
              –
            </button>
            <input
              type="number"
              min={0}
              className="w-12 text-center text-[11px] rounded-full bg-white text-black px-1 py-0.5"
              value={displayQty}
              onChange={handleInputChange}
              aria-label="Quantity in cart"
            />
            <button
              type="button"
              onClick={handlePlus}
              className="h-6 w-6 flex items-center justify-center rounded-full bg-pink-500 hover:bg-pink-400 text-sm"
              aria-label="Increase quantity"
              data-role="add-to-cart"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Text section */}
      <div className="p-3 flex-1 flex flex-col gap-1">
        <h3 className="text-sm font-semibold line-clamp-1">{product.name}</h3>
        <p className="text-[11px] uppercase tracking-wide text-gray-500">
          {product.category}
        </p>
        {product.color && (
          <p className="text-[11px] text-gray-500 line-clamp-1">
            Color: {product.color}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-600 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-pink-700">
            ${product.price.toFixed(2)}
          </span>

          {/* Always-visible controls for mobile / non-hover */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMinus}
              className="h-6 w-6 flex items-center justify-center rounded-full border border-gray-300 text-xs"
              aria-label="Decrease quantity"
            >
              –
            </button>
            <input
              type="number"
              min={0}
              className="w-10 text-center text-[11px] rounded-full border border-gray-300 px-1 py-0.5"
              value={displayQty}
              onChange={handleInputChange}
              aria-label="Quantity in cart"
            />
            <button
              type="button"
              onClick={handlePlus}
              className="h-6 w-6 flex items-center justify-center rounded-full border border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white text-xs"
              aria-label="Increase quantity"
              data-role="add-to-cart"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
