
import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { getMandiPrices } from "../src/services/mandiService";

export default function MandiTest() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [error, setError] = useState("");

  const testAPI = async () => {
    setLoading(true);
    setError("");
    setRecords([]);

    try {
      const data = await getMandiPrices({
        state: "Uttar Pradesh",
        commodity: "Wheat",
      });

      console.log("API RESPONSE:", data);
      setRecords(data);
    } catch (err: any) {
      console.log("API ERROR:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Mandi API Test</Text>

      <Text style={styles.subtitle}>
        Testing Agmarknet API - Uttar Pradesh / Wheat
      </Text>

      <Button
        title="Test Mandi API"
        onPress={testAPI}
        disabled={loading}
      />

      {loading && (
        <ActivityIndicator
          size="large"
          color="#174D32"
          style={{ marginTop: 20 }}
        />
      )}

      {error !== "" && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}

      <Text style={styles.count}>
        Records received: {records.length}
      </Text>

      {records.map((item, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.crop}>{item.commodity}</Text>
          <Text>Market: {item.market}</Text>
          <Text>District: {item.district}</Text>
          <Text>State: {item.state}</Text>
          <Text>Min Price: ₹{item.min_price}</Text>
          <Text>Max Price: ₹{item.max_price}</Text>
          <Text>Modal Price: ₹{item.modal_price}</Text>
          <Text>Arrival Date: {item.arrival_date}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F5F7EF",
  },
  heading: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#174D32",
    marginBottom: 8,
  },
  subtitle: {
    color: "#788276",
    marginBottom: 20,
  },
  count: {
    fontSize: 17,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#174D32",
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    gap: 5,
  },
  crop: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#174D32",
  },
  errorBox: {
    backgroundColor: "#FCE8E6",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  errorText: {
    color: "#C7473A",
  },
});
