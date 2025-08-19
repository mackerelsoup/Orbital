import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View, Pressable, Text } from 'react-native';
import { Region } from 'react-native-maps';
import CarparkItem from './CarparkItem';
import { UserContext } from '@/context/userContext';
import CustomBottomSheet from './BottomSheet';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  runOnJS
} from 'react-native-reanimated';

// Types
type CarparkListProps = {
  carparks: Carpark[];
  onItemPress: (carpark: Carpark) => void;
  onFilteredCarparkChange: (filteredCarprks: Carpark[]) => void;
  origin: Region;
};

type DistanceData = Record<number, number>;
type AvailabilityData = Record<number, [number, number]>;

// Constants
const SORT_OPTIONS = {
  DEFAULT: 'Sort',
  DISTANCE: 'Distance',
  AVAILABILITY: 'Availability'
};

const FILTER_OPTIONS = {
  SEASON_PARKING: 'season_parking',
  CAN_PARK: 'can_park'
};

// API URLs
const API_BASE_URL = 'https://migrated-backend.onrender.com';
const API_ENDPOINTS = {
  DISTANCE: `${API_BASE_URL}/computeDistance`,
  AVAILABILITY: (id: number) => `${API_BASE_URL}/fetchCarparkData/${id}`
};

// Helper Components
const FilterButton = ({
  label,
  isActive,
  onPress
}: {
  label: string;
  isActive: boolean;
  onPress: () => void
}) => (
  <Pressable onPress={onPress} style={({ pressed }) => [
    styles.filterButton,
    isActive && styles.activeFilterButton,
    pressed && styles.pressedFilterButton
  ]}>
    <Text style={[
      styles.filterButtonText,
      isActive && styles.activeFilterButtonText
    ]}>
      {label}
    </Text>
  </Pressable>
);

const SortButton = ({
  onPress,
  currentOption
}: {
  onPress: () => void;
  currentOption: string
}) => (
  <Pressable 
    onPress={onPress} 
    style={({ pressed }) => [
      styles.sortButton,
      pressed && styles.pressedSortButton
    ]}
  >
    <View style={styles.sortButtonContent}>
      <FontAwesome 
        name="sort" 
        size={14} 
        color="#6366F1" 
        style={styles.sortIcon}
      />
      <Text style={styles.sortButtonText}>{currentOption}</Text>
      <FontAwesome 
        name="chevron-down" 
        size={10} 
        color="#6B7280" 
        style={styles.chevronIcon}
      />
    </View>
  </Pressable>
);

// Main Component
const CarparkList = ({
  carparks,
  onItemPress,
  onFilteredCarparkChange,
  origin
}: CarparkListProps) => {
  // State
  const [sortOption, setSortOption] = useState<string>(SORT_OPTIONS.DEFAULT);
  const [filterOption, setFilterOption] = useState<string>('');
  const [visualFilterOption, setVisualFilterOption] = useState<string>('')
  const [carparkDistances, setCarparkDistances] = useState<DistanceData>({});
  const [carparkAvailability, setCarparkAvailability] = useState<AvailabilityData>({});
  const [isDataReady, setIsDataReady] = useState(false);

  // Refs and Context
  const { user } = useContext(UserContext)!;
  const sheetRef = useRef<BottomSheetModal>(null);
  const onDoneCallback = useRef<() => void | undefined>(undefined);
  const listOpacity = useSharedValue(1);

  // Animation
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
  }));

  // Data Fetching
  
  useEffect(() => {
    if (!origin) return;
    
    const fetchWithTimeout = (promise: Promise<Response>, timeout: number) => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), timeout)
      ),
    ]);
  };

    const fetchDistances = async () => {
      try {
        const distancePromises = carparks.map(async (carpark) => {
          const response = await fetch(API_ENDPOINTS.DISTANCE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

          //if (!response.ok) throw new Error("Failed to fetch distance");
          if (response.status == 504) {
            return {id :carpark.id, distance: Infinity}
          }
          const data = await response.json();
          return { id: carpark.id, distance: data.distance / 1000 };
        });

        const distances = await Promise.all(distancePromises);
        const distanceMap = distances.reduce((acc, { id, distance }) => {
          acc[id] = distance;
          return acc;
        }, {} as DistanceData);

        setCarparkDistances(distanceMap);
      } catch (error) {
        console.error("Error fetching distances:", error);
      }
    };

    fetchDistances();
  }, [origin]);


  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const availabilityPromises = carparks.map(async (carpark) => {
          const response = await fetch(API_ENDPOINTS.AVAILABILITY(carpark.id));
          if (!response.ok) throw new Error("Failed to fetch availability");
          return await response.json();
        });

        const availabilities = await Promise.all(availabilityPromises);
        const availabilityMap = availabilities.reduce((acc, item) => {
          acc[item[0].id] = [item[0].capacity, item[0].measure];
          return acc;
        }, {} as AvailabilityData);

        setCarparkAvailability(availabilityMap);
      } catch (error) {
        console.error("Error fetching availability", error);
      }
    };

    fetchAvailability();
  }, [carparks]);

  // Filtering and Sorting
  const filteredCarparkList = useMemo(() => {
    if (!carparks.length) return [];

    switch (filterOption) {
      case FILTER_OPTIONS.SEASON_PARKING:
        return carparks.filter(carpark =>
          carpark.season_parking_type?.includes(user.season_parking_type!)
        );
      case FILTER_OPTIONS.CAN_PARK:
        return carparks.filter(carpark =>
          carpark.staff ? carpark.staff === user.staff : true
        );
      default:
        return [...carparks];
    }
  }, [carparks, filterOption, user]);

  const sortedCarparkList = useMemo(() => {
    if (!filteredCarparkList.length) return [];

    const sortFunctions = {
      [SORT_OPTIONS.DEFAULT]: (a: Carpark, b: Carpark) =>
        (carparkDistances[a.id] || Infinity) - (carparkDistances[b.id] || Infinity),
      [SORT_OPTIONS.DISTANCE]: (a: Carpark, b: Carpark) =>
        (carparkDistances[a.id] || Infinity) - (carparkDistances[b.id] || Infinity),
      [SORT_OPTIONS.AVAILABILITY]: (a: Carpark, b: Carpark) => {
        const availA = carparkAvailability[a.id] || [0, 0];
        const availB = carparkAvailability[b.id] || [0, 0];
        return availB[1] - availA[1];
      }
    };

    return [...filteredCarparkList].sort(sortFunctions[sortOption] || sortFunctions[SORT_OPTIONS.DEFAULT]);
  }, [filteredCarparkList, sortOption, carparkDistances, carparkAvailability]);

  // Effects
  useEffect(() => {
    onFilteredCarparkChange(filteredCarparkList);
  }, [filteredCarparkList]);

  useEffect(() => {
    setIsDataReady(true);
    if (isDataReady && onDoneCallback.current) {
      onDoneCallback.current();
      onDoneCallback.current = undefined;
    }
  }, [sortedCarparkList]);

  const waitForDataReady = () => {
    return new Promise<void>(resolve => {
      if (isDataReady) {
        resolve();
      } else {
        onDoneCallback.current = resolve;
      }
    });
  };

  // Handlers
  const handleSortOption = (option: string) => {
    setSortOption(option);
    setTimeout(() => sheetRef.current?.dismiss(), 25);
  };

  const handleFilterOption = async (option: string) => {
    setIsDataReady(false);
    setVisualFilterOption(prev => prev === option ? '' : option)
    await new Promise<void>((resolve) => {
      listOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      }, (finished) => {
        if (finished) {
          runOnJS(resolve)();
        }
      });
    });
    setFilterOption(prev => prev === option ? '' : option);
    await waitForDataReady();
    setTimeout(() => {
      listOpacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.inOut(Easing.quad),
      });
    }, 300);
  }; //handles filter and filter animation

  return (
    <View style={styles.container}>
      <CustomBottomSheet
        ref={sheetRef}
        onSelect={handleSortOption}
      />

      {/* filter buttons */}
      <View style={styles.headerSection}>
        <View style={styles.controlsRow}>
          <View style={styles.filtersContainer}>
            {user.username && (
              <FilterButton
                label="Season Parking"
                isActive={visualFilterOption === FILTER_OPTIONS.SEASON_PARKING}
                onPress={() => handleFilterOption(FILTER_OPTIONS.SEASON_PARKING)}
              />
            )}
            <FilterButton
              label="Allowed Parking"
              isActive={visualFilterOption === FILTER_OPTIONS.CAN_PARK}
              onPress={() => handleFilterOption(FILTER_OPTIONS.CAN_PARK)}
            />
          </View>

          <SortButton
            onPress={() => sheetRef.current?.present()}
            currentOption={sortOption}
          />
        </View>
      </View>

      <Animated.View style={[styles.listContainer, animatedStyle]}>
        <FlatList
          data={sortedCarparkList}
          renderItem={({ item: carpark }) => (
            <CarparkItem
              carpark={carpark}
              distances={carparkDistances}
              availability={carparkAvailability}
              onPress={onItemPress}
            />
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeFilterButton: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  pressedFilterButton: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  sortButton: {
    marginLeft: 8,
  },
  pressedSortButton: {
    opacity: 0.7,
  },
  sortButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
  },
  sortIcon: {
    marginRight: 6,
  },
  sortButtonText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  chevronIcon: {
    marginLeft: 2,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});
export default CarparkList;