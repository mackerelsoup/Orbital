import { FontAwesome } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

/*
Parent file of:
seasonForm.tsx

Parent file:
digitalpermits.tsx
*/

const SeasonParkingStatus = () => {
  const router = useRouter()
  const { signedUp } = useLocalSearchParams()
  const [hasSeasonParking, setHasSeasonParking] = useState(false)

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
  }

  // if user has successfully applied for season parking
  if (hasSeasonParking) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* header */}
          <View style={styles.header}>
            <FontAwesome name="car" size={44} color="#10B981" style={styles.headerIcon} />
            <Text style={styles.heading}>Season Parking</Text>
          </View>

          {/* status card */}
          <View style={styles.card}>
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

            {/* additional (non-working yet) actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryButton}>
                <FontAwesome name="refresh" size={16} color="#6366F1" />
                <Text style={styles.secondaryButtonText}>Renew</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton}>
                <FontAwesome name="edit" size={16} color="#6366F1" />
                <Text style={styles.secondaryButtonText}>Modify</Text>
              </TouchableOpacity>
            </View>

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
      </ScrollView>
    )
  }

  // default view for no season parking
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        {/* header icon + text */}
        <View style={styles.header}>
          <FontAwesome name="car" size={44} color="#6366F1" style={styles.headerIcon} />
          <Text style={styles.heading}>Season Parking</Text>
        </View>

        {/* no season parking card */}
        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <FontAwesome name="exclamation-circle" size={24} color="#F59E0B" />
            <Text style={styles.statusTitle}>No Active Season Parking</Text>
          </View>

          <Text style={styles.statusDescription}>
            You currently do not have an active season parking subscription. Apply now to enjoy free campus parking!
          </Text>

          {/* season benefits */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <FontAwesome name="star" size={16} color="#6B7280" /> Season Parking Benefits
            </Text>
            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <FontAwesome name="check" size={14} color="#10B981" />
                <Text style={styles.benefitText}>Free parking at selected car parks</Text>
              </View>

              <View style={styles.benefitItem}>
                <FontAwesome name="check" size={14} color="#10B981" />
                <Text style={styles.benefitText}>Choose between sheltered and non-sheltered car park plans</Text>
              </View>
            </View>
          </View>

          {/* pricing options */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <FontAwesome name="dollar" size={16} color="#6B7280" /> Pricing Options
            </Text>
            <View style={styles.pricingContainer}>
              <View style={styles.pricingOption}>
                <Text style={styles.pricingLabel}>Unsheltered Lot</Text>
                <Text style={styles.pricingValue}>$35/month</Text>
              </View>
              <View style={styles.pricingOption}>
                <Text style={styles.pricingLabel}>Sheltered Lot</Text>
                <Text style={styles.pricingValue}>$65/month</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/seasonForm")}>
            <FontAwesome name="plus" size={17} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Sign Up for Season Parking</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "#6366F1",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366F1",
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
    borderColor: "#6366F1",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#6366F1",
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
})

export default SeasonParkingStatus