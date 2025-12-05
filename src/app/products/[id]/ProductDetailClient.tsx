'use client';

import { useState, ChangeEvent } from 'react';
import { Product, Size } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface Props {
  product: Product;
}

export const ProductDetailClient: React.FC<Props> = ({ product }) => {
  const { addToCart, items, updateQuantity } = useCart();

  // images: prefer product.images if provided, otherwise fall back to imageUrl
  const images =
    (product as any).images && (product as any).images.length > 0
      ? (product as any).images as string[]
      : [product.imageUrl];

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const defaultSize: Size | null =
    product.sizes && product.sizes.length > 0 ? (product.sizes[0] as Size) : null;

  const [selectedSize, setSelectedSize] = useState<Size | null>(defaultSize);
  const [added, setAdded] = useState(false);

  const currentImage = images[activeIndex];

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.changedTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX == null) return;
    const endX = e.changedTouches[0].clientX;
    const delta = endX - touchStartX;

    if (Math.abs(delta) > 40) {
      if (delta < 0) goNext(); // swipe left
      else goPrev(); // swipe right
    }

    setTouchStartX(null);
  };

  // quantity in cart for this product + selected size
  const quantityInCart =
    selectedSize == null
      ? 0
      : items
          .filter(
            (i) => i.product.id === product.id && i.size === selectedSize
          )
          .reduce((sum, i) => sum + i.quantity, 0);

  const handleAdd = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleQtyChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!selectedSize) return;
    const value = e.target.value;
    if (value === '') {
      updateQuantity(product, selectedSize, 0);
      return;
    }
    const num = parseInt(value, 10);
    if (Number.isNaN(num)) return;
    updateQuantity(product, selectedSize, num < 0 ? 0 : num);
  };

  const handleMinus = () => {
    if (!selectedSize || quantityInCart <= 0) return;
    updateQuantity(product, selectedSize, quantityInCart - 1);
  };

  const handlePlus = () => {
    if (!selectedSize) return;
    updateQuantity(product, selectedSize, quantityInCart + 1);
  };

  const displayQty = quantityInCart > 0 ? quantityInCart : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-2">
      {/* Left: image + dots with swipe */}
      <div>
        <div
          className="w-full h-80 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden cursor-zoom-in"
          onClick={() => setZoomOpen(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label="View larger image"
        >
          <img
            src={currentImage}
            alt={product.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200 hover:scale-105"
            onError={(e) => {
              const img = e.currentTarget;
              img.onerror = null;
              img.src = '/products/placeholder.jpg';
            }}
          />
        </div>

        {images.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`h-2 w-2 rounded-full ${
                  idx === activeIndex ? 'bg-pink-500' : 'bg-gray-300'
                }`}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Show image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: info, sizes, cart controls */}
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-sm text-gray-600">{product.description}</p>

        <p className="text-lg font-semibold text-pink-700">
          ${product.price.toFixed(2)}
        </p>

        {product.sizes?.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Available sizes:</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size as Size)}
                  className={`px-3 py-1 rounded-full border text-xs ${
                    selectedSize === size
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'border-gray-300 text-gray-700 hover:border-pink-400'
                  }`}
                  aria-pressed={selectedSize === size}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          {/* Quantity controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMinus}
              className="h-7 w-7 flex items-center justify-center rounded-full border border-gray-300 text-sm"
              aria-label="Decrease quantity"
            >
              –
            </button>
            <input
              type="number"
              min={0}
              value={displayQty}
              onChange={handleQtyChange}
              className="w-12 text-center text-xs rounded-full border border-gray-300 px-1 py-1"
              aria-label="Quantity in cart"
            />
            <button
              type="button"
              onClick={handlePlus}
              className="h-7 w-7 flex items-center justify-center rounded-full border border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white text-sm"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Add to cart button */}
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 rounded-full bg-pink-500 text-white text-xs font-medium hover:bg-pink-600 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!selectedSize}
          >
            {added ? 'Added!' : 'Add to cart'}
          </button>
        </div>

        {product.isHot || product.isLatest ? (
          <div className="pt-2 flex gap-2 text-[11px]">
            {product.isLatest && (
              <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                New Arrival
              </span>
            )}
            {product.isHot && (
              <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">
                Trending
              </span>
            )}
          </div>
        ) : null}
      </div>

      {/* Zoom modal with swipe support too */}
      {zoomOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomOpen(false)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-black rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              className="absolute top-2 right-2 text-white text-xl px-2"
              onClick={() => setZoomOpen(false)}
            >
              ✕
            </button>
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={currentImage}
                alt={product.name}
                className="max-w-full max-h-[90vh] object-contain cursor-zoom-out"
                onError={(e) => {
                  const img = e.currentTarget;
                  img.onerror = null;
                  img.src = '/products/placeholder.jpg';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
