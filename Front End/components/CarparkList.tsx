import React, { useEffect } from 'react';
import { FlatList, StyleSheet , View, Text} from 'react-native';
import Button from '@/components/Button';
import { Region } from 'react-native-maps';
import CarparkItem from './CarparkItem';

type CarparkListProps = {
  carparks: Carpark[];
  onItemPress: (carpark: Carpark) => void;
  origin?: Region
}


const CarparkList = ({ carparks, onItemPress, origin }: CarparkListProps) => {
  
  return (
    <FlatList
      data={carparks}
      renderItem={({ item: carpark }) => (
        <CarparkItem
          carpark = {carpark}
          onPress={onItemPress}
          origin={origin}>

        </CarparkItem>
      )}
      keyExtractor={(item) => item.id.toString()}
      style={styles.list}
      contentContainerStyle={styles.content}
    />
  );
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