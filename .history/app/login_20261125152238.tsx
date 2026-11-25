
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { loginUser } from "../src/services/authService";

const COLORS = {
  background: "#F5F7EF",
  primary: "#174D32",
  leaf: "#286B46",
  text: "#343B34",
  muted: "#788276",
  border: "#DFE5D9",
  white: "#FFFFFF",
  error: "#C7473A",
};

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!/^[6-9]\d{9}$/.test(phoneNumber.trim())) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      await loginUser({
        phoneNumber: phoneNumber.trim(),
        password,
      });

      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Login failed.");
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
          <Ionicons name="leaf" size={42} color={COLORS.white} />
        </View>

        <Text style={styles.title}>Kisaan Sathi</Text>
        <Text style={styles.subtitle}>
          Your smart farming companion
        </Text>

        <View style={styles.card}>
          <Text style={styles.heading}>Welcome Back!</Text>
          <Text style={styles.description}>
            Login to access your farming dashboard.
          </Text>

          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit mobile number"
            placeholderTextColor={COLORS.muted}
            keyboardType="phone-pad"
            maxLength={10}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />

          <Text style={styles.label}>Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor={COLORS.muted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />

            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={21}
                color={COLORS.muted}
              />
            </Pressable>
          </View>

          {!!error && (
            <Text style={styles.error}>{error}</Text>
          )}

          <Pressable
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?{" "}
            </Text>

            <Pressable onPress={() => router.push("/signup")}>
              <Text style={styles.link}>Sign Up</Text>
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
    width: 75,
    height: 75,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 29,
    fontWeight: "800",
    color: COLORS.primary,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 27,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heading: {
    color: COLORS.primary,
    fontSize: 23,
    fontWeight: "800",
  },
  description: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 7,
    marginBottom: 24,
  },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 18,
    color: COLORS.text,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    paddingHorizontal: 14,
    backgroundColor: COLORS.background,
    marginBottom: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    color: COLORS.text,
  },
  error: {
    color: COLORS.error,
    fontSize: 12,
    marginBottom: 13,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 22,
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
