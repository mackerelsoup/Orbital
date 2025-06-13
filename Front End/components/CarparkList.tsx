import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import Button from '@/components/Button';
import { Region } from 'react-native-maps';
import CarparkItem from './CarparkItem';
import { UserContext } from '@/context/userContext';
import BottomSheet from './BottomSheet';
import { ActionSheetRef } from 'react-native-actions-sheet';

type CarparkListProps = {
  carparks: Carpark[];
  onItemPress: (carpark: Carpark) => void;
  origin: Region
}




const CarparkList = ({ carparks, onItemPress, origin }: CarparkListProps) => {
  const [sortOption, setSortOption] = useState<string>('')
  const [filterOption, setFilterOption] = useState<string>('Filter Options')
  const { user } = useContext(UserContext)!
  const [carparkDistances, setCarparkDistances] = useState<Record<number, number>>({})
  const sheetRef = useRef<ActionSheetRef>(null)

  useEffect(() => {
    // Only run if origin exists
    if (!origin) return;

    const getDistances = async (carparks: Carpark[], origin: Region) => {
      try {
        // Use Promise.all to wait for all requests
        const distances = await Promise.all(
          carparks.map(async (carpark) => {
            try {
              const response = await fetch("http://192.168.68.55:3000/computeDistance", {
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
              return { id: carpark.id, distance: data.distance };
              //inner catch
            } catch (error) {
              console.error(error);
              return { id: carpark.id, distance: null };
            }
          })
        );

        const tempCarparkDistances: Record<number, number> = {};
        distances.forEach((distance) => {
          tempCarparkDistances[distance.id] = distance.distance / 1000
        })

        setCarparkDistances(tempCarparkDistances);
        //outer catch
      } catch (error) {
        console.error("Error fetching distances:", error);
      }
    };

    getDistances(carparks, origin);
  }, [carparks, origin]); // Add origin to dependencies

  const filteredCarparkList = useMemo(() => {
    const carparkCopy = [...carparks]
    //console.log(carparkCopy)
    switch (filterOption) {
      case 'Filter Options': {
        return carparkCopy
      }
      case 'season_parking': {
        //implement season parking property, -> this button is availble only is user is a season pass holder
        return carparkCopy.filter((carpark) => {
          return carpark.season_parking_type == user.season_parking_type
        })
      }
      case 'can_park': {
        console.log("filtered can park")
        return carparkCopy.filter((carpark) => {
          return carpark.staff ? (carpark.staff == user.staff) : true
        })
      }
    }
  }, [carparks, filterOption])

  const sortedCarparkList = useMemo(() => {
    console.log("ran sorted")
    switch (sortOption) {
      //by default it will sort by distance
      case '': {
        return filteredCarparkList?.sort((a, b) => (carparkDistances[a.id] - (carparkDistances[b.id])))
      }
      case 'distance': {
        return filteredCarparkList?.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
      }
      case 'availibility': {
        //kiv for now
      }

    }
  }, [filteredCarparkList, filterOption, carparkDistances])

  function handleFilterOption(filterOption: string) {
    setFilterOption(filterOption)
   }

  const listHeaderComponent = () => {
    return (
      <View style={{ justifyContent: 'flex-start', backgroundColor: 'grey' }}>
        <Button label={filterOption} onPress={() => sheetRef.current?.show()} />
      </View>)

  }

  return (
    <View style = {{flex: 1}}>
      <FlatList
        data={sortedCarparkList}
        //renaming item into carpark
        renderItem={({ item: carpark }) => (
          <View>
            <CarparkItem
              carpark={carpark}
              distances={carparkDistances}
              onPress={onItemPress}
              origin={origin}
            >
            </CarparkItem>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.content}
        ListHeaderComponent={listHeaderComponent}
      />
      <BottomSheet ref= {sheetRef} onSelect={handleFilterOption}></BottomSheet>
    </View>
      
  )

};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    //backgroundColor: 'white',
  },
  content: {
    paddingTop: 10,
  }
});

export default CarparkList;