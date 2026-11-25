import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Redirect } from "expo-router";
import { isLoggedIn } from "../src/services/authService";

export default function Index() {
  const [destination, setDestination] = useState<
    "/login" | "/(tabs)" | null
  >(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const loggedIn = await isLoggedIn();

        setDestination(
          loggedIn ? "/(tabs)" : "/login"
        );
      } catch (error) {
        console.log("Session check failed:", error);
        setDestination("/login");
      }
    };

    checkLogin();
  }, []);

  if (!destination) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#174D32" />
      </View>
    );
  }

  return <Redirect href={destination} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7EF",
    justifyContent: "center",
    alignItems: "center",
  },
});