import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useNavigation, useRouter } from 'expo-router';
import React, { useMemo, useState, useRef, useLayoutEffect, useContext } from 'react';
import { Animated, Dimensions, FlatList, Image, Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import carparks from '../assets/carparks.json';
import { UserContext } from '@/context/userContext';
import ProfileAvatar from '@/components/ProfileAvatar';

const { width } = Dimensions.get("window");

interface Carpark {
  id: number;
  name: string;
  pricing: {
    rate_per_minute?: number;
    max_daily_cap?: number;
    charged_hours?: string;
  };
  type: string;
  staff: boolean;
}

const categories = [
  { id: 'sheltered', name: 'Sheltered', icon: 'umbrella-outline' },
  { id: 'open-air', name: 'Open Air', icon: 'sunny-outline' },
  { id: 'public', name: 'Public', icon: 'globe-outline' },
  { id: 'staff-only', name: 'Staff', icon: 'lock-closed-outline' },
];

export default function PricingScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const router = useRouter();
  const navigation = useNavigation()
  const { user } = useContext(UserContext)!

  const filteredCarparks = useMemo(() => {
    let filtered = carparks.filter((carpark: Carpark) =>
      carpark.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedCategory) {
      filtered = filtered.filter((carpark: Carpark) => {
        switch (selectedCategory) {
          case 'sheltered':
            return carpark.type === 'sheltered';
          case 'open-air':
            return carpark.type !== 'sheltered';
          case 'public':
            return !carpark.staff;
          case 'staff-only':
            return carpark.staff;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  const toggleDisclaimer = () => {
    setShowDisclaimer(!showDisclaimer);
  };

  const hideDisclaimer = () => {
    setShowDisclaimer(false);
  };

  const handleCardPress = (carpark: Carpark) => {
    router.push({ pathname: "/", params: { carparkId: carpark.id.toString(), triggerClick: "true" } });
  };

  const toggleExpanded = (carparkId: number) => {
    setExpandedCard(expandedCard === carparkId ? null : carparkId);
  };

  const formatPrice = (price: number | undefined) => {
    if (price) return price.toFixed(4);
  };

  const formatDailyCap = (cap: number | undefined) => {
    if (cap === undefined) {
      return "NIL";
    } else {
      return `$${Math.floor(cap * 100) / 100}`;
    }
  };

  const renderCarparkCard = ({ item }: { item: Carpark }) => {
    const isExpanded = expandedCard === item.id;

    return (
      <Animated.View style={styles.cardContainer}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => toggleExpanded(item.id)}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.carparkName}>{item.name}</Text>
              <Text style={styles.carparkId}>#{item.id}</Text>
            </View>
            <View style={styles.expandButton}>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color="#667085"
              />
            </View>
          </TouchableOpacity>

          {/* unexpanded */}
          <View style={styles.pricingContainer}>
            <View style={styles.pricingCard}>
              <View style={styles.pricingIcon}>
                <Ionicons name="time-outline" size={18} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.pricingLabel}>Per Minute</Text>
                <Text style={styles.pricingValue}>${formatPrice(item.pricing?.rate_per_minute)}</Text>
              </View>
            </View>

            <View style={styles.pricingCard}>
              <View style={styles.pricingIcon}>
                <Ionicons
                  name={item.staff ? "lock-closed-outline" : "globe-outline"}
                  size={18}
                  color={item.staff ? "#EF4444" : "#10B981"}
                />
              </View>
              <View>
                <Text style={styles.pricingLabel}>Access</Text>
                <Text style={[
                  styles.pricingValue,
                  { color: item.staff ? "#EF4444" : "#10B981" }
                ]}>
                  {item.staff ? "Staff" : "Public"}
                </Text>
              </View>
            </View>
          </View>

          {/* card expanded */}
          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.detailsGrid}>
                <View style={styles.detailCard}>
                  <View style={styles.pricingIcon}>
                    <Ionicons
                      name={item.type === "sheltered" ? "umbrella-outline" : "sunny-outline"}
                      size={20}
                      color={item.type === "sheltered" ? "#3B82F6" : "#F59E0B"}
                    />
                  </View>
                  <View>
                    <Text style={styles.pricingLabel}>Type</Text>
                    <Text style={styles.pricingValue}>
                      {item.type === "sheltered" ? "Sheltered" : "Open Air"}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailCard}>
                  <View style={styles.pricingIcon}>
                    <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
                  </View>
                  <View>
                    <Text style={styles.pricingLabel}>Daily Cap</Text>
                    <Text style={styles.pricingValue}>
                      {formatDailyCap(item.pricing?.max_daily_cap)}
                    </Text>
                  </View>
                </View>
              </View>

              {item.pricing?.charged_hours && (
                <View style={styles.chargedHoursCard}>
                  <View style={styles.chargedHoursIcon}>
                    <Ionicons name="information-circle-outline" size={18} color="#6d62fe" />
                  </View>
                  <Text style={styles.chargedHoursText}>{item.pricing.charged_hours}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => handleCardPress(item)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#6366F1", "#8B5CF6", "#EC4899"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1.3, y: 0 }}
                  style={styles.selectButtonGradient}
                >
                  <Text style={styles.selectButtonText}>   Select</Text>
                  <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>

    );
  };

  const scrollY = useRef(new Animated.Value(0)).current;

  // hide disclaimer on scroll
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: () => {
        if (showDisclaimer) {
          hideDisclaimer();
        }
      }
    }
  );

  // category tabs scroll
  const categoryHeight = scrollY.interpolate({
    inputRange: [0, 100, 150],
    outputRange: [70, 35, 30],
    extrapolate: 'clamp',
  });

  const categoryIconOpacity = scrollY.interpolate({
    inputRange: [0, 80, 120],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  const categoryTextSize = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [13, 13], // font size
    extrapolate: 'clamp',
  });

  const categoryPaddingHorizontal = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [12, 8],
    extrapolate: 'clamp',
  });

  const renderCategoryTab = (category: any) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryTab,
        selectedCategory === category.id && styles.categoryTabSelected
      ]}
      onPress={() => {
        setTimeout(() => {
          setSelectedCategory(selectedCategory === category.id ? null : category.id)
        }, 50);
      }}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.categoryIcon, { opacity: categoryIconOpacity }]}>
        <Ionicons
          name={category.icon}
          size={18}
          color={selectedCategory === category.id ? '#FF385C' : '#6B7280'}
        />
      </Animated.View>
      <Animated.Text
        style={[
          styles.categoryText,
          selectedCategory === category.id && styles.categoryTextSelected,
          {
            fontSize: categoryTextSize,
            paddingHorizontal: categoryPaddingHorizontal
          }
        ]}
      >
        {category.name}
      </Animated.Text>
    </TouchableOpacity>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <ProfileAvatar />
    })
  }, [navigation])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* header */}
      <View style={styles.fixedHeader}>
        {/* search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search carparks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* results + disclaimer */}
        <View style={styles.resultsContainer}>
          <View style={styles.resultsRow}>
            <Text style={styles.resultsText}>
              {filteredCarparks.length} carpark{filteredCarparks.length !== 1 ? "s" : ""} available
            </Text>

            <TouchableOpacity onPress={toggleDisclaimer} style={styles.infoButton}>
              <Ionicons name="information-circle-outline" size={16} color="#6d62fe" />
            </TouchableOpacity>
          </View>

          {/* disclaimer popup */}
          {showDisclaimer && (
            <View style={styles.disclaimerPopup}>
              <Text style={styles.disclaimerPopupText}>
                Free parking on Sundays and Public Holidays
              </Text>
              <View style={styles.disclaimerArrow} />
            </View>
          )}
        </View>

        {/* category tabs */}
        <Animated.View style={[styles.categoryContainer, { height: categoryHeight }]}>
          <View style={styles.categoryScrollContainer}>
            {categories.map(renderCategoryTab)}
          </View>
        </Animated.View>
      </View>

      {/* content with touch handler to hide disclaimer */}
      <TouchableOpacity
        style={styles.content}
        activeOpacity={1}
        onPress={hideDisclaimer}
      >
        <Animated.FlatList
          onScroll={onScroll}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
          scrollEventThrottle={16}
          decelerationRate="fast"
          overScrollMode="never"
          nestedScrollEnabled={Platform.OS === 'android'}
          data={filteredCarparks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCarparkCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Image
                source={require("../assets/images/undraw_page-eaten.png")}
                style={{ width: 200, height: 200, resizeMode: "contain", backgroundColor: "transparent" }}
              />
              <Text style={styles.emptyStateTitle}>No carparks found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search terms or browse all available carparks.
              </Text>
            </View>
          )}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFCFD',
  },
  fixedHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    zIndex: 1000,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    marginBottom: -9,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
    fontWeight: '500',
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  categoryScrollContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    flex: 1,
  },
  categoryTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minHeight: 34,
    marginTop: -4,
  },
  categoryTabSelected: {
    borderBottomColor: '#FF385C',
  },
  categoryIcon: {
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: '#FF385C',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    position: 'relative',
  },
  resultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  infoButton: {
    padding: 6,
    marginRight: 4,
    borderRadius: 8,
  },
  disclaimerPopup: {
    position: 'absolute',
    top: 42,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 220,
    zIndex: 1000,
  },
  disclaimerPopupText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#475569',
    lineHeight: 16,
  },
  disclaimerArrow: {
    position: 'absolute',
    top: -6,
    right: 16,
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    transform: [{ rotate: '45deg' }],
  },
  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
  },
  cardHeaderLeft: {
    flex: 1,
  },
  carparkName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  carparkId: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: -6,
  },
  expandButton: {
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
  },
  pricingContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
  },
  pricingCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  pricingIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
    marginRight: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pricingLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  pricingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.1,
  },
  expandedContent: {
    padding: 24,
    paddingTop: 8,
    backgroundColor: '#FEFEFE',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  detailCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: -16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginLeft: -4,
    marginTop: -2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  chargedHoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  chargedHoursIcon: {
    marginRight: 14,
  },
  chargedHoursText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  selectButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  selectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    gap: 10,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  profileContainer: {
    marginRight: 2.5
  },
  profileIcon: {
    borderRadius: 75
  }
});