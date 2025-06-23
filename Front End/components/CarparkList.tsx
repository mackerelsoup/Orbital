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
  DISTANCE: 'distance',
  AVAILABILITY: 'availability'
};

const FILTER_OPTIONS = {
  SEASON_PARKING: 'season_parking',
  CAN_PARK: 'can_park'
};

// API URLs
const API_BASE_URL = 'http://192.168.68.60:3000';
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
  <Pressable onPress={onPress}>
    <View style={[
      styles.filterButton,
      isActive && styles.activeFilterButton
    ]}>
      <Text style={styles.filterButtonText}>{label}</Text>
    </View>
  </Pressable>
);

const SortButton = ({
  onPress,
  currentOption
}: {
  onPress: () => void;
  currentOption: string
}) => (
  <Pressable onPress={onPress} style={styles.sortButton}>
    <FontAwesome name="sort" size={16} color="black" />
    <Text style={styles.sortButtonText}>{currentOption}</Text>
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
  /*
  useEffect(() => {
    if (!origin) return;
  // useEffect(() => {
  //   if (!origin) return;

  //   const fetchDistances = async () => {
  //     try {
  //       const distancePromises = carparks.map(async (carpark) => {
  //         const response = await fetch(API_ENDPOINTS.DISTANCE, {
  //           method: 'POST',
  //           headers: { 'Content-Type': 'application/json' },
  //           body: JSON.stringify({
  //             origin: {
  //               latitude: origin.latitude,
  //               longitude: origin.longitude
  //             },
  //             destination: {
  //               latitude: carpark.latitude,
  //               longitude: carpark.longitude
  //             }
  //           })
  //         });

  //         if (!response.ok) throw new Error("Failed to fetch distance");
  //         const data = await response.json();
  //         return { id: carpark.id, distance: data.distance / 1000 };
  //       });

  //       const distances = await Promise.all(distancePromises);
  //       const distanceMap = distances.reduce((acc, { id, distance }) => {
  //         acc[id] = distance;
  //         return acc;
  //       }, {} as DistanceData);

  //       setCarparkDistances(distanceMap);
  //     } catch (error) {
  //       console.error("Error fetching distances:", error);
  //     }
  //   };

    fetchDistances();
  }, [origin]);
  */
  //   fetchDistances();
  // }, [origin]);

  // useEffect(() => {
  //   const fetchAvailability = async () => {
  //     try {
  //       const availabilityPromises = carparks.map(async (carpark) => {
  //         const response = await fetch(API_ENDPOINTS.AVAILABILITY(carpark.id));
  //         if (!response.ok) throw new Error("Failed to fetch availability");
  //         return await response.json();
  //       });

  //       const availabilities = await Promise.all(availabilityPromises);
  //       const availabilityMap = availabilities.reduce((acc, item) => {
  //         acc[item[0].id] = [item[0].capacity, item[0].measure];
  //         return acc;
  //       }, {} as AvailabilityData);

  //       setCarparkAvailability(availabilityMap);
  //     } catch (error) {
  //       console.error("Error fetching availability", error);
  //     }
  //   };

  //   fetchAvailability();
  // }, [carparks]);

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
        return (availA[0] - availA[1]) - (availB[0] - availB[1]);
      }
    };

    return [...filteredCarparkList].sort(sortFunctions[sortOption] || sortFunctions[SORT_OPTIONS.DEFAULT]);
  }, [filteredCarparkList, sortOption, carparkDistances, carparkAvailability]);

  // Effects
  // useEffect(() => {
  //   onFilteredCarparkChange(filteredCarparkList);
  // }, [filteredCarparkList]);

  // useEffect(() => {
  //   setIsDataReady(true);
  //   if (isDataReady && onDoneCallback.current) {
  //     onDoneCallback.current();
  //     onDoneCallback.current = undefined;
  //   }
  // }, [sortedCarparkList]);

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

      <View style={styles.filterRow}>
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

      <View style={styles.sortContainer}>
        <SortButton
          onPress={() => sheetRef.current?.present()}
          currentOption={sortOption}
        />
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
        />
      </Animated.View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  filterButton: {
    padding: 6,
    borderRadius: 20,
    margin: 7,
    backgroundColor: 'white',
  },
  activeFilterButton: {
    backgroundColor: '#90ee90',
  },
  filterButtonText: {
    fontSize: 14,
  },
  sortContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    color: 'black',
    fontSize: 15,
    marginLeft: 6,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingTop: 10,
  },
});

export default CarparkList;