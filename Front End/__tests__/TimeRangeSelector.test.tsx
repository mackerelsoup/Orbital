import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TimeRangeSelector from '../components/TimeRangeSelector'; // adjust the path as needed

describe('TimeRangeSelector', () => {
  it('renders all time ranges', () => {
    const { getByText } = render(
      <TimeRangeSelector selected="Day" onSelect={() => {}} />
    );

    expect(getByText('4HR')).toBeTruthy();
    expect(getByText('Day')).toBeTruthy();
    expect(getByText('Week')).toBeTruthy();
    expect(getByText('Month')).toBeTruthy();
    expect(getByText('Year')).toBeTruthy();
  });

  it('calls onSelect when a range is pressed', () => {
    const onSelectMock = jest.fn();
    const { getByText } = render(
      <TimeRangeSelector selected="Day" onSelect={onSelectMock} />
    );

    fireEvent.press(getByText('Week'));
    expect(onSelectMock).toHaveBeenCalledWith('Week');
  });

  it('applies selected style correctly', () => {
    const { getByText } = render(
      <TimeRangeSelector selected="Month" onSelect={() => {}} />
    );

    const selectedText = getByText('Month');
    expect(selectedText.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: 'white' })
      ])
    );
  });
});
