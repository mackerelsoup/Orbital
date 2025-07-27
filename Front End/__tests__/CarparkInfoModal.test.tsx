import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CarparkInfoModal from '../components/CarparkInfoModal';

const mockCarpark = {
  id: 1,
  name: 'Test Carpark',
  latitude: 1.23,
  longitude: 103.45,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
  available_lots: 30,
  type: 'surface',
  season_parking_type: ['A'],
  staff: false,
  distance: 1.234,
  pricing: {
    rate_per_minute: 0.0500,
    charged_hours: '8am - 6pm',
  }
};

describe('CarparkInfoModal', () => {
  it('renders modal details correctly', () => {
    const { getByText } = render(
      <CarparkInfoModal
        carpark={mockCarpark}
        onClose={jest.fn()}
        onNavigate={jest.fn()}
      />
    );

    expect(getByText('Test Carpark')).toBeTruthy();
    expect(getByText('1.2 km away')).toBeTruthy();
    expect(getByText('Rate: $0.0500 / min')).toBeTruthy();
    expect(getByText('8am - 6pm')).toBeTruthy();
    expect(getByText('Navigate')).toBeTruthy();
    expect(getByText('Close')).toBeTruthy();
  });

  it('calls onClose when Close button is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <CarparkInfoModal
        carpark={mockCarpark}
        onClose={onClose}
        onNavigate={jest.fn()}
      />
    );

    fireEvent.press(getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onNavigate when Navigate button is pressed', () => {
    const onNavigate = jest.fn();
    const { getByText } = render(
      <CarparkInfoModal
        carpark={mockCarpark}
        onClose={jest.fn()}
        onNavigate={onNavigate}
      />
    );

    fireEvent.press(getByText('Navigate'));
    expect(onNavigate).toHaveBeenCalled();
  });
});
