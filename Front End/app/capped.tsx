import { FontAwesome, Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { Alert, Animated, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { UserContext } from "@/context/userContext"
import { useFocusEffect } from "@react-navigation/native"

/*
Parent file of:
cappedForm.tsx

Parent file:
digitalpermits.tsx
*/


const CappedParkingStatus = () => {
  const router = useRouter();
  const { signedUp } = useLocalSearchParams();
  const [hasCappedParking, setHasCappedParking] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("UserContext not available");
  }
  const { user } = userContext;

  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused - checking capped status");
      const checkCappedStatus = async () => {
        try {
          console.log(user.email)
          const response = await fetch("http://192.168.68.60:3000/checkCappedStatus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email }),
          });
          console.log("checking capped status");
          const result = await response.json();
          console.log(result.capped)
          if (result.capped === true) {
            setHasCappedParking(true);
            console.log('set to true')
          } else {
            setHasCappedParking(false);
            console.log('set to false')
          }
        } catch (err) {
          console.error("Error checking capped parking:", err);
        } finally {
          // Can add a loading useState in the future
        }
      };

      checkCappedStatus();
    }, [user.email])
  );  

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

  // if user wishes to end current capped parking period
  const handleEndCappedParking = () => {
    Alert.alert(
      "Remove Vehicle Registraion",
      "Are you sure you want to remove your vehicle's registration? You will lose access to capped parking rates immediately and your vehicle will no longer be registered.",
      [
        {
          text: "Cancel", style: "cancel",
        },
        {
          text: "Remove", style: "destructive",
          onPress: async () => {
            try {
              console.log(user.email)
              const response = await fetch('http://192.168.68.60:3000/endCapped', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email }),
              });
        
              // get response and decode whether it is successful or not
              const result = await response.json();
              console.log(result);
              if (result.message === "Capped parking ended successfully") {
                console.log("Capped parking deleted from user_info")
                setTimeout(() => {
                  router.replace('/capped');
                }, 2000);
              } else {
                Alert.alert('Failed to end capped parking', result.error);
                throw new Error("failed to end subscription");
              }
            } catch (err) {
              // if no response, likely network error
              Alert.alert('Network error', 'Unable to connect to server');
              throw new Error("network error, failed to end subscription");
            }
            setHasCappedParking(false)
            Alert.alert("Subscription Ended", "Your capped parking subscription has been successfully ended.")
            router.replace('/capped');
          }
        }
      ]
    )
  }; 

  // if user has successfully applied for capped parking
  if (hasCappedParking) {
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
            Register Vehicle
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
            <Text style={styles.heading}>Capped Parking</Text>
            <View style={styles.statusHeader}>
              <FontAwesome name="check-circle" size={24} color="#6d62fe" />
              <Text style={styles.statusTitle}>Vehicle Registered</Text>
            </View>

            <Text style={styles.statusDescription}>Your vehicle is registered and currently enjoys capped parking rates.</Text>

            {/* validity details */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Valid Period
              </Text>
              <View style={styles.detailValue}>
                <Text style={styles.detailText}>12 May 2025 - 27 Aug 2025</Text>
              </View>
            </View>

            <View style={styles.cappedCard}>
              <Text style={styles.title}>Capped Parking Rates</Text>
              <Text style={styles.carparks}>CP 3, CP 10B</Text>
              
              <Text style={styles.cappedHeading}>Mon–Fri</Text>
              <Text style={styles.text}>
                0830 to 1800: $0.0214/min (capped at $2.568 per exit)
              </Text>
              <Text style={styles.text}>1801 to 1930: $0.0214/min</Text>
            </View>

            {/* view details */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                alert("Capped Parking Rates valid from 01/06/2025 to 31/08/2025")
              }}
            >
              <FontAwesome name="info-circle" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}> View Full Details</Text>
            </TouchableOpacity>

            {/* end capped parking button */}
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleEndCappedParking}
            >
              <FontAwesome name="times-circle" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.dangerButtonText}>Remove Vehicle Registration</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Animated.ScrollView>
      </KeyboardAvoidingView>
    )
  }

  
  // default view for no capped parking
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
          Register Vehicle
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
      scrollEventThrottle={16}>
      <View style={styles.container}>
        {/* no capped parking card */}
        <View style={styles.card}>
          <Text style={styles.heading}>Register Vehicle</Text>
          <View style={styles.statusHeader}>
            <FontAwesome name="exclamation-circle" size={24} color="#F59E0B" />
            <Text style={styles.statusTitle}>Vehicle NOT Registered</Text>
          </View>

          <Text style={styles.statusDescription}>
            You currently do not have a vehicle registered. Registered vehicles receive capped parking rates at selected car parks.
          </Text>

            {/* capped rates display */}
            <View>
              <Text style={styles.cappedRatesTitle}>Capped Parking Rates</Text>
              <View style={styles.cappedRatesCard}>
                <View style={styles.cappedRatesRow}>
                  <Text style={styles.cappedRatesTime}>$2.568 per exit</Text>
                </View>
                <View style={styles.capHighlight}>
                  <Text style={styles.capHighlightText}>Mon-Fri, 08:30-18:00</Text>
                </View>
              </View>
            </View>
            <View>
              <Text style={styles.cappedRatesTitle2}>Selected Car Parks</Text>
              <View style={styles.cappedRatesCard}>
                  <Text style={styles.cappedRatesCP}>CP3 – University Cultural Centre /Yong Siew Toh Conservatory of Music</Text>
                  <Text style={styles.cappedRatesCP2}>CP10 – Prince George’s Park Residences</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/cappedForm")}>
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
    color: "#374151",
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
    marginBottom: 24,
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
    marginTop: 32,
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
  benefitText: {
    fontSize: 14,
    color: "#374151",
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
  title: {
  fontWeight: '500',
  fontSize: 22,
  marginBottom: 24,
},
  carparks: {
    fontWeight: '800',
    fontSize: 20,
    marginBottom: 2,
  },
  cappedHeading: {
    fontWeight: '600',
    marginTop: 6,
  },
  text: {
    marginBottom: 4,
  },
  cappedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cappedRatesTitle: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 12,
    marginTop: 12,
  },
  cappedRatesCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  cappedRatesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cappedRatesTime: {
    fontSize: 18,
    fontWeight: 600,
  },
  capHighlight: {
    flexDirection: "row",
    alignItems: "center",
  },
  capHighlightText: {
    fontSize: 12,
    fontWeight: "400",
  },
  cappedRatesTitle2: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 12,
    marginTop: 32,
  },
  cappedRatesCP: {
    fontSize: 18,
    color: "#374151",
  },
  cappedRatesCP2: {
    fontSize: 18,
    color: "#374151",
    marginTop: 30,
  },

})

export default CappedParkingStatus