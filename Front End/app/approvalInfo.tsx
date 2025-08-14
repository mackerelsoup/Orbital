import { StyleSheet, Text, View, ScrollView, Pressable, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function approvalInfo() {
  const { type, formData } = useLocalSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!formData || typeof formData !== 'string') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Data Error</Text>
          <Text style={styles.errorText}>Invalid or missing form data</Text>
        </View>
      </SafeAreaView>
    );
  }

  const parsed = JSON.parse(formData);

  const onApprove = async () => {
    Alert.alert(
      "Approve Application",
      "Are you sure you want to approve this parking application?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: async () => {
            setIsProcessing(true);
            const URL = type === 'season' ?
              "https://migrated-backend.onrender.com/approveSeasonApplication" :
              "https://migrated-backend.onrender.com/approveCappedApplication";

            try {
              const response = await fetch(URL, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: parsed.email,
                  season_pass_type: parsed.season_pass_type
                }),
              });

              if (!response.ok) {
                Alert.alert("Error", "Failed to approve application");
                throw new Error("Approval failed");
              }

              Alert.alert(
                "Success",
                "Application approved successfully!",
                [{ text: "OK", onPress: () => router.back() }]
              );
            } catch (error) {
              console.log("Approval failed: ", error);
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const onReject = async () => {
    Alert.alert(
      "Reject Application",
      "Are you sure you want to reject this parking application? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setIsProcessing(true);
            const URL = type === 'season' ?
              "https://migrated-backend.onrender.com/rejectSeasonApplication" :
              "https://migrated-backend.onrender.com/rejectCappedApplication";

            try {
              const response = await fetch(URL, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: parsed.email }),
              });

              if (!response.ok) {
                Alert.alert("Error", "Failed to reject application");
                throw new Error("Rejection Failed");
              }

              Alert.alert(
                "Success",
                "Application rejected successfully!",
                [{ text: "OK", onPress: () => router.back() }]
              );
            } catch (error) {
              console.log("Rejection failed: ", error);
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const getFieldIcon = (key: string) => {
    const iconMap: { [key: string]: string } = {
      name: '👤',
      email: '📧',
      tel: '📱',
      address: '🏠',
      student_no: '🎓',
      faculty: '🏛️',
      vehicle_reg_no: '🚗',
      engine_capacity: '⚙️',
      parking_type: '🅿️',
      vehicle_owner: '👥',
      relationship: '🔗',
      iu_no: '🔢',
      salutation: '👋',
      submitted_at: '📅'
    };
    return iconMap[key] || '📋';
  };

  const renderField = (key: string, value: any) => {
    if (key === 'id') return null;
    let formattedValue;
    if (key === 'iu_no' || key === 'tel') {
      formattedValue = value
    }
    else {
      formattedValue = formatValue(value)
    }
    return (
      <View key={key} style={[styles.fieldContainer]}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldIcon}>{getFieldIcon(key)}</Text>
          <Text style={styles.fieldLabel}>{formatLabel(key)}</Text>
        </View>
        <Text style={[styles.fieldValue]}>
          {formattedValue}
        </Text>
      </View>
    )

  };


const getStatusBadge = () => (
  <View style={styles.statusContainer}>
    <View style={styles.statusBadge}>
      <Text style={styles.statusText}>PENDING REVIEW</Text>
    </View>
  </View>
);

return (
  <SafeAreaView style={styles.container}>
    <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {type === 'season' ? 'Season Parking' : 'Capped Parking'}
        </Text>
        <Text style={styles.headerSubtitle}>Application Review</Text>
        {getStatusBadge()}
      </View>

      <View style={styles.applicantCard}>
        <Text style={styles.sectionTitle}>Applicant Information</Text>
        {['salutation', 'name', 'email', 'tel', 'address'].map(key =>
          parsed[key] && renderField(key, parsed[key])
        )}
      </View>

      {type === 'season' && parsed.student_no && (
        <View style={styles.studentCard}>
          <Text style={styles.sectionTitle}>Student Details</Text>
          {['student_no', 'faculty'].map(key =>
            parsed[key] && renderField(key, parsed[key])
          )}
        </View>
      )}

      <View style={styles.vehicleCard}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        {['vehicle_reg_no', 'iu_no', 'engine_capacity', 'vehicle_owner', 'relationship'].map(key =>
          parsed[key] && renderField(key, parsed[key])
        )}
        {type === 'season' && parsed.parking_type && renderField('parking_type', parsed.parking_type)}
      </View>

      <View style={styles.timestampCard}>
        <Text style={styles.sectionTitle}>Submission Details</Text>
        {renderField('submitted_at', parsed.submitted_at)}
      </View>

      <View style={styles.actionSection}>
        <Text style={styles.actionTitle}>Review Decision</Text>
        <Text style={styles.actionSubtitle}>
          Please review all information carefully before making your decision.
        </Text>

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.rejectButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled
            ]}
            onPress={onReject}
            disabled={isProcessing}
          >
            <Text style={styles.rejectButtonText}>
              {isProcessing ? 'Processing...' : 'Reject'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.approveButton,
              pressed && styles.pressed,
              isProcessing && styles.disabled
            ]}
            onPress={onApprove}
            disabled={isProcessing}
          >
            <Text style={styles.approveButtonText}>
              {isProcessing ? 'Processing...' : 'Approve'}
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>
);
}

function formatLabel(label: string): string {
  const labelMap: { [key: string]: string } = {
    student_no: 'Student Number',
    vehicle_reg_no: 'Vehicle Registration',
    iu_no: 'IU Number',
    engine_capacity: 'Engine Capacity',
    parking_type: 'Parking Type',
    vehicle_owner: 'Vehicle Owner',
    tel: 'Phone Number',
    submitted_at: 'Submitted At'
  };

  return labelMap[label] || label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: any): string {
  if (typeof value === 'string') {
    const maybeDate = Date.parse(value);
    if (!isNaN(maybeDate)) {
      const date = new Date(maybeDate);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return value;
  }
  return String(value);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 16,
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: 1,
  },
  applicantCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  studentCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  vehicleCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  timestampCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#6d62fe',
  },
  fieldContainer: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  highlightedField: {
    backgroundColor: '#6d62fe08',
    borderColor: '#6d62fe',
    borderWidth: 2,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
    lineHeight: 22,
  },
  highlightedValue: {
    color: '#6d62fe',
    fontWeight: '700',
  },
  actionSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  actionSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  approveButton: {
    backgroundColor: '#6d62fe',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  approveButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  rejectButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
});