import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CustomDropdown from '../components/CustomDropdown';  // Adjust import path

describe('CustomDropdown', () => {
  const data =  [
    {itemTestIDField: 'dropdown-item-apple', label: 'Apple', value: 'apple' },
    {itemTestIDField: 'dropdown-item-apple', label: 'Banana', value: 'banana' },
  ];

  it('renders correctly and handles selection', async () => {
    const handleChangeMock = jest.fn();

    const { getByText, queryByText, getByTestId } = render(
      <CustomDropdown data={data} handleChange={handleChangeMock} />
    );

    // Initially placeholder text is shown
    expect(getByText('Select Item')).toBeTruthy();

    const dropdown = getByTestId('custom-dropdown');
    fireEvent(dropdown, 'focus');
    
    // Now the options should be rendere

    // Select Banana
    const bananaOption = getByTestId('dropdown-item-banana');
    fireEvent.press(bananaOption);

    expect(handleChangeMock).toHaveBeenCalledWith({ label: 'Banana', value: 'banana' });

    // Placeholder text updates to Banana's value
    await waitFor(() => {
      expect(queryByText('Select Item')).toBeNull();
      expect(getByText('banana')).toBeTruthy();
    });
  });
});
