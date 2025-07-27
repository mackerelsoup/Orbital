import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../components/Button';
import { Text } from 'react-native';

describe('Button component', () => {
  it('renders the label text', () => {
    const { getByText } = render(<Button label="Click Me" />);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockPress = jest.fn();
    const { getByText } = render(<Button label="Submit" onPress={mockPress} />);

    fireEvent.press(getByText('Submit'));
    expect(mockPress).toHaveBeenCalled();
  });

  it('renders child component if provided', () => {
    const { getByText } = render(
      <Button label="Parent">
        <Text>Child Element</Text>
      </Button>
    );
    expect(getByText('Child Element')).toBeTruthy();
  });
});
