// components/CarparkModal.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

type Props = {
  carpark: Carpark;
  onClose: () => void;
  onNavigate: () => void;
};

export default function CarparkInfoModal({ carpark, onClose, onNavigate }: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{carpark?.name}</Text>

        {carpark?.distance && (
          <Text style={styles.modalDistance}>{carpark.distance.toFixed(1)} km away</Text>
        )}

        {carpark?.pricing?.rate_per_minute && (
          <Text style={styles.modalPrice}>Rate: ${carpark.pricing.rate_per_minute.toFixed(4)} / min</Text>
        )}

        {carpark?.pricing?.charged_hours && (
          <Text style={styles.modalHours}>{carpark.pricing?.charged_hours}</Text>
        )}

        <View style={styles.modalButtons}>
          <Pressable style={styles.navigateButton} onPress={onNavigate}>
            <Text style={styles.navigateButtonText}>Navigate</Text>
          </Pressable>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 9999
  },
  modalContent: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  modalDistance: { fontSize: 16, marginBottom: 8 },
  modalPrice: { fontSize: 16, color: "#007AFF", marginBottom: 4 },
  modalHours: { fontSize: 14, fontStyle: "italic", marginBottom: 20 },
  modalButtons: { flexDirection: "row", gap: 12 },
  navigateButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  navigateButtonText: {
    color: "white", fontSize: 16, fontWeight: "600",
  },
  closeButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#333", fontSize: 16, fontWeight: "500",
  },
});
