import React from 'react';
import MapView, { Region, MapMarker } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import CarparkMarker from './CarparkMarker';


type MapComponentProps = {
  region?: Region;
  mapRef: React.RefObject<MapView|null>;
  markerRefs: React.RefObject<(MapMarker|null)[]>;
  carparks: Carpark[];
  onMarkerPress?: (carpark: Carpark) => void;
}

export default function MapComponent({ region, mapRef, markerRefs, carparks, onMarkerPress }: MapComponentProps) {
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        region={region}
        showsUserLocation
        showsMyLocationButton
        followsUserLocation
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '60%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
