import React, { useRef, useState } from "react";
import {
  Animated,
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
import CustomDropdown from "@/components/CustomDropdown";

export default function RegisterForm() {

  class DuplicateError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'Duplicate Error'
      Object.setPrototypeOf(this, DuplicateError.prototype);
    }
  }

  class PasswordError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'Password Error'
      Object.setPrototypeOf(this, PasswordError.prototype);
    }
  }


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
  const scrollY = useRef(new Animated.Value(0)).current;

  const titleOpacity = scrollY.interpolate({
    inputRange: [300, 350],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [300, 350],
    outputRange: [10, 0],
    extrapolate: 'clamp',
  });

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

    console.log(payload.season_pass_type)

    try {
      const response = await fetch("https://migrated-backend.onrender.com/newRegister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const message = await response.text()
        if (response.status === 409) {
          if (message[0] === 'U') {
            setUsername("")
          }
          else {
            setEmail("")
          }
          throw new DuplicateError("Duplicate info")
        }
        else if (response.status === 422) {
          setPassword("")
          setConfirmPassword("")
          throw new PasswordError("Insufficient password length")
        }
        else
          throw new Error("Failed to register.");
      }

      resetForm()
      router.replace("/registrationSuccess");
    } catch (err) {
      if (err instanceof DuplicateError){
        Alert.alert("Username or email already exists")
      }
      else if (err instanceof PasswordError) {
        Alert.alert("Registration failed, enter a password of at least length 6")
      }
      else {
        Alert.alert("Registration failed, try again later")
      }
    }
  };

  const parseLabel = (label: string) => {
    switch (label) {
      case "Staff (Covered)":
        return "staff_covered";
      case "Staff (Open)":
        return "staff_open";
      case "Student (Covered)":
        return "student_covered";
      case "Student (Open)":
        return "student_open";
      case "Student (Open 2A)":
        return "student_open_2A";
      case "Student (Open 10)":
        return "student_open_10";
      case "Student (Open 11)":
        return "student_open_11";
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 100,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          zIndex: 10,
          justifyContent: 'center',
        }}
      >
        {/* back arrow */}
        <TouchableOpacity
          onPress={() => router.push('/login')}
          style={{
            position: 'absolute',
            left: 16,
            marginRight: 12,
            marginTop: 46,
          }}
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
            <Ionicons name='arrow-back' size={20} color='#6d62fe' />
          </View>
        </TouchableOpacity>


        {/* title */}
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Animated.Text
            style={{
              position: 'absolute',
              alignSelf: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: '600',
              color: '#1F2937',
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
              marginTop: 46,
            }}
          >
            Create your account
          </Animated.Text>
        </View>

        {/* line that appears alongside title */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: '#E5E7EB',
            opacity: titleOpacity,
          }}
        />
      </View>

      <Animated.ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
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
              textContentType="password"
              autoComplete="password"
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
              <CustomDropdown
                data={
                  isStaff ?
                    [
                      { label: "Staff (Covered)", value: "Staff (Covered)" },
                      { label: "Staff (Open)", value: "Staff (Open)" },
                    ] :
                    [
                      { label: "Student (Covered)", value: "Student (Covered)" },
                      { label: "Student (Open)", value: "Student (Open)" },
                      { label: "Student (Open 2A)", value: "Student (Open 2A)" },
                      { label: "Student (Open 10)", value: "Student (Open 10)" },
                      { label: "Student (Open 11)", value: "Student (Open 11)" },
                    ]
                }
                handleChange={(item) => setSeasonPassType(parseLabel(item.label)!)}
              />

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

          <TouchableOpacity onPress={() => { setInlineError(""); router.push("/login") }}>
            <Text style={styles.loginLink}>Already have an account? <Text style={styles.loginLinkBold}>Log in</Text></Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            By creating an account, you agree to our{" "}
            <Text style={styles.link}>Terms and Conditions</Text> and{" "}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        </View>
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
    justifyContent: "center",
    paddingBottom: 60,
    paddingTop: 120,
  },
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