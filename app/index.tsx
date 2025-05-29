import React, {useState, useEffect} from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, View, } from 'react-native';
import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const getPermissions = async () => {
    }
  }, [])

  return (
    <View style={styles.container}>
      <MapView 
      style={styles.map} 
      //followsUserLocation = {true}
      showsUserLocation
      showsMyLocationButton />
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
