import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View, Text, Pressable } from 'react-native';
import Button from '@/components/Button';
import { Region } from 'react-native-maps';
import CarparkItem from './CarparkItem';
import { UserContext } from '@/context/userContext';
import BottomSheet from './BottomSheet';
import { ActionSheetRef } from 'react-native-actions-sheet';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type CarparkListProps = {
  carparks: Carpark[];
  onItemPress: (carpark: Carpark) => void;
  origin: Region
}


const CarparkList = ({ carparks, onItemPress, origin }: CarparkListProps) => {
  const [sortOption, setSortOption] = useState<string>('Sort')
  const [filterOption, setFilterOption] = useState<string>('')
  const { user } = useContext(UserContext)!
  const [carparkDistances, setCarparkDistances] = useState<Record<number, number>>({})
  const [carparkAvailibility, setCarparkAvailibility] = useState<Record<number, [number, number]>>({})

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
              const response = await fetch("http://192.168.10.227:3000/computeDistance", {
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

  useEffect(() => {
    const getAvailibility = async (carparks: Carpark[]) => {
      try {
        const availibilities = await Promise.all(
          carparks.map(async (carpark) => {
            try {
              const response = await fetch(`http://192.168.10.227:3000/fetchCarparkData/${carpark.id}`)

              if (!response.ok) throw new Error("Failed to fetch");
              const data = await response.json()
              //console.log(data)
              return data
            } catch (error) {
              console.log(error)
              return `Carpark : ${carpark.id}`
            }
          })
        )
        const tempCarparkAvailibility: Record<number, [number, number]> = {};
        availibilities.forEach((availibility) => {
          tempCarparkAvailibility[availibility[0].id] = [availibility[0].capacity, availibility[0].measure]
        })
        setCarparkAvailibility(tempCarparkAvailibility)
        //console.log(carparkAvailibility)
      } catch (error) {
        console.error("Error fetching availibility", error)
      }

    }
    getAvailibility(carparks)
  }, [carparks])

  const filteredCarparkList = useMemo(() => {
    const carparkCopy = [...carparks]
    //console.log(carparkCopy)
    switch (filterOption) {
      case '': {
        return carparkCopy
      }
      case 'season_parking': {
        //implement season parking property, -> this button is availble only is user is a season pass holder
        return carparkCopy.filter((carpark) => {
          return carpark.season_parking_type == user.season_parking_type
        })
      }
      case 'can_park': {
        //console.log("filtered can park")
        return carparkCopy.filter((carpark) => {
          return carpark.staff ? (carpark.staff == user.staff) : true
        })
      }
    }
  }, [carparks, filterOption])

  const sortedCarparkList = useMemo(() => {
    //console.log(filteredCarparkList)
    console.log("ran sorted")
    switch (sortOption) {
      //by default it will sort by distance
      case 'Sort': {
        return filteredCarparkList?.sort((a, b) => (carparkDistances[a.id] - (carparkDistances[b.id])))
      }
      case 'distance': {
        return filteredCarparkList?.sort((a, b) => (carparkDistances[a.id] - (carparkDistances[b.id])))
      }
      case 'availibility': {
        return filteredCarparkList?.sort((a, b) => (carparkAvailibility[a.id][0] - carparkAvailibility[a.id][1] ) - (carparkAvailibility[b.id][0] - carparkAvailibility[b.id][1]))
      }

    }
  }, [filteredCarparkList, filterOption, sortOption, carparkDistances, carparkAvailibility])

  function handleSortOption(sortOption: string) {
    setSortOption(sortOption)
    setTimeout(() => {
      sheetRef.current?.hide();
    }, 50); // Small delay before closing
  }

  const listHeaderComponent = useMemo(() => {
    return (
      <View style= {{flexDirection: 'column', alignItems: 'flex-start'}}>
        <Pressable
        onPress={() => sheetRef.current?.show()}
        style= {{flexDirection: 'row', alignItems: 'baseline'}}
        >
          <FontAwesome name="sort" size={16} color="black" style = {{left: 10}} />
          <Text style = {{color: 'black', fontSize: 15, left: 16}}>{sortOption}</Text>
        </Pressable>
      </View>)
  }, [sortOption])


  return (
    <View style={{ flex: 1 }}>
      <View style= {{flexDirection: 'row'}}>
        <Pressable
        onPress={() => setFilterOption('season_parking')}>
          <Text 
          style= {{backgroundColor: filterOption === 'season_parking'? '#90ee90' : 'white', padding: 10, borderRadius: 20, marginHorizontal: 5, marginTop: 5}}>
            Season Parking</Text>
        </Pressable>
        <Pressable
        onPress={() => setFilterOption('can_park')}
        >
          <Text
          style= {{backgroundColor: filterOption === 'can_park' ? '#90ee90' : 'white', padding: 10, borderRadius: 20, marginHorizontal: 5, marginTop: 5}}>
            Allowed Parking</Text>
        </Pressable>
      </View>
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
        ListHeaderComponentStyle= {{}}
      />
      <BottomSheet ref={sheetRef} onSelect={handleSortOption}></BottomSheet>
    </View>)
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingTop: 10,
  }
});

export default CarparkList;