import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SeasonParkingApplicationForm from '../app/seasonForm'; // adjust path
import { Alert } from 'react-native';

// Mock router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('SeasonParkingApplicationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form correctly', () => {
    const { getByText } = render(<SeasonParkingApplicationForm />);
    expect(getByText('Season Parking Application')).toBeTruthy();
    expect(getByText('Personal Information')).toBeTruthy();
    expect(getByText('Academic Information')).toBeTruthy();
    expect(getByText('Vehicle Information')).toBeTruthy();
    expect(getByText('Parking Type Selection')).toBeTruthy();
  });

  it('shows alert if required fields are missing on submit', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<SeasonParkingApplicationForm />);
    
    fireEvent.press(getByText(/submit application/i));
    
    expect(alertSpy).toHaveBeenCalled();
    expect(alertSpy.mock.calls[0][0]).toBe('Missing Information');
    alertSpy.mockRestore();
  });

  it('shows alert if engine capacity or parking type not selected', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText, getByPlaceholderText } = render(<SeasonParkingApplicationForm />);
    
    // Fill all required text inputs except engineCapacity and parkingType
    fireEvent.changeText(getByPlaceholderText('Mr./Ms./Mrs./Mdm./Dr.'), 'Mr.');
    fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Enter your address'), '123 Street');
    fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText(''), '98765432'); // Tel No
    fireEvent.changeText(getByPlaceholderText('A0XXXXXXX'), 'A0123456');
    fireEvent.changeText(getByPlaceholderText('e.g., School of Computing'), 'Computing');
    fireEvent.changeText(getByPlaceholderText('SXX1234X'), 'S1234567A');
    fireEvent.changeText(getByPlaceholderText('XXXXXXXXXX'), '1234567890');
    fireEvent.changeText(getByPlaceholderText("Vehicle owner's full name"), 'John Doe');
    
    fireEvent.press(getByText(/submit application/i));
    expect(alertSpy).toHaveBeenCalledWith('Missing Information', 'Select vehicle engine capacity');
    
    alertSpy.mockClear();
    
    // Select engine capacity only
    fireEvent.press(getByText('< 1.4 L'));
    fireEvent.press(getByText(/submit application/i));
    expect(alertSpy).toHaveBeenCalledWith('Missing Information', 'Select parking type');
    
    alertSpy.mockRestore();
  });

  it('submits the form and shows success modal', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ success: true }),
    });

    const { getByText, getByPlaceholderText, queryByText } = render(<SeasonParkingApplicationForm />);

    // Fill all required fields and select engine capacity and parking type
    fireEvent.changeText(getByPlaceholderText('Mr./Ms./Mrs./Mdm./Dr.'), 'Mr.');
    fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Enter your address'), '123 Street');
    fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText(''), '98765432'); // Tel No
    fireEvent.changeText(getByPlaceholderText('A0XXXXXXX'), 'A0123456');
    fireEvent.changeText(getByPlaceholderText('e.g., School of Computing'), 'Computing');
    fireEvent.changeText(getByPlaceholderText('SXX1234X'), 'S1234567A');
    fireEvent.changeText(getByPlaceholderText('XXXXXXXXXX'), '1234567890');
    fireEvent.changeText(getByPlaceholderText("Vehicle owner's full name"), 'John Doe');

    fireEvent.press(getByText('< 1.4 L'));
    fireEvent.press(getByText('Unsheltered'));

    fireEvent.press(getByText(/submit application/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://back-end-o2lr.onrender.com/applySeasonParking',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    expect(getByText('Application Successful!')).toBeTruthy();
    expect(getByText(/your season parking application has been submitted successfully/i)).toBeTruthy();

    // Optionally test that modal disappears and navigation happens after timeout
  });

  it('shows network error alert on fetch failure', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { getByText, getByPlaceholderText } = render(<SeasonParkingApplicationForm />);

    // Fill required fields minimally
    fireEvent.changeText(getByPlaceholderText('Mr./Ms./Mrs./Mdm./Dr.'), 'Mr.');
    fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Enter your address'), '123 Street');
    fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText(''), '98765432'); // Tel No
    fireEvent.changeText(getByPlaceholderText('A0XXXXXXX'), 'A0123456');
    fireEvent.changeText(getByPlaceholderText('e.g., School of Computing'), 'Computing');
    fireEvent.changeText(getByPlaceholderText('SXX1234X'), 'S1234567A');
    fireEvent.changeText(getByPlaceholderText('XXXXXXXXXX'), '1234567890');
    fireEvent.changeText(getByPlaceholderText("Vehicle owner's full name"), 'John Doe');

    fireEvent.press(getByText('< 1.4 L'));
    fireEvent.press(getByText('Unsheltered'));

    fireEvent.press(getByText(/submit application/i));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Network error', 'Unable to connect to server');
    });

    alertSpy.mockRestore();
  });
});
