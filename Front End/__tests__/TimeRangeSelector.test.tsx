import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TimeRangeSelector from '../components/TimeRangeSelector';

describe('TimeRangeSelector', () => {
  const mockOnSelect = jest.fn();

  it('renders all time ranges', () => {
    const { getByText } = render(
      <TimeRangeSelector selected="Day" onSelect={mockOnSelect} />
    );

    ['4HR', 'Day', 'Week', 'Month', 'Year'].forEach((label) => {
      expect(getByText(label)).toBeTruthy();
    });
  });

  it('applies selected styles to the selected range', () => {
    const { getByText } = render(
      <TimeRangeSelector selected="Week" onSelect={mockOnSelect} />
    );

    const selectedButton = getByText('Week');
    expect(selectedButton.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: 'white' })
      ])
    );
  });

  it('calls onSelect when a time range is pressed', () => {
    const { getByText } = render(
      <TimeRangeSelector selected="Day" onSelect={mockOnSelect} />
    );

    fireEvent.press(getByText('Month'));
    expect(mockOnSelect).toHaveBeenCalledWith('Month');
  });
});
