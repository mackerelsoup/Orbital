import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Button from '@/components/Button';
import { Region } from 'react-native-maps';
import { UserContext } from '@/context/userContext';

type Props = {
  carpark: Carpark;
  distances: Record<number, number> 
  onPress: (carpark: Carpark) => void;
  origin?: Region;
};



export default function CarparkItem({ carpark, distances, onPress, origin }: Props) {
  const { user } = useContext(UserContext)!

  //console.log(distances[carpark.id])

  return (
    <View>
      <Button label={carpark.name} onPress={() => onPress(carpark)} children={
        <>
          <Text style={{ fontSize: 15, color: "white" }}>
            {"Distance: " + (distances[carpark.id]? `${distances[carpark.id].toFixed(2)} km` : "Computing distance.. ")}
          </Text>
          <Text style={{ fontSize: 15, color: "white" }}>
            {"Can park? " + (carpark.staff? (user?.staff == carpark.staff? "Yes" : "No") : "Yes")}
          </Text>
        </>
      } />


    </View>
  );
};

