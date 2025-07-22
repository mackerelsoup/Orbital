import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState, useRef } from 'react';
import { Animated, Dimensions, FlatList, Image, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import carparks from '../assets/carparks.json';

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

export default function PricingScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const router = useRouter();

  const filteredCarparks = useMemo(() => {
    return carparks.filter((carpark: Carpark) =>
      carpark.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
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

          {/* pricing */}
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
                <Ionicons name="calendar-outline" size={18} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.pricingLabel}>Daily Cap</Text>
                <Text style={styles.pricingValue}>{formatDailyCap(item.pricing?.max_daily_cap)}</Text>
              </View>
            </View>
          </View>

          {/* card expanded */}
          {isExpanded && (
            <View style={styles.expandedContent}>
              
              <View style={styles.detailsGrid}>
                <View style={styles.detailCard}>
                  <View style={styles.detailIcon}>
                    <Ionicons 
                      name={item.type === "sheltered" ? "umbrella-outline" : "sunny-outline"} 
                      size={20} 
                      color={item.type === "sheltered" ? "#3B82F6" : "#F59E0B"} 
                    />
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Type</Text>
                    <Text style={[
                      styles.detailValue,
                    ]}>
                      {item.type === "sheltered" ? "Sheltered" : "Open Air"}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailCard}>
                  <View style={styles.detailIcon}>
                    <Ionicons 
                      name={item.staff ? "lock-closed-outline" : "globe-outline"} 
                      size={20} 
                      color={item.staff ? "#EF4444" : "#10B981"} 
                    />
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Access</Text>
                    <Text style={[
                      styles.detailValue,
                      { color: item.staff ? "#EF4444" : "#10B981" }
                    ]}>
                      {item.staff ? "Staff" : "Public"}
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
                  colors={["#6d62fe", "#3B82F6"]}
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

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: Platform.select({
      ios: [172, 0],
      android: [198, 0],
      default: [172, 0],
    }),
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 180],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6d62fe" />

      <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity, overflow: 'hidden' }]}>
        <LinearGradient colors={["#6d62fe", "#3B82F6"]} style={StyleSheet.absoluteFill}>

        <View style={styles.headerContent}>
        </View>

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

        {/* available lots left */}
        <Text style={styles.headerSubtitle}>
          {filteredCarparks.length} carpark{filteredCarparks.length !== 1 ? "s" : ""} available
        </Text>

        {/* free parking disclaimer */}
        <View style={styles.disclaimerContainer}>
          <View style={styles.disclaimerBadge}>
            <Ionicons name="information-circle-outline" size={16} color="#ffffff" />
            <Text style={styles.disclaimerText}>
              Free parking on Sundays and Public Holidays
            </Text>
          </View>
        </View>
      </LinearGradient>
      </Animated.View>

      <View style={styles.content}>
        <Animated.FlatList
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
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
            <Image source={require("../assets/images/undraw_page-eaten.png")}
              style={{ width: 200, height: 200, resizeMode: "contain", backgroundColor: "transparent" }} />
              <Text style={styles.emptyStateTitle}>No carparks found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search terms or browse all available carparks.
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingBottom: 24,
    backgroundColor: '#6d62fe',
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffffcc',
    fontWeight: '500',
    marginLeft: 26,
    marginTop: -4,
    marginBottom: 24,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 0,
    marginTop: -16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  disclaimerContainer: {
    paddingHorizontal: 24,
  },
  disclaimerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff26',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#ffffff33',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#ffffffe6',
    marginLeft: 6,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 100,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cardHeaderLeft: {
    flex: 1,
  },
  carparkName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  carparkId: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: -8,
  },
  expandButton: {
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  pricingContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
  },
  pricingCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pricingIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  pricingLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  pricingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  expandedContent: {
    padding: 20,
    paddingTop: 0,
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
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  chargedHoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  chargedHoursIcon: {
    marginRight: 12,
  },
  chargedHoursText: {
    fontSize: 14,
    color: '',
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  selectButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6d62fe',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  selectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
});