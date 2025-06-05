import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import Button from '@/components/Button';

interface CarparkListProps {
  carparks: Carpark[];
  onItemPress: (carpark: Carpark) => void;
}

const CarparkList = ({ carparks, onItemPress }: CarparkListProps) => (
  <FlatList
    data={carparks}
    renderItem={({ item : carpark}) => (
      <Button 
        label={carpark.name} 
        onPress={() => onItemPress(carpark)}
      />
    )}
    keyExtractor={(item) => item.id.toString()}
    style={styles.list}
    contentContainerStyle = {styles.content}
  />
);

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