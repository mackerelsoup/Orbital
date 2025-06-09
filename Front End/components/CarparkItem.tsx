import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Button from '@/components/Button';
import { Region } from 'react-native-maps';

type Props = {
  carpark: Carpark;
  onPress: (carpark: Carpark) => void;
  origin?: Region;
};

const getDistance = async (carpark: Carpark, origin: Region) => {
  try {
    let response = await fetch("http://10.130.2.118:3000/computeDistance", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        origin: {
          latitude: origin.latitude,
          longitude: origin.longitude
        },
        destination: {
          latitude: carpark.latitude,
          longitude: carpark.longitude
        }
      })
    });

    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();
    return data.distance;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const CarparkItem = ({ carpark, onPress, origin }: Props) => {
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (origin) {
      const fetchDistance = async () => {
        const dist = await getDistance(carpark, origin)
        setDistance(dist/1000)
      }
      fetchDistance()
    }
  }, [origin]);

  return (
    <View>
      <Button label={carpark.name} onPress={() => onPress(carpark)} children={
        <Text style={{ fontSize: 15, color: "white" }}>
          {"Distance:" + (distance !== null ? `${distance.toFixed(2)} km` : "Computing distance.. ")}
        </Text>} />

    </View>
  );
};

export default CarparkItem;
