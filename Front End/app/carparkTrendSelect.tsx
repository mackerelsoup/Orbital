import React from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import carparks from '../assets/carparks.json';

const { width } = Dimensions.get('window');

interface Carpark {
  id: number;
  name: string;
  // Add other carpark properties as needed
}

export default function CarparkTrendSelect() {
  const handleSelect = (carpark: Carpark) => {
    router.push(`./carparkTrend/${carpark.id}`);
  };

  const renderCarparkItem = ({ item, index }: { item: Carpark; index: number }) => (
    <Pressable
      style={[styles.item, styles.shadowEffect]}
      onPress={() => handleSelect(item)}
      android_ripple={{ color: '#6d62fe20' }}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemSubtitle}>View parking trends</Text>
          </View>
        </View>
        
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
    </Pressable>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📊</Text>
      <Text style={styles.emptyTitle}>No Carparks Available</Text>
      <Text style={styles.emptyText}>
        There are currently no carparks to display trends for.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>
          Select a carpark to view its occupancy trends and analytics
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{carparks.length}</Text>
            <Text style={styles.statLabel}>Available Carparks</Text>
          </View>
        </View>

        <FlatList
          data={carparks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCarparkItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<EmptyState />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 10,
    justifyContent:'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#64748b',
    fontWeight: '400',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingTop: 10
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#6d62fe',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#6d62fe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#e0e7ff',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  shadowEffect: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent:'center'
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  arrowContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});