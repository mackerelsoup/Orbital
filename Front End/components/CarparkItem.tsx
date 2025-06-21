import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Button from '@/components/Button';
import { UserContext } from '@/context/userContext';

type Props = {
  carpark: Carpark;
  distances: Record<number, number>
  availability?: Record<number, [number, number]> | null
  onPress: (carpark: Carpark) => void;

};



export default function CarparkItem({ carpark, distances, availability = null, onPress }: Props) {
  const { user } = useContext(UserContext)!

  //console.log(distances[carpark.id])

  return (
    <View style={{ flex: 1 }}>
      <Button label={carpark.name} onPress={() => onPress(carpark)} children={
        <>
          <Text style={{ fontSize: 15, color: "white" }}>
            {"Distance: " + (distances[carpark.id] ? `${distances[carpark.id].toFixed(2)} km` : "Computing distance.. ")}
          </Text>
          <Text style={{ fontSize: 15, color: "white" }}>
            {"Allowed to park? " + (carpark.staff ? (user?.staff == carpark.staff ? "Yes" : "No") : "Yes")}
          </Text>
          {availability?.[carpark.id] && (
            <Text style={{ fontSize: 15, color: "white" }}>
              {"Availability: " + availability[carpark.id][1] + "/" + availability[carpark.id][0]}
            </Text>
          )}

        </>
      } />


    </View>
  );
};

