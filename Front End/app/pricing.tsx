import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import carparks from '../assets/carparks.json';

export default function PricingScreen() {
  return (
    <FlatList
      data={carparks}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          {item.pricing?.rate_per_minute && (
            <Text>Rate: ${item.pricing.rate_per_minute.toFixed(4)} / min</Text>
          )}
          {item.pricing?.rate_per_minute && (
            <Text>Day Rate: ${item.pricing.rate_per_minute.toFixed(4)} / min</Text>
          )}
          {item.pricing?.rate_per_minute && (
            <Text>Night Rate: ${item.pricing.rate_per_minute.toFixed(4)} / min</Text>
          )}
          {item.pricing?.max_daily_cap && (
            <Text>Cap: ${item.pricing.max_daily_cap.toFixed(3)} per day</Text>
          )}
          {item.pricing?.rate_per_minute && (
            <Text>Penalty Rate: ${item.pricing.rate_per_minute.toFixed(4)} / min</Text>
          )}
          {item.pricing?.charged_hours && (
            <Text style={styles.hours}>{item.pricing.charged_hours}</Text>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  hours: {
    marginTop: 6,
    fontStyle: 'italic'
  },
  remarks: {
    marginTop: 4,
    color: 'gray'
  }
});