import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { router } from "expo-router";
import RNPickerSelect from "react-native-picker-select";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isStaff, setIsStaff] = useState(false);
  const [hasSeasonPass, setHasSeasonPass] = useState(false);
  const [seasonPassType, setSeasonPassType] = useState("");

  const validate = () => {
    if (!username || !email || !password) {
      Alert.alert("Please fill in all required fields.");
      return false;
    }
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid email format.");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setUsername("")
    setEmail("")
    setPassword("")
    setIsStaff(false)
    setHasSeasonPass(false)
    setSeasonPassType("")
  }

  const handleRegister = async () => {
    if (!validate()) return;

    const payload = {
      username,
      email,
      password,
      is_staff: isStaff,
      season_pass: hasSeasonPass,
      season_pass_type: hasSeasonPass ? seasonPassType : null,
    };

    try {
      const response = await fetch("https://orbital-1y2b.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to register.");
      }

      Alert.alert("Registration successful!");
      resetForm()
      router.replace("/"); // Navigate to login or home
    } catch (err) {
      console.log(err);
      Alert.alert("Registration failed. Please try again later.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          secureTextEntry
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>Staff?</Text>
          <Switch value={isStaff} onValueChange={setIsStaff} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Has Season Pass?</Text>
          <Switch value={hasSeasonPass} onValueChange={setHasSeasonPass} />
        </View>

        {hasSeasonPass && (
          <>
            <Text style={styles.label}>Season Pass Type</Text>
            <RNPickerSelect
              onValueChange={(value) => setSeasonPassType(value)}
              value={seasonPassType}
              placeholder={{ label: "Select a pass type...", value: null }}
              items={isStaff ?
                [
                  { label: "Staff (Closed)", value: "staff_closed" },
                  { label: "Staff (Open)", value: "staff_open" },
                  { label: "Student (Closed)", value: "student_closed" },
                  { label: "Student (Open)", value: "student_open" },
                ] : 
                [
                  { label: "Student (Closed)", value: "student_closed" },
                  { label: "Student (Open)", value: "student_open" },
                ]
            }
              style={{
                inputIOS: styles.input,
                inputAndroid: styles.input,
                placeholder: { color: "#999" },
              }}
            />
          </>
        )}

        <Button title="Register" onPress={handleRegister} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
});
