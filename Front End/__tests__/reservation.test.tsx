import React from 'react';
import { render } from '@testing-library/react-native';
import Reservation from '../app/reservation';

describe('Reservation Screen', () => {
  it('renders correctly', () => {
    const { getByTestId } = render(<Reservation />);
    const container = getByTestId('reservation-container');
    expect(container).toBeTruthy();
  });

  it('displays the "Coming Soon" text', () => {
    const { getByText } = render(<Reservation />);
    const comingSoonText = getByText('Coming Soon');
    expect(comingSoonText).toBeTruthy();
  });

  it('has correct styling for the container', () => {
    const { getByTestId } = render(<Reservation />);
    const container = getByTestId('reservation-container');
    
    expect(container.props.style).toEqual(
      expect.objectContaining({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      })
    );
  });
});