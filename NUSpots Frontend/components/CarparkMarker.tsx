import React, { forwardRef } from 'react';
import { Marker, MapMarker } from 'react-native-maps';

type CarparkMarkerProps = {
  carpark: Carpark;
  onPress?: (carpark: Carpark) => void;
}

//forwarding ref
const CarparkMarker = forwardRef<MapMarker, CarparkMarkerProps>(
  //order is defined by ForwardRefRenderFunction
  ({ carpark, onPress }, ref) => (
    <Marker
      ref={ref}
      coordinate={{
        latitude: carpark.latitude,
        longitude: carpark.longitude,
      }}
      title={carpark.name}
      onPress={() => onPress?.(carpark)}
    />
  )
);

export default CarparkMarker;