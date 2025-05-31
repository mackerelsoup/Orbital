import CarparkList from '@/components/CarparkList';
import { getLocation } from '@/components/LocationService';
import MapComponent from '@/components/MapComponent';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { MapMarker, Region } from 'react-native-maps';
import carparks from '../assets/carparks.json';


export default function App() {
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const mapRef = useRef<MapView | null>(null)
  const markerRefs = useRef<(MapMarker | null)[]>([])

  //retreiving user location data
    useEffect(() => {
    const initializeLocation = async () => {
      const locationData = await getLocation();
      
      // Immediately set last known position if available
      if (locationData?.lastKnown) {
        const { latitude, longitude } = locationData.lastKnown.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }

      // Update with current position when available
      if (locationData?.currentPromise) {
        const currentLocation = await locationData.currentPromise;
        if (currentLocation) {
          const { latitude, longitude } = currentLocation.coords;
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      }
    };

    initializeLocation();
  }, []);


  const handleCarparkSelect = (carpark: Carpark) => {
    const marker = markerRefs.current[carpark.id];
    marker?.showCallout();
    mapRef.current?.animateToRegion({
      latitude: carpark.latitude,
      longitude: carpark.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  return (
    <View style={styles.container}>
      <MapComponent
        region={region}
        mapRef={mapRef}
        carparks={carparks}
        onMarkerPress={handleCarparkSelect}
      />
      <CarparkList
        carparks={carparks}
        onItemPress={handleCarparkSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",

  },
  map: {
    width: '100%',
    height: '60%',

  },

  list: {
    flex: 1,
    backgroundColor: "blue"
  }
});
