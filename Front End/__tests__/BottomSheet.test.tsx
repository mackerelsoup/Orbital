import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomBottomSheet from '../components/BottomSheet';

describe('CustomBottomSheet', () => {
  it('renders both options', () => {
    const { getByText } = render(<CustomBottomSheet onSelect={() => {}} />);
    expect(getByText('Distance')).toBeTruthy();
    expect(getByText('Availability')).toBeTruthy();
  });

  it('calls onSelect with "distance" when Distance is pressed', () => {
    const onSelectMock = jest.fn();
    const { getByText } = render(<CustomBottomSheet onSelect={onSelectMock} />);
    fireEvent.press(getByText('Distance'));
    expect(onSelectMock).toHaveBeenCalledWith('distance');
  });

  it('calls onSelect with "availability" when Availability is pressed', () => {
    const onSelectMock = jest.fn();
    const { getByText } = render(<CustomBottomSheet onSelect={onSelectMock} />);
    fireEvent.press(getByText('Availability'));
    expect(onSelectMock).toHaveBeenCalledWith('availability');
  });
});
