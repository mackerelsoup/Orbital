import React, {useMemo, useState} from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import Button from '@/components/Button';
import { Region } from 'react-native-maps';
import CarparkItem from './CarparkItem';

type CarparkListProps = {
  carparks: Carpark[];
  onItemPress: (carpark: Carpark) => void;
  origin: Region
}


const CarparkList = ({ carparks, onItemPress, origin }: CarparkListProps) => {
  const [sortOption, setSortOption] = useState<String>('')
  const [filterOption, setFilterOption] = useState<String>('')


  const filteredCarparkList = useMemo(() => {
    const carparkCopy = [...carparks]
    
    switch(filterOption) { 
      case '': {
        return carparkCopy
      }
      case 'season_parking': {

      }
      case 'can_park': {

      } 
    }
  }, [carparks, filterOption])

  const sortedCarparkList = useMemo(() => {
    switch(filterOption) {
      //by default it will sort by distance
      case '': {
        return filteredCarparkList?.sort((a,b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
      }
      case 'distance': {
        return filteredCarparkList?.sort((a,b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
      }

    }
  }, [filteredCarparkList, filterOption])

  return <FlatList
    data={carparks}
    //renaming item into carpark
    renderItem={({ item: carpark }) => (
      <View>
        <CarparkItem
          carpark={carpark}
          onPress={onItemPress}
          origin={origin}
        >
        </CarparkItem>
      </View>

    )}
    keyExtractor={(item) => item.id.toString()}
    style={styles.list}
    contentContainerStyle={styles.content}
  />
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