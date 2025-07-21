import { StyleSheet, Text, View, Pressable, Alert } from 'react-native'
import React, { useContext, useState } from 'react'
import { UserContext, UserProvider } from '@/context/userContext'
import { router } from 'expo-router'

export default function cappedPending() {
  const { user } = useContext(UserContext)!
  const [status, setStatus] = useState<string>('pending')

  const cleanupUser = async () => {
    try {
      const response = await fetch("https://back-end-o2lr.onrender.com/deleteCappedApplication", {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (response.ok) {
        //Alert.alert("Success", data.message || "Application deleted successfully");
        // Optional: update local UI state to reflect deletion
      } else {
        Alert.alert("Error", data.error || "Something went wrong");
      }

    } catch (error) {
      console.error("Network error:", error);
      Alert.alert("Error", "Unable to connect to the server. Please try again later.");
    }
  };

  const checkStatus = async () => {
    console.log(user.email)
    try {
      const response = await fetch(`https://back-end-o2lr.onrender.com/fetchUserDataEmail/${user.email}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User info not found")
        }
      }

      const userData = await response.json()
      if (userData[0].capped_pass) {
        console.log("here")
        Alert.alert("Capped Parking Application Approved, congratulations!", "", [
          {
            onPress: () => router.replace("/capped?signedUp=true")
          }
        ])
      }

    } catch (error) {
      console.log("User not found")
      Alert.alert("User submission does not exist, resubmit", "", [
        {
          onPress: () => {
            router.push("/cappedForm")
          }
        }
      ])

    }
  }

  const handleRefresh = async () => {
    try {
      const response = await fetch('https://back-end-o2lr.onrender.com/getCappedApplicationStatus', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email
        }),
      })

      if (!response.ok) {
        if (response.status === 500) {
          throw new Error("Network error")
        }
        else if (response.status === 404) {
          checkStatus()
        }
      }

      const status = await response.json()
      console.log(status)
      const parsedStatus = status.status

      if (parsedStatus === 'pending') {
        Alert.alert("Application Still pending")
      }
      else if (parsedStatus === 'rejected') {
        cleanupUser()
        Alert.alert("Application Rejected", "Apply again or contact support", [
          {
            onPress: () => router.replace('/')
          }
        ])
      }


    } catch (error) {
      if (error instanceof Error) Alert.alert("Error", error.message || "?")
    }
  }

  return (
    <View>
      <Text>Capped Pending</Text>
      <Pressable style={styles.button} onPress={handleRefresh}>
        <Text style={styles.buttonText}>Refresh</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
})