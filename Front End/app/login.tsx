import { parseAsync } from "@babel/core";
import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  Image,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";

type FormErrors = {
  username?: string;
  password?: string;
}

class ConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Connection Error"
  }
}

class UserNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "User not found error"
  }
}


export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});



  //check if the user submitted the right info
  const validateLogin = () => {
    let tempErrors: FormErrors = {};
    if (!username) tempErrors.username = "Username/Email is required";
    if (!password) tempErrors.password = "Password is required";

    setErrors(tempErrors)
    if (Object.keys(tempErrors).length > 0) {
      //console.log(errors)
      Object.values(tempErrors).reverse().forEach(error => Alert.alert(error));
    }

    return Object.values(tempErrors).length === 0;
  };

  const isEmail = () => {
    let emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/
    return emailRegex.test(username)
  }



  const handleLogin = async () => {
    if (!validateLogin()) return;

    try {
      let response
      if (isEmail()) response = await fetch(`http://192.168.68.60:3000/fetchbyEmail/${username}`);
      else response = await fetch(`http://192.168.68.60:3000/fetchbyUsername/${username}`);

      if (response.status === 404) throw new UserNotFoundError("User not found")
      if (!response.ok) throw new ConnectionError("Network response was not ok")

      const data = await response.json();

      if (data[0].password !== password) {
        Alert.alert("Error", "Incorrect password");
        setPassword("");
        return;
      }

      // Successful login
      setUsername("");
      setPassword("");
      router.replace('/');
    } catch (error) {
      if (error instanceof ConnectionError) {
        console.log("Connection error", error)
        Alert.alert("Login failed. Please try again later.")
      }
      else if (error instanceof UserNotFoundError) {
        console.log("User not found", error)
        Alert.alert("Please enter a valid username or email")
      }
      setUsername("")
      setPassword("")
    }
  }



  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={styles.container}
    >
      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          placeholderTextColor={"black"}
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor={"black"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button title="Login" onPress={handleLogin} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f5f5f5",
  },
  form: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});