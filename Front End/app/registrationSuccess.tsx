import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ConfirmationScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          title: "",
          headerShadowVisible: false,
          animation: "slide_from_right",
          animationDuration: 500,
        }}
      />
      <View style={styles.container}>
        <Image
          source={require("../assets/images/undraw_happy-music_na4p.png")}
          style={styles.image}
        />
        <Text style={styles.title}>Registration Successful!</Text>
        <Text style={styles.message}>
          Thank you for registering. You can now log in to your account.
        </Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.replace("/login")}>
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#6d62fe',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: 320,
    height: 320,
    resizeMode: "contain",
    backgroundColor: "transparent",
    alignSelf: "center",
    marginBottom: -8,
    marginTop: -48,
  },
});