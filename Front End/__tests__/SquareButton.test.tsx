import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SquareButton from '../components/SquareButton';

describe('SquareButton', () => {
  it('renders correctly with label', () => {
    const { getByText } = render(
      <SquareButton label="Click Me" onPress={() => {}} />
    );
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <SquareButton label="Press Me" onPress={mockPress} />
    );
    fireEvent.press(getByText('Press Me'));
    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('applies custom size and styles', () => {
    const { getByText, getByRole } = render(
      <SquareButton
        label="Styled"
        onPress={() => {}}
        size={120}
        backgroundColor="#123456"
        textColor="#abcdef"
      />
    );
    const button = getByText('Styled');
    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#abcdef' }),
      ])
    );
  });
});
