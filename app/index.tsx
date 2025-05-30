import React, { useState, useEffect } from 'react';
import MapView, { Region, Marker } from 'react-native-maps';
import { StyleSheet, View, } from 'react-native';
import * as Location from 'expo-location';
import carparks from '../assets/carparks.json'


export default function App() {
  const [location, setLocation] = useState<Location.LocationObject>();
  const [region, setRegion] = useState<Region|undefined>(undefined);


  useEffect(() => {
    const getPermissions = async () => {
      console.log("test")
      let status = (await Location.requestForegroundPermissionsAsync()).status
      if (status !== 'granted') {
        console.log("gg go next");
      }

      let currentLocation = await Location.getCurrentPositionAsync()
      setLocation(currentLocation);
      console.log("Location:", currentLocation)

      const {
            coords: { latitude, longitude }
          } = location!;

      setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          })
      //watch the location -> even though function is only called once on mount, this persists
      /*
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          distanceInterval: 10
        },
        (newLocation) => {
          setLocation(newLocation)
          
          
          const {
            coords: { latitude, longitude }
          } = newLocation!;

          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          })

          console.log("inside")
          console.log("Updated Location:", newLocation);
        },


      )
       causing some errors, maybe do pull to refresh instead */


      
    }
    getPermissions();
  }, [])


  

  return (
    <View style={styles.container}>
  <MapView 
    style={styles.map}
    region={region}
    showsUserLocation
    showsMyLocationButton
    
  >
    {carparks.map((cp, index) => (
      <Marker
        key={index}
        coordinate={{
          latitude: cp.latitude,
          longitude: cp.longitude,
        }}
        title={cp.name}
      />
    ))}
  </MapView>
</View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',

  },
});
