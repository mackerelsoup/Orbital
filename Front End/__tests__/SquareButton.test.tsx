import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SquareButton from '../components/SquareButton'; 

describe('SquareButton', () => {
  it('renders with the correct label', () => {
    const { getByText } = render(
      <SquareButton label="Click Me" onPress={() => {}} />
    );
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockPress = jest.fn();

    const { getByText } = render(
      <SquareButton label="Press" onPress={mockPress} />
    );

    fireEvent.press(getByText('Press'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });
});
