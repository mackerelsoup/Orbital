import React, { useState, useEffect, useRef } from 'react';
import MapView, { Region, Marker, MapMarker } from 'react-native-maps';
import { FlatList, ScrollView, StyleSheet, View, } from 'react-native';
import * as Location from 'expo-location';
import carparks from '../assets/carparks.json'
import Button from '@/components/Button';

type Carpark = {
  name: string;
  id: number;
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};


export default function App() {
  const [location, setLocation] = useState<Location.LocationObject | null>();
  const [region, setRegion] = useState<Region | undefined>(undefined);


  useEffect(() => {
    const getPermissions = async () => {
      console.log("starting")
      let status = (await Location.requestForegroundPermissionsAsync()).status
      if (status !== 'granted') {
        console.log("Permissions not granted");
      }


      const lastKnownPosition = await Location.getLastKnownPositionAsync()
      if (lastKnownPosition) {
        const { latitude, longitude } = lastKnownPosition.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        console.log("Using last known position:", latitude, longitude);
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = currentLocation.coords;
        setLocation(currentLocation);
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        console.log("Updated to current location:", latitude, longitude);
      } catch (error) {
        console.error("Failed to get current location:", error);
      }
    }
    getPermissions();
  }, [])

  const mapRef = useRef<MapView | null>(null)
  const markerRefs = useRef<(MapMarker | null)[]>([])
  const [currentMarker, setCurrentMarker] = useState<MapMarker | null>(null)
  const [carpark, setCarpark] = useState<Carpark>()

  useEffect(() => {
    currentMarker?.showCallout()
    if (carpark && carpark.latitude !== undefined && carpark.longitude !== undefined) {
      mapRef.current?.animateToRegion({
        latitude: carpark.latitude,
        longitude: carpark.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

  }, [currentMarker])

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        region={region}
        showsUserLocation
        showsMyLocationButton
        followsUserLocation={true}
      >
        {carparks.map((cp) => (
          <Marker
            key={cp.id}
            ref={(ref) => {
              if (ref)
                markerRefs.current[cp.id] = ref
            }

            }
            coordinate={{
              latitude: cp.latitude,
              longitude: cp.longitude,
            }}
            title={cp.name}

          />
        ))}
      </MapView>

      <FlatList
        data={carparks}
        renderItem={({ item }) => (
          <Button label={item.name} onPress={() => {
            setCurrentMarker(markerRefs.current[item.id])
            setCarpark(item)
          }}>

          </Button>
        )}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      >
      </FlatList>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch"
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
