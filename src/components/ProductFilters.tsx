'use client';

import { Size } from '@/lib/types';
import { useState } from 'react';

export type ColorFilter =
  | 'Black'
  | 'White'
  | 'Beige'
  | 'Blue'
  | 'Pink'
  | 'Red'
  | 'Green';

export interface ProductFilterState {
  sizes: Size[];
  colors: ColorFilter[];
  minPrice?: number;
  maxPrice?: number;
}

export const defaultProductFilterState: ProductFilterState = {
  sizes: [],
  colors: [],
  minPrice: undefined,
  maxPrice: undefined,
};

interface ProductFiltersProps {
  value: ProductFilterState;
  onChange: (value: ProductFilterState) => void;
}

const ALL_SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL'];
const ALL_COLORS: ColorFilter[] = [
  'Black',
  'White',
  'Beige',
  'Blue',
  'Pink',
  'Red',
  'Green',
];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  value,
  onChange,
}) => {
  const [minPriceInput, setMinPriceInput] = useState(
    value.minPrice?.toString() ?? ''
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    value.maxPrice?.toString() ?? ''
  );

  const toggleSize = (size: Size) => {
    const sizes = value.sizes.includes(size)
      ? value.sizes.filter(s => s !== size)
      : [...value.sizes, size];
    onChange({ ...value, sizes });
  };

  const toggleColor = (color: ColorFilter) => {
    const colors = value.colors.includes(color)
      ? value.colors.filter(c => c !== color)
      : [...value.colors, color];
    onChange({ ...value, colors });
  };

  const applyPrice = () => {
    onChange({
      ...value,
      minPrice: minPriceInput ? Number(minPriceInput) : undefined,
      maxPrice: maxPriceInput ? Number(maxPriceInput) : undefined,
    });
  };

  const clearFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    onChange(defaultProductFilterState);
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
              checked={value.sizes.includes(size)}
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
              checked={value.colors.includes(color)}
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
