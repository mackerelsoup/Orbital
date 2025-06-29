import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import RootLayout from '../app/_layout'; // Update the import path
import { UserProvider } from '@/context/userContext';
import { UserContext } from '@/context/userContext';

// Mock all necessary components and libraries
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    replace: jest.fn(),
  },
  Link: jest.fn(({ children }) => children),
}));

jest.mock('@expo/vector-icons', () => ({
  FontAwesome: 'FontAwesome',
  Feather: 'Feather',
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  Pressable: 'Pressable',
}));

jest.mock('react-native-portalize', () => ({
  Host: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@gorhom/bottom-sheet', () => ({
  BottomSheetModalProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-router/drawer', () => ({
  Drawer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drawer">{children}</div>
  ),
  DrawerScreen: ({ children }: { children: React.ReactNode }) => children,
}));

describe('RootLayout', () => {
  const mockUser = {
    username: 'testuser',
    staff: false,
    season_parking: true,
    season_parking_type: 'Covered',
  };

  const TestWrapper = ({ user = mockUser, loggedIn = true }: { user?: any, loggedIn?: boolean }) => {
    const [mockUserState, setMockUser] = React.useState(user);
    const [mockLoggedIn, setMockLoggedIn] = React.useState(loggedIn);
    
    const logout = () => {
      setMockUser({
        staff: false,
        season_parking: false,
        season_parking_type: 'nil'
      });
      setMockLoggedIn(false);
    };

    return (
      <UserContext.Provider value={{
        user: mockUserState,
        setUser: setMockUser,
        loggedIn: mockLoggedIn,
        setLoggedIn: setMockLoggedIn,
        logout
      }}>
        <RootLayout />
      </UserContext.Provider>
    );
  };

  it('renders without crashing', () => {
    render(<TestWrapper />);
    expect(screen.getByTestId('drawer')).toBeTruthy();
  });

  it('displays all main drawer items', () => {
    render(<TestWrapper />);
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Pricing Information')).toBeTruthy();
    expect(screen.getByText('Fee Calculator')).toBeTruthy();
    expect(screen.getByText('Digital Permits')).toBeTruthy();
    expect(screen.getByText('Parking Trends')).toBeTruthy();
  });

  it('shows profile icon when logged in', () => {
    render(<TestWrapper loggedIn={true} />);
    expect(screen.getByTestId('profile-icon')).toBeTruthy();
  });

  it('shows login icon when not logged in', () => {
    render(<TestWrapper loggedIn={false} />);
    expect(screen.getByTestId('login-icon')).toBeTruthy();
  });

  it('navigates to profile when profile icon is pressed (logged in)', () => {
    const mockRouterReplace = jest.fn();
    require('expo-router').router.replace = mockRouterReplace;
    
    render(<TestWrapper loggedIn={true} />);
    fireEvent.press(screen.getByTestId('profile-icon'));
    expect(mockRouterReplace).toHaveBeenCalledWith('/profile');
  });

  it('navigates to login when user icon is pressed (not logged in)', () => {
    const mockRouterReplace = jest.fn();
    require('expo-router').router.replace = mockRouterReplace;
    
    render(<TestWrapper loggedIn={false} />);
    fireEvent.press(screen.getByTestId('login-icon'));
    expect(mockRouterReplace).toHaveBeenCalledWith('/login');
  });

  it('does not show hidden screens in drawer', () => {
    render(<TestWrapper />);
    expect(screen.queryByText('Login')).toBeNull();
    expect(screen.queryByText('Profile')).toBeNull();
    expect(screen.queryByText('Season Parking')).toBeNull();
  });
});