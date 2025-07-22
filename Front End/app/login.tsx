import { UserContext } from "@/context/userContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, Stack } from "expo-router";
import React, { useContext, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

type FormErrors = {
  username?: string;
  password?: string;
  both?: string;
};

type userDataIncomplete = {
  username: string;
  email: string;
  password: string;
};

class ConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Connection Error";
  }
}

class UserNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "User not found error";
  }
}

class userDataNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "User data not found error";
  }
}

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const { setUser, setLoggedIn, setUserType } = useContext(UserContext)!;
  const { from } = useLocalSearchParams();
  const nav = useNavigation();


  const validateLogin = () => {
    let tempErrors: FormErrors = {};
    if (!username && password) tempErrors.username = "Username/Email is required";
    if (!password && username) tempErrors.password = "Password is required";
    if (!password && !username) tempErrors.both = "Username/Email and Password are required";

    if (Object.keys(tempErrors).length > 0) {
      Object.values(tempErrors).reverse().forEach(error => Alert.alert(error));
    }

    return Object.values(tempErrors).length === 0;
  };

  const isEmail = () => {
    let emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    return emailRegex.test(username);
  };

  const handleLogin = async () => {
    if (!validateLogin()) {
      setInlineError("Email or password incorrect. Please try again.");
      return;
    }

    try {
      let response;
      if (isEmail())
        response = await fetch(`http://192.168.68.60:3000/fetchbyEmail/${username}`);
      else response = await fetch(`http://192.168.68.60:3000/fetchbyUsername/${username}`);

      if (response.status === 404) throw new UserNotFoundError("User not found");
      if (!response.ok) throw new ConnectionError("Network response was not ok");

      const data = await response.json();
      console.log("data:", data[0].username)

      if (data[0].password !== password) {
        setInlineError("Email or password incorrect. Please try again.");
        setPassword("");
        return;
      }

      setInlineError("");
      setUserData(data[0]);
      setUsername("");
      setPassword("");
      router.replace((from?.toString() || "/") as any);
    } catch (error) {
      if (error instanceof ConnectionError) {
        Alert.alert("Login failed. Please try again later.");
      } else if (error instanceof UserNotFoundError) {
        setInlineError("Email or password incorrect. Please try again.");
      }
      setUsername("");
      setPassword("");
    }
  };

  const setUserData = async (data: userDataIncomplete) => {
    try {
      let response = await fetch(`http://192.168.68.60:3000/fetchUserData/${data.username}`);
      if (response.status === 404) {
        console.log("user not found")
        throw new userDataNotFoundError("User not found");
      }

      if (!response.ok) throw new ConnectionError("Network response was not ok");

      const userdata = await response.json();
      // set user type
      if (userdata[0].is_staff) {
        setUserType('Staff');
      } else {
        setUserType('Student');
      }

      response = await fetch(`http://192.168.68.60:3000/getUserProfilePic/${data.username}`)
      if (response.status === 404) {
        console.log("user not found")
        throw new userDataNotFoundError("User not found");
      }

      if (!response.ok) throw new ConnectionError("Network response was not ok");

      const userProfilePic = await response.json()

      const mergedData = {
        username: data.username,
        email: data.email,
        staff: userdata[0].is_staff,
        season_parking: userdata[0].season_pass,
        season_parking_type: userdata[0].season_pass_type,
        season_application_status: userdata[0].season_application_status,
        capped_pass: userdata[0].capped_pass,
        capped_application_status: userdata[0].capped_application_status,
        profile_uri: userProfilePic[0].profileuri,
      };

      setUser(mergedData);
      setLoggedIn(true);
    } catch (error) {
      if (error instanceof ConnectionError) {
        Alert.alert("Login failed. Please try again later.");
      } else if (error instanceof userDataNotFoundError) {
        Alert.alert("User info not in database, contact support");
      }
      setUsername("");
      setPassword("");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => { setInlineError(""); nav.goBack() }}
              style={{ marginLeft: 16, marginTop: 8 }}
            >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#d1d5db',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#6d62fe" />
            </View>
            </TouchableOpacity>
          ),
          headerShown: true,
          title: "",
          headerShadowVisible: false,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../assets/images/undraw_login_weas.png")}
            style={styles.image}
          />
          <View style={styles.innerContainer}>
            <Text style={styles.title}>Log into account</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@example.com"
              placeholderTextColor="#A0A0A0"
              value={username}
              onChangeText={setUsername}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#777"
                  style={{ marginRight: 10 }}
                />
              </Pressable>
            </View>

            {inlineError !== "" && (
              <Text style={styles.inlineError}>
                <Text style={{ fontWeight: "bold" }}>Oops! </Text>
                <Text>{inlineError}</Text>
              </Text>
            )}

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setInlineError(""); router.push("/registration") }}>
              <Text style={styles.createPre}>
                Dont have an account?{" "}
                <Text style={styles.create}>Create an Account</Text>
              </Text>
            </TouchableOpacity>

            <Text style={styles.footer}>
              By logging in, you agree to the{" "}
              <Text style={styles.link}>Terms and Conditions</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
  },
  innerContainer: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderColor: "#CFCFCF",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: "#F9F9F9",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#CFCFCF",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#F9F9F9",
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#6d62fe",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 12,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  createPre: {
    textAlign: "center",
    color: "#808080",
    marginBottom: 32,
    marginTop: -4,
    fontSize: 14,
  },
  create: {
    textAlign: "center",
    color: "#1E1E1E",
    fontWeight: "600",
    marginBottom: 24,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#808080",
  },
  link: {
    color: "#6d62fe",
    fontWeight: "700",
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    backgroundColor: "transparent",
    alignSelf: "center",
    marginBottom: 24,
    marginTop: -64,
  },
  inlineError: {
    color: "red",
    marginBottom: 12,
    textAlign: "left",
  },
});
