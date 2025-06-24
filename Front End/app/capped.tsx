import { FontAwesome } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

/*
Parent file of:
cappedForm.tsx

Parent file:
digitalpermits.tsx
*/


const CappedParkingStatus = () => {
  const router = useRouter()
  const { signedUp } = useLocalSearchParams()
  const [hasCappedParking, setHasCappedParking] = useState(false)

  useEffect(() => {
    if (signedUp === "true") {
      setHasCappedParking(true)
    }
  }, [signedUp])

  // if user wishes to end current season parking period
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
          onPress: () => {
            setHasCappedParking(false)
            Alert.alert("Vehicle Registration Removed", "Your vehicle registration has been successfully removed.")
          }
        }
      ]
    )
  } 

  // if user has successfully applied for season parking
  if (hasCappedParking) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* header */}
          <View style={styles.header}>
            <FontAwesome name="car" size={44} color="#10B981" style={styles.headerIcon} />
            <Text style={styles.heading}>Capped Parking</Text>
          </View>

          {/* status card */}
          <View style={styles.card}>
            <View style={styles.statusHeader}>
              <FontAwesome name="check-circle" size={24} color="#10B981" />
              <Text style={styles.statusTitle}>Vehicle Registered</Text>
            </View>

            <Text style={styles.statusDescription}>Your vehicle is registered and currently enjoys capped parking rates.</Text>

            {/* validity details */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <FontAwesome name="calendar" size={14} color="#6B7280" />  Valid Period
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

            {/* additional (non-working yet) actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryButton}>
                <FontAwesome name="refresh" size={16} color="#10B981" />
                <Text style={styles.secondaryButtonText}>Renew</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton}>
                <FontAwesome name="edit" size={16} color="#10B981" />
                <Text style={styles.secondaryButtonText}>Modify</Text>
              </TouchableOpacity>
            </View>

            {/* end season parking button */}
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleEndCappedParking}
            >
              <FontAwesome name="times-circle" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.dangerButtonText}>Remove Vehicle Registration</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    )
  }

  
  // default view for no season parking
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        {/* header icon + text */}
        <View style={styles.header}>
          <FontAwesome name="car" size={44} color="#10B981" style={styles.headerIcon} />
          <Text style={styles.heading}>Register Vehicle</Text>
        </View>

        {/* no season parking card */}
        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <FontAwesome name="exclamation-circle" size={24} color="#F59E0B" />
            <Text style={styles.statusTitle}>Vehicle NOT Registered</Text>
          </View>

          <Text style={styles.statusDescription}>
            You currently do not have a vehicle registered. Register now to enjoy capped parking rates at selected car parks!
          </Text>

            {/* capped rates display */}
            <View>
              <Text style={styles.cappedRatesTitle}>Capped Parking Rates</Text>
              <View style={styles.cappedRatesCard}>
                <View style={styles.cappedRatesRow}>
                  <Text style={styles.cappedRatesTime}>Mon-Fri, 08:30-18:00</Text>
                  <Text style={styles.cappedRatesAmount}>$0.0214/min</Text>
                </View>
                <View style={styles.capHighlight}>
                  <FontAwesome name="star" size={12} color="#10B981" />
                  <Text style={styles.capHighlightText}>Capped at $2.568 per exit</Text>
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
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/cappedForm")}>
            <FontAwesome name="plus" size={17} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Sign Up for Season Parking</Text>
          </TouchableOpacity>
        </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 10,
  },
  headerIcon: {
    marginRight: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 12,
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
    color: "#1F2937",
  },
  primaryButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#10B981",
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
    borderColor: "#10B981",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#10B981",
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
    color: "#1F2937",
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
    backgroundColor: '#fff',
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
    fontWeight: "700",
    color: "#374151",
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
    fontSize: 14,
    color: "#374151",
  },
  cappedRatesAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
  },
  capHighlight: {
    flexDirection: "row",
    alignItems: "center",
  },
  capHighlightText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "500",
    marginLeft: 6,
  },
  cappedRatesTitle2: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
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