import React, { useState, useMemo } from 'react';
import { Image, FlatList, Keyboard, StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import carparks from '../assets/carparks.json';

interface Carpark {
  id: number;
  name: string;
  pricing: {
    rate_per_minute?: number;
    max_daily_cap?: number;
    charged_hours?: string;
  };
}

export default function PricingScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // filters the car parks based on input
  const filteredCarparks = useMemo(() => {
    return carparks.filter((carpark: Carpark) =>
      carpark.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };


  const handleCardPress = (carpark: Carpark) => {
    router.push({ pathname: '/', params: { carparkId: carpark.id.toString(), triggerClick: 'true' } });
  };

  // displays all the carpark cards and makes them interactable
  const renderCarparkCard = ({ item }: { item: Carpark }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)}>
      <View style={styles.cardHeader}>
        <View style={styles.carparkInfo}>
          <FontAwesome name="building" size={20} color="#6366F1" />
          <Text style={styles.carparkName}>{item.name}</Text>
        </View>
        <View style={styles.carparkId}>
          <Text style={styles.carparkIdText}>#{item.id}</Text>
        </View>
      </View>

      <View style={styles.pricingGrid}>
        <View style={styles.pricingItem}>
          <View style={styles.pricingIcon}>
            <FontAwesome name="clock-o" size={20} color="#10B981" />
          </View>
          <View style={styles.pricingDetails}>
            <Text style={styles.pricingLabel}>Rate per Minute</Text>
            <Text style={styles.pricingValue}>
              ${item.pricing?.rate_per_minute?.toFixed(4) || '0.0000'}
            </Text>
          </View>
        </View>

        <View style={styles.pricingItem}>
          <View style={styles.pricingIcon}>
            <FontAwesome name="tachometer" size={20} color="#F59E0B" />
          </View>
          <View style={styles.pricingDetails}>
            <Text style={styles.pricingLabel}>Daily Cap</Text>
            <Text style={styles.pricingValue}>
              {item.pricing?.max_daily_cap !== undefined
                ? `$${Math.floor(item.pricing?.max_daily_cap * 100) / 100}`
                : 'No Cap'}
            </Text>
          </View>
        </View>
      </View>

      {item.pricing?.charged_hours && (
        <View style={styles.chargedHours}>
          <FontAwesome name="info-circle" size={16} color="#6B7280" />
          <Text style={styles.chargedHoursText}>{item.pricing.charged_hours}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <FontAwesome name="dollar" size={26} color="#6366F1" />
          <Text style={styles.headerTitle}>Parking Rates</Text>
        </View>
        <Text style={styles.headerSubtitle}>{filteredCarparks.length} car parks available</Text>
      </View>

      {/* search bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={17} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            returnKeyType="done"
            placeholder="Search car parks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <FontAwesome name="times" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredCarparks.length} result{filteredCarparks.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
          </Text>
        </View>
      )}

      {/* free parking disclaimer */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
        <Text style={{ fontSize: 11, fontStyle: 'italic' }}>
          * Parking is free on Sundays and Public Holidays at all car parks.
        </Text>
      </View>

      {/* empty state (no search results)*/}
      <FlatList
        data={filteredCarparks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCarparkCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Image source={require('../assets/images/undraw_page-eaten.png')}
              style={{ width: 200, height: 200, resizeMode: 'contain', backgroundColor: 'transparent' }} />
            <Text style={styles.emptyStateTitle}>No car parks found</Text>
            <Text style={styles.emptyStateText}>
              Oops! No matches. Try adjusting your search terms or browse all available car parks.
            </Text>
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
                <Text style={styles.clearSearchButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 27,
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  clearButton: {
    padding: 4,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
  },
  resultsText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  carparkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  carparkName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  carparkId: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  carparkIdText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  pricingGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  pricingItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pricingIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pricingDetails: {
    flex: 1,
  },
  pricingLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  pricingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  additionalRates: {
    backgroundColor: '#FAFBFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rateLabel: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
  },
  rateAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  chargedHours: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  chargedHoursText: {
    fontSize: 13,
    color: '#1E40AF',
    fontStyle: 'italic',
    marginLeft: 8,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 44,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  clearSearchButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});