jest.mock('@expo/vector-icons', () => {
  return {
    Ionicons: () => null, // or: () => <Text>Icon</Text> if you need something visible
  };
});


import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CarparkItem from '../components/CarparkItem';
import { UserContext } from '@/context/userContext';

const mockCarpark: Carpark = {
  id: 1,
  name: 'Carpark A',
  latitude: 1.1,
  longitude: 103.1,
  latitudeDelta: 0.001,
  longitudeDelta: 0.001,
  available_lots: 50,
  type: 'surface',
  season_parking_type: ['A'],
  staff: true,
};

const mockUser = {
  username: 'johndoe',
  season_parking_type: 'A',
  staff: true,
  season_parking: true,
  capped_pass: false,
  profile_uri: '',
};

describe('CarparkItem', () => {
  const mockOnPress = jest.fn();

  it('renders correctly with allowed parking and availability', () => {
    const { getByText } = render(
      <UserContext.Provider value={{ user: mockUser } as any}>
        <CarparkItem
          carpark={mockCarpark}
          distances={{ 1: 0.5 }}
          availability={{ 1: [100, 70] }}
          onPress={mockOnPress}
        />
      </UserContext.Provider>
    );

    expect(getByText('Carpark A')).toBeTruthy();
    expect(getByText('0.5km')).toBeTruthy();
    expect(getByText('✓ Allowed')).toBeTruthy();
    expect(getByText('70/100 spaces')).toBeTruthy();
  });

  it('renders Not Allowed if staff mismatch', () => {
    const nonStaffUser = { ...mockUser, staff: false };

    const { getByText } = render(
      <UserContext.Provider value={{ user: nonStaffUser } as any}>
        <CarparkItem
          carpark={mockCarpark}
          distances={{ 1: 1.1 }}
          availability={{ 1: [100, 20] }}
          onPress={mockOnPress}
        />
      </UserContext.Provider>
    );

    expect(getByText('✗ Not Allowed')).toBeTruthy();
    expect(getByText('20/100 spaces')).toBeTruthy();
  });

  it('triggers onPress when pressed', () => {
    const { getByText } = render(
      <UserContext.Provider value={{ user: mockUser } as any}>
        <CarparkItem
          carpark={mockCarpark}
          distances={{ 1: 0.3 }}
          availability={{ 1: [50, 10] }}
          onPress={mockOnPress}
        />
      </UserContext.Provider>
    );

    fireEvent.press(getByText('Carpark A'));
    expect(mockOnPress).toHaveBeenCalledWith(mockCarpark);
  });

  it('shows "Computing..." if distance missing', () => {
    const { getByText } = render(
      <UserContext.Provider value={{ user: mockUser } as any}>
        <CarparkItem
          carpark={mockCarpark}
          distances={{}} // no entry for carpark.id
          availability={{ 1: [100, 50] }}
          onPress={mockOnPress}
        />
      </UserContext.Provider>
    );

    expect(getByText('Computing...')).toBeTruthy();
  });

  it('does not crash if availability is null', () => {
    const { getByText, queryByText } = render(
      <UserContext.Provider value={{ user: mockUser } as any}>
        <CarparkItem
          carpark={mockCarpark}
          distances={{ 1: 0.9 }}
          availability={null}
          onPress={mockOnPress}
        />
      </UserContext.Provider>
    );

    expect(getByText('Carpark A')).toBeTruthy();
    expect(queryByText(/spaces/)).toBeNull();
  });
});
