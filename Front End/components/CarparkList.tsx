import React from 'react';
import { FlatList, StyleSheet , View, Text} from 'react-native';
import Button from '@/components/Button';
import { Region } from 'react-native-maps';

type CarparkListProps = {
  carparks: Carpark[];
  onItemPress: (carpark: Carpark) => void;
  origin: Region
}

const getDistance = async (carpark: Carpark, origin : Region) => {
  try {
    let response = await fetch("http://192.168.68.60:3000/computeDistance", {
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
    })
    if (!response.ok) throw new Error("tf")


  } catch (error) {

  }
}

const CarparkList = ({ carparks, onItemPress, origin }: CarparkListProps) => (
  <FlatList
    data={carparks}
    //renaming item into carpark
    renderItem={({ item: carpark }) => (
      <View>
        <Button
          label={carpark.name}
          onPress={() => onItemPress(carpark)}>
        </Button>
        <Text>
          dsnmfsd
        </Text>
      </View>

    )}
    keyExtractor={(item) => item.id.toString()}
    style={styles.list}
    contentContainerStyle={styles.content}
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