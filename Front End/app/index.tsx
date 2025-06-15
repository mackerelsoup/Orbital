import CarparkList from '@/components/CarparkList';
import { getLocation } from '@/components/LocationService';
import MapComponent from '@/components/MapComponent';
import { UserContext } from '@/context/userContext';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { Link } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { MapMarker, Region } from 'react-native-maps';
import Modal from 'react-native-modal';
import carparks from '../assets/carparks.json';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const mapRef = useRef<MapView | null>(null);
  const markerRefs = useRef<(MapMarker | null)[]>([]);
  const [carparkCopy, setCarparkCopy] = useState<Carpark[]>(carparks)
  const [coordinateSelected, setCoords] = useState<Region | null>(null);
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { user } = useContext(UserContext)!


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
    setSelectedCarpark(carpark);
    setModalVisible(true);
  };

  const handleFilteredCarpark = (filteredCarparks: Carpark[]) => {
    setCarparkCopy(filteredCarparks)
  }


  return (
    <GestureHandlerRootView style={styles.container}>

      <View style={styles.mapContainer}>
        <MapComponent
          region={region}
          mapRef={mapRef}
          markerRefs={markerRefs}
          carparks={carparkCopy}>
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

      {/* Modal Popup */}
      <Modal isVisible={modalVisible} onBackdropPress={() => setModalVisible(false)}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{selectedCarpark?.name}</Text>
          {selectedCarpark?.pricing?.rate_per_minute && (
            <Text>Rate: ${selectedCarpark.pricing.rate_per_minute.toFixed(4)} / min</Text>
          )}
          {selectedCarpark?.pricing?.charged_hours && (
            <Text style={{ fontStyle: 'italic', marginTop: 5 }}>{selectedCarpark.pricing?.charged_hours}</Text>
          )}
          <Text style={{ color: 'blue', marginTop: 12 }} onPress={() => setModalVisible(false)}>Close</Text>
        </View>
      </Modal>

      <CarparkList
        carparks={carparks}
        onItemPress={handleCarparkSelect}
        onFilteredCarparkChange={handleFilteredCarpark}
        origin={region!}
      />
    </GestureHandlerRootView>
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

