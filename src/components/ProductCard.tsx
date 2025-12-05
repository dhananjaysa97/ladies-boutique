"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Product, Size } from "@/lib/types";
import { useCart } from "@/context/CartContext";

interface Props {
  product: Product;
  index?: number; // for voice badge
}

export const ProductCard: React.FC<Props> = ({ product, index }) => {
  const [mounted, setMounted] = useState(false);   
  useEffect(() => {
    setMounted(true);
  }, []);

  const { addToCart, updateQuantity, items } = useCart();

  // Support multiple images if product.images exists, otherwise fall back to imageUrl
  const images =
    (product as any).images && (product as any).images.length > 0
      ? ((product as any).images as string[])
      : [product.imageUrl || "/products/placeholder.jpg"];

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

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

  const [selectedSize, setSelectedSize] = useState<Size | null>(
    product.sizes?.length ? (product.sizes[0] as Size) : null
  );

  const effectiveSize = selectedSize;

  const quantityInCart =
    effectiveSize == null
      ? 0
      : items
          .filter(
            (i) => i.product.id === product.id && i.size === effectiveSize
          )
          .reduce((sum, i) => sum + i.quantity, 0);

  const handlePlus = () => {
    if (!effectiveSize) return;
    addToCart(product, effectiveSize);
  };

  const handleMinus = () => {
    if (!effectiveSize || quantityInCart <= 0) return;
    updateQuantity(product, effectiveSize, quantityInCart - 1);
  };

  const handleQtyChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!effectiveSize) return;
    const raw = e.target.value;
    if (raw === "") {
      updateQuantity(product, effectiveSize, 0);
      return;
    }
    const num = parseInt(raw, 10);
    if (Number.isNaN(num)) return;
    updateQuantity(product, effectiveSize, Math.max(0, num));
  };

  const displayQty = quantityInCart > 0 ? quantityInCart : 0;

  return (
    <>
      <div
        className="group bg-white/80 backdrop-blur rounded-2xl shadow-sm overflow-hidden flex flex-col border-2 border-pink-700"
        data-product-index={index ?? undefined}
      >
        {/* IMAGE – opens modal, does NOT navigate */}
        <div className="relative bg-gray-50 overflow-hidden">
          <div
            className="w-full h-40 flex items-center justify-center cursor-zoom-in"
            onClick={() => setZoomOpen(true)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            aria-label={`View larger image of ${product.name}`}
          >
            <img
              src={currentImage}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
              onError={(e) => {
                const img = e.currentTarget;
                img.onerror = null;
                img.src = "/products/placeholder.jpg";
              }}
            />
          </div>

          {/* dots under image if multiple images */}
          {images.length > 1 && (
            <div className="absolute bottom-1 left-0 right-0 flex items-center justify-center gap-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`h-1.5 w-1.5 rounded-full ${
                    idx === activeIndex ? "bg-pink-500" : "bg-gray-300"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(idx);
                  }}
                  aria-label={`Show image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Index badge for voice */}
          {index != null && (
            <span className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full bg-blue-900 text-white">
              {index}
            </span>
          )}

          {/* Hot / New badges */}
          {product.isHot && (
            <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full bg-red-500 text-white">
              Hot
            </span>
          )}
          {!product.isHot && product.isLatest && (
            <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full bg-emerald-500 text-white">
              New
            </span>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-1 flex-1 flex flex-col gap-1">
          {/* NAME – CLICKABLE to details */}
          <div className="flex ">
            <Link href={`/products/${product.id}`} className="grow">
              <h3 className="text-sm grow font-semibold text-blue-500 underline line-clamp-1">
                {product.name}
              </h3>
            </Link>
            <p className="text-[11px] flex-none uppercase tracking-wide text-gray-500">
              {product.category}
            </p>
          </div>

          <div className="flex">
            <p className=" grow text-xs text-gray-600 line-clamp-2">
              {product.description}
            </p>

            {product.color && (
              <p className="text-[11px] flex-none text-gray-500">
                Color: {product.color}
              </p>
            )}
          </div>

        <div className="mt-2 flex items-center justify-between">
{/* PRICE */}
          <span className="text-sm font-semibold text-pink-700">
            ${product.price.toFixed(2)}
          </span>

          {/* SIZES */}
          {product.sizes?.length > 0 && (
            <div className="flex items-center gap-2 text-[11px] text-gray-600">
              <div className="flex flex-wrap gap-1">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size as Size)}
                    className={`px-2 py-0.5 rounded-full border ${
                      selectedSize === size
                        ? "bg-pink-500 text-white border-pink-500"
                        : "border-gray-300 text-gray-700 hover:border-pink-400"
                    }`}
                    aria-pressed={selectedSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CART CONTROLS */}
          <div className="flex items-center justify-between mt-1">
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
                onChange={handleQtyChange}
                aria-label="Quantity in cart"
              />
              <button
                type="button"
                onClick={handlePlus}
                className="h-6 w-6 flex items-center justify-center rounded-full border border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white text-xs"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
</div>
          

      {/* ZOOM MODAL – enlarged image with swipe */}
  {zoomOpen && mounted &&
  createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70"
      onClick={() => setZoomOpen(false)}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] mx-4 bg-black rounded-2xl overflow-hidden flex items-center justify-center"
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          className="absolute top-2 right-2 text-white text-xl px-2"
          onClick={() => setZoomOpen(false)}
          aria-label="Close image"
        >
          ✕
        </button>

        <img
          src={currentImage}
          alt={product.name}
          className="max-w-full max-h-[90vh] object-contain cursor-zoom-out"
          onError={e => {
            const img = e.currentTarget;
            img.onerror = null;
            img.src = "/products/placeholder.jpg";
          }}
        />

        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                className={`h-2 w-2 rounded-full ${
                  idx === activeIndex ? "bg-pink-500" : "bg-gray-400"
                }`}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Show image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}


    </>
  );
};
