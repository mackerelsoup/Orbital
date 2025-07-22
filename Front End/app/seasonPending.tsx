import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import React, { useContext, useState } from 'react';
import { UserContext } from '@/context/userContext';
import { router } from 'expo-router';

export default function SeasonPending() {
  const { user , setUser} = useContext(UserContext)!;

  const cleanupUser = async () => {
    try {
      const response = await fetch("https://back-end-o2lr.onrender.com/resetSeasonStatus", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert("Error", "Unable to connect to the server. Please try again later.");
    }
  };

  const handlePendingStatus = () => {
    Alert.alert("Application Still Pending");
  };

  const handleRejectedStatus = async () => {
    await cleanupUser();
    setUser({
      ...user,
      season_application_status: undefined
    })
    Alert.alert("Application Rejected", "Apply again or contact support", [
      { onPress: () => router.replace('/') }
    ]);
  };

  const handleApprovedStatus = (season_parking_type : string) => {
    setUser({
      ...user,
      season_parking: true,
      season_parking_type: season_parking_type,
      season_application_status: undefined
    })
    Alert.alert("Season Parking Application Approved, congratulations!", "", [
      { onPress: () => router.replace("/season?signedUp=true") }
    ]);
  };

  const handleNoStatus = () => {
    Alert.alert("User submission does not exist, resubmit", "", [
      { onPress: () => router.push("/seasonForm") }
    ]);
  };


  const handleRefresh = async () => {
    console.log("called")
    try {
      const response = await fetch(`https://back-end-o2lr.onrender.com/fetchUserDataEmail/${user.email}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User info not found");
        }
        throw new Error("Something went wrong");
      }

      const userData = await response.json();
      console.log(userData)

      if (userData[0]?.season_pass) {
        handleApprovedStatus(userData[0].season_parking_type);
      }
      else {
        if (userData[0].season_application_status) {
          switch (userData[0].season_application_status) {
            case 'pending':
              handlePendingStatus();
              break;
            case 'rejected':
              handleRejectedStatus();
              break;
          }
        }
        else {
          handleNoStatus()
        }
      }

    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", error instanceof Error ? error.message : "Unknown error");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Season Parking Application is Pending</Text>
      <Pressable style={styles.button} onPress={handleRefresh}>
        <Text style={styles.buttonText}>Refresh</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
