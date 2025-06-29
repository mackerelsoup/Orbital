import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SeasonParkingApplicationForm from '../app/seasonForm';
import { Alert } from 'react-native';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

describe('SeasonParkingApplicationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form sections correctly', () => {
    const { getByText } = render(<SeasonParkingApplicationForm />);
    
    expect(getByText('Season Parking Application')).toBeTruthy();
    expect(getByText('Personal Information')).toBeTruthy();
    expect(getByText('Academic Information')).toBeTruthy();
    expect(getByText('Vehicle Information')).toBeTruthy();
    expect(getByText('Parking Type Selection')).toBeTruthy();
  });

  it('shows validation alerts when required fields are missing', async () => {
    const { getByText } = render(<SeasonParkingApplicationForm />);
    const alertSpy = jest.spyOn(Alert, 'alert');
    
    fireEvent.press(getByText('Submit Application'));
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });
  });

  it('allows form submission when all fields are filled', async () => {
    const { 
      getByText, 
      getByPlaceholderText, 
      getAllByText 
    } = render(<SeasonParkingApplicationForm />);
    
    // Fill personal information
    fireEvent.changeText(getByPlaceholderText('Mr./Ms./Mrs./Mdm./Dr.'), 'Mr.');
    fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'John Doe');
    fireEvent.changeText(getByPlaceholderText('Enter your address'), '123 Test St');
    fireEvent.changeText(getByPlaceholderText('your.email@example.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText(''), '12345678');

    // Fill academic information
    fireEvent.changeText(getByPlaceholderText('A0XXXXXXX'), 'A0123456X');
    fireEvent.changeText(getByPlaceholderText('e.g., School of Computing'), 'School of Computing');

    // Fill vehicle information
    fireEvent.changeText(getByPlaceholderText('SXX1234X'), 'SXX1234X');
    fireEvent.changeText(getByPlaceholderText('XXXXXXXXXX'), '1234567890');
    fireEvent.changeText(getByPlaceholderText("Vehicle owner's full name"), 'John Doe');
    fireEvent.press(getAllByText('< 1.4 L')[0]);
    fireEvent.press(getByText('Unsheltered'));

    await act(async () => {
      fireEvent.press(getByText('Submit Application'));
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://back-end-o2lr.onrender.com/applySeasonParking',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );
    });
  });

  it('handles network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    const alertSpy = jest.spyOn(Alert, 'alert');
    
    const { getByText, getByPlaceholderText } = render(<SeasonParkingApplicationForm />);
    
    // Fill minimum required fields
    fireEvent.changeText(getByPlaceholderText('Mr./Ms./Mrs./Mdm./Dr.'), 'Mr.');
    fireEvent.changeText(getByPlaceholderText('Enter your full name'), 'John Doe');
    // ... fill other required fields

    await act(async () => {
      fireEvent.press(getByText('Submit Application'));
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Network error', 'Unable to connect to server');
    });
  });

  it('shows success modal after successful submission', async () => {
    const { getByText, queryByText, getByPlaceholderText } = render(<SeasonParkingApplicationForm />);
    
    // Fill required fields
    fireEvent.changeText(getByPlaceholderText('Mr./Ms./Mrs./Mdm./Dr.'), 'Mr.');
    // ... fill other required fields

    await act(async () => {
      fireEvent.press(getByText('Submit Application'));
    });

    expect(queryByText('Application Successful!')).toBeTruthy();
  });
});