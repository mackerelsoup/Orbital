import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from "react-native"
import { Marker, MapMarker } from 'react-native-maps';

// Remove the local Carpark type definition since it conflicts with the global one
// The global Carpark type should be available from your types file

type CarparkMarkerProps = {
  carpark: Carpark;
  onPress?: (carpark: Carpark) => void;
  size?: number
}

//forwarding ref
const CarparkMarker = forwardRef<MapMarker, CarparkMarkerProps>(
  //order is defined by ForwardRefRenderFunction
  ({ carpark, onPress, size = 20 }, ref) => {
    const getMarkerColor = () => {
      if (carpark.staff) return "#FF0000" // staff parking
      return "#007AFF" // if not, public parking
    }

    const getMarkerIcon = () => {
      if (carpark.staff) return "S" // staff parking
      return "P" // if not, public parking
    }

    return (
      <Marker
        ref={ref}
        coordinate={{
          latitude: carpark.latitude,
          longitude: carpark.longitude,
        }}
        title={carpark.name}
        description={`Rate: $${carpark.pricing?.rate_per_minute?.toFixed(4)}/min`}
        onPress={() => onPress?.(carpark)}
        anchor={{ x: 0.5, y: 1 }}
      >
        <View
          style={[
            styles.marker,
            {
              backgroundColor: getMarkerColor(),
              width: size,
              height: size,
            },
          ]}
        >
          <Text style={[styles.markerText, { fontSize: Math.max(8, size / 3) }]}>{getMarkerIcon()}</Text>
        </View>
      </Marker>
    )
  }
);

const styles = StyleSheet.create({
  marker: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    elevation: 5,
  },
  markerText: {
    color: "white",
    fontWeight: "bold",
  },
})

export default CarparkMarker;