import CarparkList from '@/components/CarparkList';
import { getLocation } from '@/components/LocationService';
import MapComponent from '@/components/MapComponent';
import { Portal } from 'react-native-portalize'
import { Link, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Linking, Dimensions, Platform } from 'react-native';
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
  const { carparkId, triggerClick } = useLocalSearchParams();

  // allows for car park modal to pop up when clicked from pricing file
  useEffect(() => {
    if (carparkId && triggerClick === 'true') {
      const id = parseInt(carparkId.toString(), 10);
      const target = carparks.find(cp => cp.id === id);
      if (target) {
        handleCarparkSelect(target);
      }
    }
  }, [carparkId, triggerClick]);

  // retreiving user location data
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
    setCoords({
      latitude: carpark.latitude,
      longitude: carpark.longitude,
      longitudeDelta: 0.01,
      latitudeDelta: 0.01
    });
    marker?.showCallout();
    mapRef.current?.animateToRegion({
      latitude: carpark.latitude,
      longitude: carpark.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
    setSelectedCarpark(carpark);
    setModalVisible(true);
  };

  // Added this function to handle marker press from MapComponent 
  const handleMarkerPress = (carpark: Carpark) => {
    setSelectedCarpark(carpark);
    setModalVisible(true);
    setCoords({
      latitude: carpark.latitude,
      longitude: carpark.longitude,
      longitudeDelta: 0.01,
      latitudeDelta: 0.01
    });
  };

  const handleFilteredCarpark = (filteredCarparks: Carpark[]) => {
    setCarparkCopy(filteredCarparks)
  }

  // Function to handle navigation
  const handleNavigate = () => {
    if (selectedCarpark) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedCarpark.latitude},${selectedCarpark.longitude}`;
      Linking.openURL(url);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapComponent
          region={region}
          mapRef={mapRef}
          markerRefs={markerRefs}
          carparks={carparkCopy}
          onMarkerPress={handleMarkerPress}>
        </MapComponent>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: '#007AFF' }]}>
              <Text style={styles.legendIconText}>P</Text>
            </View>
            <Text style={styles.legendText}>Public</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIcon, { backgroundColor: '#FF0000' }]}>
              <Text style={styles.legendIconText}>S</Text>
            </View>
            <Text style={styles.legendText}>Staff</Text>
          </View>
        </View>

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
      {selectedCarpark && modalVisible &&
        <Portal>
          <Modal
            isVisible={modalVisible}
            onBackdropPress={() => setModalVisible(false)} onBackButtonPress={() => { setModalVisible(false) }}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedCarpark?.name}</Text>

              {selectedCarpark?.distance && (
                <Text style={styles.modalDistance}>{selectedCarpark.distance.toFixed(1)} km away</Text>
              )}

              {selectedCarpark?.pricing?.rate_per_minute && (
                <Text style={styles.modalPrice}>Rate: ${selectedCarpark.pricing.rate_per_minute.toFixed(4)} / min</Text>
              )}

              {selectedCarpark?.pricing?.charged_hours && (
                <Text style={styles.modalHours}>{selectedCarpark.pricing?.charged_hours}</Text>
              )}

              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.navigateButton}
                  onPress={handleNavigate}
                >
                  <Text style={styles.navigateButtonText}>Navigate</Text>
                </Pressable>

                <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

        </Portal>

      }


      <CarparkList
        carparks={carparks}
        onItemPress={handleCarparkSelect}
        onFilteredCarparkChange={handleFilteredCarpark}
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
    justifyContent: "flex-end",
    position: 'relative',
  },
  navigationPopupContainer: {
    width: 150,
    height: 40,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 20,
  },
  legendContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    alignItems: 'center',
    width: 100,
    height: 82,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
    width: '100%',
  },
  legendIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    position: 'relative',
  },
  legendIconText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'absolute',
    width: 24,
    height: 24,
    lineHeight: 24,
    includeFontPadding: false,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  modalDistance: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
    marginBottom: 4,
  },
  modalHours: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  navigateButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  navigateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  }
})
