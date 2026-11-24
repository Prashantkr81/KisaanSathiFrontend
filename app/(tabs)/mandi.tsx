
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";

import {
  getMandiPrices,
  MandiRecord,
} from "../../src/services/mandiService";

const COLORS = {
  background: "#F5F7EF",
  primary: "#174D32",
  accent: "#E8BD55",
  leaf: "#286B46",
  sage: "#E8EDE3",
  text: "#343B34",
  muted: "#788276",
  border: "#DFE5D9",
  white: "#FFFFFF",
  error: "#C7473A",
};

const CROPS = [
  "Wheat",
  "Rice",
  "Mustard",
  "Potato",
  "Maize",
  "Tomato",
  "Onion",
  "Soyabean",
];

export default function MandiScreen() {
  const [state, setState] = useState("Uttar Pradesh");
  const [district, setDistrict] = useState("");
  const [commodity, setCommodity] = useState("Wheat");

  const [records, setRecords] = useState<MandiRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPrices = async () => {
    if (!state.trim()) {
      setError("Please enter a state.");
      return;
    }

    setLoading(true);
    setError("");
    setRecords([]);

    try {
      const data = await getMandiPrices({
        state: state.trim(),
        district: district.trim() || undefined,
        commodity,
      });

      setRecords(data);
      
      if (data.length === 0) {
        setError("No mandi records found for these filters.");
      }
    } catch (err: any) {
      setError(err.message || "Unable to fetch mandi prices.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Mandi Prices</Text>
      <Text style={styles.subtitle}>
        Explore agricultural market prices across India.
      </Text>

      {/* Information Card */}
      <View style={styles.infoCard}>
        <Ionicons
          name="trending-up-outline"
          size={28}
          color={COLORS.primary}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>
            Check market prices
          </Text>
          <Text style={styles.infoDescription}>
            Compare minimum, maximum and modal prices
            before selling your produce.
          </Text>
        </View>
      </View>

      {/* State */}
      <Text style={styles.label}>State</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter state"
        value={state}
        onChangeText={setState}
        placeholderTextColor={COLORS.muted}
      />

      {/* District */}
      <Text style={styles.label}>District (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter district"
        value={district}
        onChangeText={setDistrict}
        placeholderTextColor={COLORS.muted}
      />

      {/* Crop */}
      <Text style={styles.label}>Select Crop</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={commodity}
          onValueChange={setCommodity}
          style={styles.picker}
        >
          {CROPS.map((crop) => (
            <Picker.Item
              key={crop}
              label={crop}
              value={crop}
            />
          ))}
        </Picker>
      </View>

      {/* Search Button */}
      <Pressable
        style={[
          styles.searchButton,
          loading && { opacity: 0.6 },
        ]}
        onPress={fetchPrices}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Ionicons
              name="search-outline"
              size={19}
              color={COLORS.white}
            />
            <Text style={styles.searchButtonText}>
              Get Mandi Prices
            </Text>
          </>
        )}
      </Pressable>

      {/* Error / Empty State */}
      {error !== "" && (
        <View style={styles.errorBox}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={COLORS.error}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Results */}
      {records.length > 0 && (
        <>
          <View style={styles.resultsHeader}>
            <Text style={styles.sectionTitle}>
              Market Results
            </Text>
            <Text style={styles.resultCount}>
              {records.length} records
            </Text>
          </View>

          {records.map((item, index) => (
            <View
              key={`${item.market}-${item.arrival_date}-${index}`}
              style={styles.mandiCard}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cropIcon}>
                  <Ionicons
                    name="leaf-outline"
                    size={23}
                    color={COLORS.primary}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cropName}>
                    {item.commodity}
                  </Text>
                  <Text style={styles.mandiName}>
                    {item.market}
                  </Text>
                  <Text style={styles.location}>
                    {item.district}, {item.state}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.priceRow}>
                <View style={styles.priceColumn}>
                  <Text style={styles.priceLabel}>Min Price</Text>
                  <Text style={styles.priceValue}>
                    ₹{Number(item.min_price).toLocaleString("en-IN")}
                  </Text>
                </View>

                <View style={styles.priceColumn}>
                  <Text style={styles.priceLabel}>Modal Price</Text>
                  <Text style={styles.modalPrice}>
                    ₹{Number(item.modal_price).toLocaleString("en-IN")}
                  </Text>
                </View>

                <View style={styles.priceColumn}>
                  <Text style={styles.priceLabel}>Max Price</Text>
                  <Text style={styles.priceValue}>
                    ₹{Number(item.max_price).toLocaleString("en-IN")}
                  </Text>
                </View>
              </View>

              <View style={styles.metadata}>
                <Text style={styles.metadataText}>
                  Variety: {item.variety || "N/A"}
                </Text>
                <Text style={styles.metadataText}>
                  Date: {item.arrival_date || "N/A"}
                </Text>
              </View>

              <Text style={styles.unitText}>
                Price per quintal (₹)
              </Text>
            </View>
          ))}
        </>
      )}

      <View style={styles.disclaimer}>
        <Ionicons
          name="information-circle-outline"
          size={19}
          color={COLORS.muted}
        />
        <Text style={styles.disclaimerText}>
          Prices are sourced from Agmarknet via data.gov.in.
          Market prices are not real-time trading quotes.
          Always check the arrival date before making
          selling decisions.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 35,
  },
  heading: {
    fontSize: 27,
    fontWeight: "800",
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 6,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: COLORS.sage,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 22,
  },
  infoTitle: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  infoDescription: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },
  label: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 17,
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  picker: {
    color: COLORS.text,
    height: 52,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#FCE8E6",
    padding: 12,
    borderRadius: 10,
    marginTop: 18,
  },
  errorText: {
    color: COLORS.error,
    flex: 1,
    fontSize: 12,
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
  },
  resultCount: {
    fontSize: 12,
    color: COLORS.muted,
  },
  mandiCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cropIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: COLORS.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  cropName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  mandiName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 3,
  },
  location: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceColumn: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10,
    color: COLORS.muted,
    marginBottom: 6,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  modalPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
  },
  metadata: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 14,
    paddingTop: 10,
    gap: 5,
  },
  metadataText: {
    fontSize: 11,
    color: COLORS.muted,
  },
  unitText: {
    textAlign: "right",
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 10,
  },
  disclaimer: {
    flexDirection: "row",
    gap: 9,
    marginTop: 18,
    padding: 12,
    backgroundColor: COLORS.sage,
    borderRadius: 12,
  },
  disclaimerText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
  },
});
