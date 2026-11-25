
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  registerUser,
  loginUser,
} from "../src/services/authService";

const COLORS = {
  background: "#F5F7EF",
  primary: "#174D32",
  text: "#343B34",
  muted: "#788276",
  border: "#DFE5D9",
  white: "#FFFFFF",
  error: "#C7473A",
};

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    if (fullName.trim().length < 3) {
      setError("Enter your full name (minimum 3 characters).");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phoneNumber.trim())) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
      });

      // Registration response has no token yet.
      // Login automatically to obtain JWT.
      await loginUser({
        phoneNumber: phoneNumber.trim(),
        password,
      });

      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={38} color={COLORS.white} />
        </View>

        <Text style={styles.title}>Join Kisaan Sathi</Text>
        <Text style={styles.subtitle}>
          Create your farmer account
        </Text>

        <View style={styles.card}>
          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.description}>
            Enter your details to get started.
          </Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 8 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={styles.button}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
            </Text>

            <Pressable onPress={() => router.replace("/login")}>
              <Text style={styles.link}>Login</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
  },
  logoContainer: {
    width: 70,
    height: 70,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    color: COLORS.primary,
    fontSize: 27,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 23,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 21,
  },
  heading: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primary,
  },
  description: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 20,
  },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    padding: 13,
    marginBottom: 15,
    color: COLORS.text,
  },
  error: {
    color: COLORS.error,
    fontSize: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 15,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  link: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 13,
  },
});
