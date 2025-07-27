jest.mock('../components/CarparkItem', () => {
  return function MockCarparkItem({ carpark }: any) {
    return `Carpark: ${carpark.name}`;
  };
});

jest.mock('../components/BottomSheet', () => {
  return function MockBottomSheet() {
    return 'BottomSheetMock';
  };
});


import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CarparkList from '../components/CarparkList';
import { UserContext } from '@/context/userContext';
import type { UserContextType } from '@/context/userContext'; // adjust path if needed

// Sample data
const mockCarparks: Carpark[] = [
  {
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
  },
  {
    id: 2,
    name: 'Carpark B',
    latitude: 1.2,
    longitude: 103.2,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
    available_lots: 20,
    type: 'basement',
    season_parking_type: ['B'],
    staff: false,
  },
];


const mockUserContextValue: UserContextType = {
  user: {
    username: 'johndoe',
    season_parking_type: 'A',
    staff: true,
    season_parking: true,
    capped_pass: false,
    profile_uri: '',
  },
  logout: jest.fn(),
  setUser: jest.fn(),
  loggedIn: true,
  setLoggedIn: jest.fn(),
  userType: 'Student',
  setUserType: jest.fn(),
};

const mockOrigin = {
  latitude: 1.3,
  longitude: 103.3,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

describe('CarparkList', () => {
  it('renders carparks correctly', async () => {
    const mockCallback = jest.fn();
    const { getByText } = render(
      <UserContext.Provider value={mockUserContextValue}>
        <CarparkList
          carparks={mockCarparks}
          onItemPress={() => { }}
          onFilteredCarparkChange={mockCallback}
          origin={mockOrigin}
        />
      </UserContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Carpark: Carpark A')).toBeTruthy();
      expect(getByText('Carpark: Carpark B')).toBeTruthy();
    });
  });

});
