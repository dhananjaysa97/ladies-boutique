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

interface Props {
  value: ProductFilterState;
  onChange: (value: ProductFilterState) => void;
}

const allSizes: Size[] = ['XS', 'S', 'M', 'L', 'XL'];
const allColors: ColorFilter[] = [
  'Black',
  'White',
  'Beige',
  'Blue',
  'Pink',
  'Red',
  'Green',
];

export const ProductFilters: React.FC<Props> = ({ value, onChange }) => {
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
    onChange({ sizes: [], colors: [], minPrice: undefined, maxPrice: undefined });
  };

  return (
    <section className="bg-white/80 backdrop-blur rounded-2xl shadow-sm p-4 mb-4 space-y-4 border border-white/70" aria-label="Product filters">
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="font-semibold mb-2 text-sm">Size</p>
          <div className="flex flex-wrap gap-2">
            {allSizes.map(size => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-3 py-1 text-xs rounded-full border ${
                  value.sizes.includes(size)
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-semibold mb-2 text-sm">Color</p>
          <div className="flex flex-wrap gap-2">
            {allColors.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                className={`px-3 py-1 text-xs rounded-full border ${
                  value.colors.includes(color)
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="font-semibold mb-2 text-sm">Price range ($)</p>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="min-price">
              Minimum price
            </label>
            <input
              id="min-price"
              type="number"
              placeholder="Min"
              className="w-20 border rounded-lg px-2 py-1 text-sm"
              value={minPriceInput}
              onChange={e => setMinPriceInput(e.target.value)}
            />
            <span className="text-xs text-gray-500">to</span>
            <label className="sr-only" htmlFor="max-price">
              Maximum price
            </label>
            <input
              id="max-price"
              type="number"
              placeholder="Max"
              className="w-20 border rounded-lg px-2 py-1 text-sm"
              value={maxPriceInput}
              onChange={e => setMaxPriceInput(e.target.value)}
            />
            <button
              type="button"
              onClick={applyPrice}
              className="text-xs px-3 py-1 rounded-full bg-gray-900 text-white"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="text-xs text-gray-500 underline"
        onClick={clearFilters}
      >
        Clear all filters
      </button>
    </section>
  );
};
