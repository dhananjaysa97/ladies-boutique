import { useState, useRef, ChangeEvent } from "react";
import { ProductFilters } from "./ProductFilters";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { useProductsContext } from '@/context/ProductsContext';

export const SearchFilterComponent = () => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const { filters, setFilters } = useProductsContext();
    
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleWrapperClick = () => {
    inputRef.current?.focus();
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      searchTerm: value,
    });
  };

    return(
    <>
    <div className="flex items-center justify-end gap-4">
      {/* “Text component” with search icon attached */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 bg-white shadow-sm cursor-text hover:border-gray-400"
        onClick={handleWrapperClick}
        title="Search / filter"
      >
        <MagnifyingGlassIcon className="w-4 h-4 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          className="bg-transparent border-none outline-none text-sm placeholder:text-gray-400 w-40"
          placeholder="Search products…"
          value={filters.searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* “More filters” label/button */}
      <button
        type="button"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <FunnelIcon className="w-4 h-4 mr-1" />
        More filters
      </button>
    </div>
        {
                  isFilterOpen ? (<div className="flex items-center justify-between mb-1">
              <ProductFilters />
            </div>) : null
                }
    </>
    );
}