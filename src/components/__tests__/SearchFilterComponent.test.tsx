// src/components/__tests__/SearchFilterComponent.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchFilterComponent } from '../SearchFilterComponent';
import { ProductFilterState, defaultProductFilterState } from '@/lib/types';

// ✅ mock* names are allowed in jest.mock factory
const mockFilters: ProductFilterState = {
  ...defaultProductFilterState,
};

const mockSetFilters = jest.fn();

jest.mock('@/context/ProductsContext', () => ({
  useProductsContext: () => ({
    filters: mockFilters,
    setFilters: mockSetFilters,
  }),
}));

describe('SearchFilterComponent', () => {
  beforeEach(() => {
    mockSetFilters.mockClear();
  });

  it('updates filters.searchTerm on input change', () => {
    render(<SearchFilterComponent />);

    // If your input has a specific placeholder, you can also use getByPlaceholderText
    const searchInput = screen.getByRole('textbox');

    fireEvent.change(searchInput, { target: { value: 'dress' } });

    expect(mockSetFilters).toHaveBeenCalledTimes(1);

    const firstArg = mockSetFilters.mock.calls[0][0];

    // Support both: setFilters({ ... }) AND setFilters(prev => ({ ...prev, ... }))
    const nextFilters =
      typeof firstArg === 'function' ? firstArg(mockFilters) : firstArg;

    expect(nextFilters.searchTerm).toBe('dress');
  });
});
