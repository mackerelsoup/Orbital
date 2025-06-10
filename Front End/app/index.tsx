import CarparkList from '@/components/CarparkList';
import { getLocation } from '@/components/LocationService';
import MapComponent from '@/components/MapComponent';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Pressable, InteractionManager, } from 'react-native';
import MapView, { MapMarker, Region } from 'react-native-maps';
import carparks from '../assets/carparks.json';
import { Link } from 'expo-router';
import { UserContext } from '@/context/userContext';


export default function App() {
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const mapRef = useRef<MapView | null>(null)
  const markerRefs = useRef<(MapMarker | null)[]>([])
  const [coordinateSelected, setCoords] = useState<Region | null>(null)
  const {user} = useContext(UserContext)!


  //retreiving user location data
  useEffect(() => {
    const initializeLocation = async () => {
      const locationData = await getLocation();

      // Immediately set last known position if available
      if (locationData?.lastKnown) {
        console.log("last")
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
        console.log("current")
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
    //console.log(marker)
    setCoords({ latitude: carpark.latitude, longitude: carpark.longitude, longitudeDelta: 0.01, latitudeDelta: 0.01 });
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

      <View style={styles.mapContainer}>
        <MapComponent
          region={region}
          mapRef={mapRef}
          markerRefs={markerRefs}
          carparks={carparks}>
        </MapComponent>
        {coordinateSelected &&
          <View style={styles.navigationPopupContainer}>
            <Link
              href={`https://www.google.com/maps/dir/?api=1&destination=${coordinateSelected.latitude},${coordinateSelected.longitude}`}
              asChild
            >
              <Pressable style={{ marginBottom: 2 }}>
                <Text style={{ color: 'white', fontSize: 15 }}>Open Google Maps</Text>
              </Pressable>
            </Link>
          </View>}

      </View>

      <CarparkList
        carparks={carparks}
        onItemPress={handleCarparkSelect}
        origin={region!}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  mapContainer: {
    height: "60%",
    alignItems: "center",
    justifyContent: "flex-end"
  },
  navigationPopupContainer: {
    width: 150,
    height: 40,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 20
  }

})

