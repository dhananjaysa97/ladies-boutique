'use client';

import { Size, ColorFilter, ALL_SIZES, ALL_COLORS, AllProductsMode, defaultProductFilterState } from '@/lib/types';
import {  useState } from 'react';
import { useProductsContext } from '@/context/ProductsContext';

export const ProductFilters  = () => {
  const { filters, setFilters } = useProductsContext();
  const [minPriceInput, setMinPriceInput] = useState(
  filters.minPrice != null ? String(filters.minPrice) : ''
);
const [maxPriceInput, setMaxPriceInput] = useState(
  filters.maxPrice != null ? String(filters.maxPrice) : ''
);
  
  const toggleSize = (size: Size) => {
    const isSelected = filters.sizes.includes(size);
    const updatedSize = isSelected 
    ? filters.sizes.filter(s => s != size)
    : [...filters.sizes, size]

    setFilters({
        ...filters,
        sizes: updatedSize
      });
  };

  const toggleColor = (color: ColorFilter) => {
    const isSelected = filters.colors.includes(color);
    const updated = isSelected 
    ? filters.colors.filter(c => c != color)
    : [...filters.colors, color]

    setFilters({
        ...filters,
        colors: updated
      });
  };

  const applyPrice = () => {
    const parsedMin = minPriceInput.trim() === '' ? undefined : Number(minPriceInput);
  const parsedMax = maxPriceInput.trim() === '' ? undefined : Number(maxPriceInput);
  setFilters({
    ...filters,
    minPrice: parsedMin,
    maxPrice: parsedMax
  })
  };

  const clearFilters = () => {
    setFilters(defaultProductFilterState);
  };

  return (
    <section
      className="flex flex-wrap items-center gap-4 py-2 text-xs md:text-sm"
      aria-label="Product filters"
    >
      {/* Sizes */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-700">Sizes:</span>
        {ALL_SIZES.map(size => (
          <label key={size} className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={filters.sizes.includes(size)}
              onChange={() => toggleSize(size)}
            />
            <span>{size}</span>
          </label>
        ))}
      </div>

      {/* Colors */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-700">Colors:</span>
        {ALL_COLORS.map(color => (
          <label key={color} className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={filters.colors.includes(color)}
              onChange={() => toggleColor(color)}
            />
            <span>{color}</span>
          </label>
        ))}
      </div>

      {/* Price range */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-700">Price:</span>
        <input
          type="number"
          className="w-16 rounded border px-1 py-0.5 text-xs"
          placeholder="Min"
          value={minPriceInput}
          onChange={e => setMinPriceInput(e.target.value)}
          onBlur={applyPrice}
        />
        <span>-</span>
        <input
          type="number"
          className="w-16 rounded border px-1 py-0.5 text-xs"
          placeholder="Max"
          value={maxPriceInput}
          onChange={e => setMaxPriceInput(e.target.value)}
          onBlur={applyPrice}
        />

        <button
          type="button"
          className="text-xs text-gray-500 underline ml-2"
          onClick={clearFilters}
        >
          Clear all filters
        </button>
      </div>
    </section>
  );
};
