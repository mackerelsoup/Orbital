import { FontAwesome, Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Alert, Animated, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

/*
Parent file of:
seasonForm.tsx

Parent file:
digitalpermits.tsx
*/

const SeasonParkingStatus = () => {
  const router = useRouter();
  const { signedUp } = useLocalSearchParams();
  const [hasSeasonParking, setHasSeasonParking] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const titleOpacity = scrollY.interpolate({
    inputRange: [50, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [50, 100],
    outputRange: [10, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    if (signedUp === "true") {
      setHasSeasonParking(true)
    }
  }, [signedUp])

  // if user wishes to end current season parking period
  const handleEndSeasonParking = () => {
    Alert.alert(
      "End Season Parking",
      "Are you sure you want to end your current season parking subscription? This action cannot be undone and you will lose access to season parking benefits immediately.",
      [
        {
          text: "Cancel", style: "cancel",
        },
        {
          text: "End Subscription", style: "destructive",
          onPress: () => {
            setHasSeasonParking(false)
            Alert.alert("Subscription Ended", "Your season parking subscription has been successfully ended.")
          }
        }
      ]
    )
  }; 

  // if user has successfully applied for season parking
  if (hasSeasonParking) {
    return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      keyboardVerticalOffset={90}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 100,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          zIndex: 10,
          justifyContent: 'center',
        }}
      >
        {/* back arrow */}
        <TouchableOpacity
          onPress={() => router.push('/digitalpermits')}
          style={{
            position: 'absolute',
            left: 16,
            marginRight: 12,
            marginTop: 46,
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#d1d5db',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name='arrow-back' size={20} color='#6d62fe' />
          </View>
        </TouchableOpacity>


        {/* title */}
        <View style={{ alignItems: 'center', justifyContent: 'center'}}>
          <Animated.Text
            style={{
              position: 'absolute',
              alignSelf: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: '600',
              color: '#1F2937',
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
              marginTop: 46,
            }}
          >
          Season Parking
          </Animated.Text>
        </View>

        {/* line that appears alongside title */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: '#E5E7EB',
            opacity: titleOpacity,
          }}
        />
      </View>
      
      <Animated.ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* status card */}
          <View style={styles.card}>
            <Text style={styles.heading}>Season Parking</Text>
            <View style={styles.statusHeader}>
              <FontAwesome name="check-circle" size={24} color="#10B981" />
              <Text style={styles.statusTitle}>Active Season Parking</Text>
            </View>

            <Text style={styles.statusDescription}>You currently have an active season parking subscription.</Text>

            {/* validity details */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <FontAwesome name="calendar" size={14} color="#6B7280" />  Valid Period
              </Text>
              <View style={styles.detailValue}>
                <Text style={styles.detailText}>12 May 2025 - 27 Aug 2025</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <FontAwesome name="map-marker" size={14} color="#6B7280" />  Parking Type
              </Text> 
              <View style={styles.detailValue}>
                <Text style={styles.detailText}>Unsheltered Lot - $35/month</Text>
              </View>
            </View>

            {/* view details */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                alert("Season Parking valid from 01/06/2025 to 31/08/2025")
              }}
            >
              <FontAwesome name="info-circle" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}> View Full Details</Text>
            </TouchableOpacity>

            {/* end season parking button */}
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleEndSeasonParking}
            >
              <FontAwesome name="times-circle" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.dangerButtonText}>End Season Parking</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Animated.ScrollView>
      </KeyboardAvoidingView>
    )
  }

  // default view for no season parking
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      keyboardVerticalOffset={90}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 100,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          zIndex: 10,
          justifyContent: 'center',
        }}
      >
        {/* back arrow */}
        <TouchableOpacity
          onPress={() => router.push('/digitalpermits')}
          style={{
            position: 'absolute',
            left: 16,
            marginRight: 12,
            marginTop: 46,
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#d1d5db',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name='arrow-back' size={20} color='#6d62fe' />
          </View>
        </TouchableOpacity>


        {/* title */}
        <View style={{ alignItems: 'center', justifyContent: 'center'}}>
          <Animated.Text
            style={{
              position: 'absolute',
              alignSelf: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: '600',
              color: '#1F2937',
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
              marginTop: 46,
            }}
          >
          Season Parking
          </Animated.Text>
        </View>

        {/* line that appears alongside title */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: '#E5E7EB',
            opacity: titleOpacity,
          }}
        />
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
      <View style={styles.container}>
        {/* no season parking card */}
        <View style={styles.card}>
          <Text style={styles.heading}>Season Parking</Text>
          <View style={styles.statusHeader}>
            <FontAwesome name="exclamation-circle" size={24} color="#F59E0B" />
            <Text style={styles.statusTitle}>No Active Season Parking</Text>
          </View>

          <Text style={styles.statusDescription}>
            You currently do not have an active season parking subscription.
          </Text>

          {/* season benefits */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
               Season Parking Benefits
            </Text>
              <View style={styles.benefitItem}>
                <FontAwesome name="check" size={14} color="#10B981" />
                <Text style={styles.benefitText}>Free parking at selected car parks</Text>
              </View>
              <View style={styles.benefitItem2}>
                <FontAwesome name="check" size={14} color="#10B981" />
                <Text style={styles.benefitText}>Choose between sheltered and non-sheltered car park plans</Text>
              </View>
          </View>

          {/* pricing options */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Pricing Options
            </Text>
            <View style={styles.pricingContainer}>
              <View style={styles.pricingOption}>
                <Text style={styles.pricingLabel}>Unsheltered</Text>
                <Text style={styles.pricingValue}>$35/month</Text>
              </View>
              <View style={styles.pricingOption}>
                <Text style={styles.pricingLabel}>Sheltered</Text>
                <Text style={styles.pricingValue}>$65/month</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/seasonForm")}>
            <Text style={styles.primaryButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 34,
    fontWeight: 500,
    marginBottom: 36,
    marginTop: 84,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 8,
  },
  statusDescription: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 40,
  },
  detailValue: {
    backgroundColor: "#F9FAFB",
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailText: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#6d62fe",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6d62fe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  dangerButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 16,
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderColor: "#6d62fe",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#6d62fe",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  benefitsContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  benefitItem2: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 16,
    alignSelf: 'flex-start'
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 8,
  },
  pricingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderColor: "#D1D5DB",
    borderWidth: 1,
  },
  pricingOption: {
    alignItems: "center",
  },
  pricingLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  pricingValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
})

export default SeasonParkingStatus