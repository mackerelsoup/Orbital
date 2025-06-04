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
} from "react-native";

type FormErrors = {
  username?: string;
  password?: string;
}

export default function LoginForm() {
  //currently just username, will implement email soon
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  //check if the user submitted the right info
  const validateLogin = () => {
    let tempErrors: FormErrors = {}
    if (!username) {
      tempErrors.username = "Username is required";
    }

    //setErrors(errors)
    //setErrors({})
    console.log(Object.keys(errors))
    return Object.keys(errors).length === 0;
  }

  //API request
  const handleLogin = () => {
  if (validateLogin()) {
    console.log("here");
    fetch("http://192.168.68.60:3000/fetchbyUsername/testing")
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // or .text() if the server returns plain text
      })
      .then(data => {
        console.log("Response from server:", data);
      })
      .catch(error => {
        console.error("Fetch error:", error);
      });
  }
};


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
