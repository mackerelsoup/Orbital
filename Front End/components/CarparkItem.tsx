import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { UserContext } from '@/context/userContext';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  carpark: Carpark;
  distances: Record<number, number>
  availability?: Record<number, [number, number]> | null
  onPress: (carpark: Carpark) => void;
};

export default function CarparkItem({ carpark, distances, availability = null, onPress }: Props) {
  const { user } = useContext(UserContext)!

  const canPark = carpark.staff ? (user?.staff == carpark.staff) : true;
  const availabilityData = availability?.[carpark.id];
  const availabilityPercentage = availabilityData ? (availabilityData[1] / availabilityData[0]) * 100 : 0;

  // colours to denote how much space left visually
  const getAvailabilityColor = (percentage: number) => {
    if (percentage >= 70) return '#10B981'; // green
    if (percentage >= 30) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressedContainer
      ]}
      onPress={() => onPress(carpark)}
    >
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.carparkName} numberOfLines={1}>
          {carpark.name}
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </View>

      {/* car park details */}
      <View style={styles.detailsContainer}>
        <View style={styles.compactRow}>
          <Text style={styles.compactLabel}>
            {distances[carpark.id] ? `${distances[carpark.id].toFixed(1)}km` : "Computing..."}
          </Text>
          <View style={styles.separator} />
          <Text style={[
            styles.compactLabel,
            { color: canPark ? "#10B981" : "#EF4444" }
          ]}>
            {canPark ? "✓ Allowed" : "✗ Not Allowed"}
          </Text>
        </View>

        {/* availability indicator */}
        {availabilityData && (
          <View style={styles.availabilityRow}>
            <Text style={styles.availabilityText}>
              {availabilityData[1]}/{availabilityData[0]} spaces
            </Text>
            <View style={styles.availabilityBar}>
              <View 
                style={[
                  styles.availabilityFill,
                  { 
                    width: `${availabilityPercentage}%`,
                    backgroundColor: getAvailabilityColor(availabilityPercentage)
                  }
                ]} 
              />
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pressedContainer: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.05,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  carparkName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  detailsContainer: {
    gap: 8,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: '#D1D5DB',
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  availabilityText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    minWidth: 80,
  },
  availabilityBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  availabilityFill: {
    height: '100%',
    borderRadius: 2,
  },
});