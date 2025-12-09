import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  ProductFilters,
  defaultProductFilterState,
} from '../ProductFilters';

describe('ProductFilters', () => {
  it('toggles size and color and calls onChange', () => {
    const handleChange = jest.fn();

    render(
      <ProductFilters
        value={defaultProductFilterState}
        onChange={handleChange}
      />
    );

    const sizeCheckbox = screen.getByLabelText('S');
    fireEvent.click(sizeCheckbox);

    expect(handleChange).toHaveBeenCalled();
    const latestCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
    expect(latestCall.sizes).toContain('S');

    const colorCheckbox = screen.getByLabelText('Black');
    fireEvent.click(colorCheckbox);

    const latestCall2 = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
    expect(latestCall2.colors).toContain('Black');
  });
});
