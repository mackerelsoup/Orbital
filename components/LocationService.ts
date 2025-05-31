import * as Location from 'expo-location';

export const getLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log("Permissions not granted");
    return null;
  }

  try {
    // Immediately return last known position
    const lastKnown = await Location.getLastKnownPositionAsync();
    
    // Start getting current position in background
    const currentPromise = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    }).catch(error => {
      console.error("Current location error:", error);
      return null;
    });

    return {
      lastKnown,
      currentPromise // Return the promise for current location
    };
  } catch (error) {
    console.error("Location error:", error);
    return null;
  }
};