import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CarparkInfoModal from '../components/CarparkInfoModal'; // adjust path if needed

const mockCarpark = {
  name: "Test",
  id: 7,
  type: "open",
  staff: false,
  latitude: 1.3019172248250193,
  longitude: 103.77347316228175,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
  pricing: {
    rate_per_minute: 0.1234,
    charged_hours: "Charges apply only from 0830H to 1930H (Mon–Fri) and 0830H to 1700H (Sat)"
  },
  // Note: distance is missing in your mock, add it if you want to test distance display
};

const mockOnClose = jest.fn();
const mockOnNavigate = jest.fn();

describe('CarparkInfoModal', () => {
  it('renders all carpark details correctly', () => {
    // Add distance to mockCarpark to test distance display
    const carparkWithDistance = { ...mockCarpark, distance: 2.3 };

    const { getByText } = render(
      <CarparkInfoModal
        carpark={carparkWithDistance}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    expect(getByText('Test')).toBeTruthy(); // name
    expect(getByText('2.3 km away')).toBeTruthy(); // distance
    expect(getByText('Rate: $0.1234 / min')).toBeTruthy(); // rate_per_minute
    expect(getByText(mockCarpark.pricing.charged_hours)).toBeTruthy(); // charged_hours text
  });

  it('calls onClose when Close button is pressed', () => {
    const { getByText } = render(
      <CarparkInfoModal
        carpark={mockCarpark}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    fireEvent.press(getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onNavigate when Navigate button is pressed', () => {
    const { getByText } = render(
      <CarparkInfoModal
        carpark={mockCarpark}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    fireEvent.press(getByText('Navigate'));
    expect(mockOnNavigate).toHaveBeenCalledTimes(1);
  });
});
