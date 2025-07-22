import { StyleSheet, Text, View, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';

export default function approvalInfo() {
  const { type, formData } = useLocalSearchParams();

  if (!formData || typeof formData !== 'string') {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Invalid or missing form data</Text>
      </View>
    );
  }

  const parsed = JSON.parse(formData);

  const onApprove = async () => {
    const URL = type === 'season'? "http://192.168.68.60:3000/approveSeasonApplication" : "http://192.168.68.60:3000/approveCappedApplication" 
    try {
      const response = await fetch(URL, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: parsed.email,
          season_pass_type: 'student_covered'
        }),
      })

      if (!response.ok) {
        Alert.alert("Failed to approve application")
        throw new Error("Approval failed")
      }
    } catch(error) {
      console.log("Approval failed: ", error)
    }
  }

  const onReject = async () => {
    
    const URL = type === 'season'? "http://192.168.68.60:3000/rejectSeasonApplication" : "http://192.168.68.60:3000/rejectCappedApplication" 
    try {
      const response = await fetch(URL, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.email),
      })

      if (!response.ok) {
        Alert.alert("Failed to reject application")
        throw new Error("Rejection Failed")
      }
    } catch(error) {
      console.log("Rejection failed: ", error)
    }
    

  }

  

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>{type === 'season' ? 'Season Parking Application' : 'Capped Parking Application'}</Text>
        {Object.entries(parsed).map(([key, value]) => (
          <View key={key} style={styles.item}>
            <Text style={styles.label}>{formatLabel(key)}:</Text>
            <Text style={styles.value}>{formatValue(value)}</Text>
          </View>
        ))}

        <View style={styles.buttonContainer}>
          <Pressable style={({ pressed }) => [styles.button, styles.approve, pressed && styles.pressed]} onPress={onApprove}>
            <Text style={styles.buttonText}>Approve</Text>
          </Pressable>

          <Pressable style={({ pressed }) => [styles.button, styles.reject, pressed && styles.pressed]} onPress={onReject}>
            <Text style={styles.buttonText}>Reject</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>

  );
}

function formatLabel(label: string): string {
  return label
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: any): string {
  if (typeof value === 'string') {
    // If ISO Date
    const maybeDate = Date.parse(value);
    if (!isNaN(maybeDate)) {
      return new Date(maybeDate).toLocaleString();
    }
    return value;
  }
  return String(value);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  error: {
    color: 'red',
    fontSize: 18,
    padding: 16,
  },
    buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approve: {
    backgroundColor: '#4CAF50',
  },
  reject: {
    backgroundColor: '#F44336',
  },
  pressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
