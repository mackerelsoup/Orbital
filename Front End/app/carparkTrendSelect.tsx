import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { router } from 'expo-router';
import carparks from '../assets/carparks.json';

export default function CarparkTrendSelect() {
  const handleSelect = (carpark: Carpark) => {
    router.push({
      pathname: '/carparkTrend',
      params: {
        carpark: JSON.stringify({
            ...carpark,
            id: 1,
        }),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Carpark to View its Trends</Text>
      <FlatList
        data={carparks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={styles.item}
            onPress={() => handleSelect(item)}
          >
            <Text style={styles.itemText}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    padding: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 12,
  },
  itemText: {
    fontSize: 16,
  },
});
