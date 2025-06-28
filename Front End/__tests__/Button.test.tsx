import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../components/Button';
import { Text } from 'react-native';

describe('Button', () => {
  it('renders the label correctly', () => {
    const { getByText } = render(<Button label="Click me" />);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button label="Press me" onPress={onPressMock} />);
    fireEvent.press(getByText('Press me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <Button label="With children">
        <Text>Child content</Text>
      </Button>
    );
    expect(getByText('With children')).toBeTruthy();
    expect(getByText('Child content')).toBeTruthy();
  });
});
