import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { MapMarker, Region , PROVIDER_GOOGLE} from 'react-native-maps';
import CarparkMarker from './CarparkMarker';

type MapComponentProps = {
  region: Region | undefined;
  mapRef: React.RefObject<MapView|null>;
  markerRefs: React.RefObject<(MapMarker|null)[]>;
  carparks: Carpark[];
  onMarkerPress?: (carpark: Carpark) => void;
}

export default function MapComponent({ region, mapRef, markerRefs, carparks, onMarkerPress }: MapComponentProps) {
  return (
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        showsUserLocation
        showsMyLocationButton
        followsUserLocation
        toolbarEnabled = {false}
        provider= {PROVIDER_GOOGLE}
      >
        {carparks.map((cp) => (
          <CarparkMarker
            key={cp.id}
            ref = {(ref) => {
              if (markerRefs) {
                markerRefs.current[cp.id] = ref;
              }
            }}
            carpark={cp}
            onPress={onMarkerPress}
          />
        ))}

      </MapView>
      
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});