import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Button from '@/components/Button';
import { Region } from 'react-native-maps';
import { UserContext } from '@/context/userContext';

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

export default function CarparkItem({ carpark, onPress, origin }: Props) {
  const { user } = useContext(UserContext)!

  useEffect(() => {
    if (origin) {
      const fetchDistance = async () => {
        const dist = await getDistance(carpark, origin)
        carpark.distance = dist/1000
      }
      fetchDistance()
    }
  }, [origin]);

  return (
    <View>
      <Button label={carpark.name} onPress={() => onPress(carpark)} children={
        <>
          <Text style={{ fontSize: 15, color: "white" }}>
            {"Distance: " + (carpark.distance ? `${carpark.distance.toFixed(2)} km` : "Computing distance.. ")}
          </Text>
          <Text style={{ fontSize: 15, color: "white" }}>
            {"Can park? " + (carpark.staff? (user?.staff == carpark.staff? "Yes" : "No") : "Yes")}
          </Text>
        </>
      } />


    </View>
  );
};

