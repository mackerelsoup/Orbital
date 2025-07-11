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
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isStaff, setIsStaff] = useState(false);
  const [hasSeasonPass, setHasSeasonPass] = useState(false);
  const [seasonPassType, setSeasonPassType] = useState("");
  const nav = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inlineError, setInlineError] = useState("");

  const validate = () => {
    if (!username || !email || !password || !confirmPassword) {
      setInlineError("Please fill in all the required fields.");
      return false;
    }
    
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    if (!emailRegex.test(email)) {
      setInlineError("Invalid email format. Please try again.");
      return false;
    }

    if (password != confirmPassword) {
      setInlineError("Check that the same passwords have been entered.");
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setUsername("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setIsStaff(false)
    setHasSeasonPass(false)
    setSeasonPassType("")
    setInlineError("")
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
      const response = await fetch("https://back-end-o2lr.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to register.");
      }

      resetForm()
      router.replace("/registrationSuccess");
    } catch (err) {
      console.log(err);
      Alert.alert("Registration failed. Please try again later.");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.push("/login")} style={{ marginLeft: 16 }}>
              <Ionicons name="arrow-back" size={24} color="#6d62fe" />
            </TouchableOpacity>
          ),
          headerShown: true,
          title: "",
          headerShadowVisible: false,
          animation: "slide_from_right",
          animationDuration: 500,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingBottom: 60, paddingTop: 60 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../assets/images/undraw_sign-up_z2ku.png")}
            style={styles.image}
          />

          <View style={styles.innerContainer}>
            <Text style={styles.title}>Create your account</Text>

            {/* fields */}
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              placeholderTextColor="#A0A0A0"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@example.com"
              placeholderTextColor="#A0A0A0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Create a strong password"
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

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Retype the same password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#777"
                  style={{ marginRight: 10 }}
                />
              </Pressable>
            </View>

            {/* two selectable fields */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Account Type</Text>
              <View style={styles.cardContainer}>
                <TouchableOpacity
                  style={[styles.selectionCard, !isStaff && styles.selectedCard]}
                  onPress={() => setIsStaff(false)}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardText}>
                      <Text style={[styles.cardTitle, !isStaff && styles.selectedCardTitle]}>
                        Student
                      </Text>
                    </View>
                    <View style={[styles.radioButton, !isStaff && styles.selectedRadioButton]}>
                      {!isStaff && <View style={styles.radioButtonInner} />}
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.selectionCard, isStaff && styles.selectedCard]}
                  onPress={() => setIsStaff(true)}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardText}>
                      <Text style={[styles.cardTitle, isStaff && styles.selectedCardTitle]}>
                        Staff
                      </Text>
                    </View>
                    <View style={[styles.radioButton, isStaff && styles.selectedRadioButton]}>
                      {isStaff && <View style={styles.radioButtonInner} />}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>


            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Parking Pass</Text>
              <View style={styles.cardContainer}>
                <TouchableOpacity
                  style={[styles.selectionCard, !hasSeasonPass && styles.selectedCard]}
                  onPress={() => setHasSeasonPass(false)}
                >
                  <View style={styles.cardContent}>
                    <View style={[styles.iconContainer, !hasSeasonPass && styles.selectedIconContainer]}>
                      <Ionicons 
                        name="close-circle-outline" 
                        size={24} 
                        color={!hasSeasonPass ? "#6d62fe" : "#A0A0A0"} 
                      />
                    </View>
                    <View style={styles.cardText}>
                      <Text style={[styles.cardTitle, !hasSeasonPass && styles.selectedCardTitle]}>
                        No Pass
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        Per minute parking rates apply
                      </Text>
                    </View>
                    <View style={[styles.radioButton, !hasSeasonPass && styles.selectedRadioButton]}>
                      {!hasSeasonPass && <View style={styles.radioButtonInner} />}
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.selectionCard, hasSeasonPass && styles.selectedCard]}
                  onPress={() => setHasSeasonPass(true)}
                >
                  <View style={styles.cardContent}>
                    <View style={[styles.iconContainer, hasSeasonPass && styles.selectedIconContainer]}>
                      <Ionicons 
                        name="car-outline" 
                        size={24} 
                        color={hasSeasonPass ? "#6d62fe" : "#A0A0A0"} 
                      />
                    </View>
                    <View style={styles.cardText}>
                      <Text style={[styles.cardTitle, hasSeasonPass && styles.selectedCardTitle]}>
                        Season Pass
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        Unlimited free parking access
                      </Text>
                    </View>
                    <View style={[styles.radioButton, hasSeasonPass && styles.selectedRadioButton]}>
                      {hasSeasonPass && <View style={styles.radioButtonInner} />}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* shows up only if season pass is selected - NOT WORKING */}
            {hasSeasonPass && (
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Season Pass Type</Text>
                <View style={styles.pickerWrapper}>
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
                      inputIOS: styles.pickerInput,
                      inputAndroid: styles.pickerInput,
                      placeholder: { color: "#A0A0A0" },
                    }}
                  />
                  <Ionicons name="chevron-down" size={20} color="#777" style={styles.pickerIcon} />
                </View>
              </View>
            )}

            {/* input validation error */}
            {inlineError !== "" && (
              <Text style={styles.inlineError}>
                <Text style={{ fontWeight: "bold" }}>Oops! </Text>
                <Text>{inlineError}</Text>
              </Text>
            )}

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}>Already have an account? <Text style={styles.loginLinkBold}>Log in</Text></Text>
            </TouchableOpacity>

            <Text style={styles.footer}>
              By creating an account, you agree to our{" "}
              <Text style={styles.link}>Terms and Conditions</Text> and{" "}
              <Text style={styles.link}>Privacy Policy</Text>.
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
    color: "#1E1E1E",
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
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
  sectionContainer: {
    marginBottom: 24,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E1E1E",
    marginBottom: 12,
  },
  cardContainer: {
    gap: 12,
  },
  selectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedCard: {
    borderColor: "#6d62fe",
    backgroundColor: "#F8F7FF",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedIconContainer: {
    backgroundColor: "#EBE9FF",
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E1E1E",
    marginBottom: 2,
  },
  selectedCardTitle: {
    color: "#6d62fe",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#666",
    lineHeight: 16,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedRadioButton: {
    borderColor: "#6d62fe",
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6d62fe",
  },
  pickerContainer: {
    marginBottom: 16,
  },
  pickerWrapper: {
    position: "relative",
  },
  pickerInput: {
    height: 48,
    borderColor: "#CFCFCF",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#F9F9F9",
    paddingRight: 40,
  },
  pickerIcon: {
    position: "absolute",
    right: 12,
    top: 14,
  },
  registerButton: {
    backgroundColor: "#6d62fe",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
    marginTop: 16,
    shadowColor: "#6d62fe",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loginLink: {
    textAlign: "center",
    color: "#666",
    fontWeight: "400",
    marginBottom: 24,
    fontSize: 14,
  },
  loginLinkBold: {
    color: "#6d62fe",
    fontWeight: "600",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#808080",
    lineHeight: 18,
  },
  link: {
    color: "#6d62fe",
    fontWeight: "600",
  },
  image: {
    width: 280,
    height: 280,
    resizeMode: "contain",
    backgroundColor: "transparent",
    alignSelf: "center",
    marginBottom: -8,
    marginTop: -48,
  },
  inlineError: {
    color: "red",
    marginBottom: 12,
    textAlign: "left",
  },
});