
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  Farm,
  FarmRequest,
  getMyFarms,
  addFarm,
} from "../../src/services/farmService";

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

export default function FarmsScreen() {
  const [farms, setFarms] = useState<Farm[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [landArea, setLandArea] = useState("");
  const [soilType, setSoilType] = useState("");
  const [irrigationType, setIrrigationType] = useState("");
  const [previousCrop, setPreviousCrop] = useState("");

  const loadFarms = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyFarms();
      setFarms(data);
    } catch (err: any) {
      setError(err.message || "Unable to load farms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const resetForm = () => {
    setState("");
    setDistrict("");
    setLandArea("");
    setSoilType("");
    setIrrigationType("");
    setPreviousCrop("");
  };

  const handleAddFarm = async () => {
    const area = Number(landArea);

    if (
      !state.trim() ||
      !district.trim() ||
      !landArea.trim() ||
      !soilType.trim() ||
      !irrigationType.trim()
    ) {
      Alert.alert("Missing Details", "Please fill all required fields.");
      return;
    }

    if (!Number.isFinite(area) || area <= 0) {
      Alert.alert("Invalid Land Area", "Enter a valid area greater than zero.");
      return;
    }

    const farm: FarmRequest = {
      state: state.trim(),
      district: district.trim(),
      landArea: area,
      soilType: soilType.trim(),
      irrigationType: irrigationType.trim(),
      previousCrop: previousCrop.trim() || null,
    };

    setSaving(true);

    try {
      await addFarm(farm);

      resetForm();
      setShowForm(false);

      Alert.alert("Success", "Your farm has been added successfully.");

      await loadFarms();
    } catch (err: any) {
      Alert.alert("Unable to Add Farm", err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const totalArea = farms.reduce(
    (total, farm) => total + farm.landArea,
    0
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>My Farms</Text>
          <Text style={styles.subtitle}>
            Manage your agricultural land
          </Text>
        </View>

        <Pressable style={styles.refreshButton} onPress={loadFarms}>
          <Ionicons
            name="refresh-outline"
            size={22}
            color={COLORS.primary}
          />
        </Pressable>
      </View>

      {/* Farm Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Ionicons name="business-outline" size={25} color={COLORS.primary} />
          <Text style={styles.summaryValue}>{farms.length}</Text>
          <Text style={styles.summaryLabel}>Total Farms</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Ionicons name="resize-outline" size={25} color={COLORS.primary} />
          <Text style={styles.summaryValue}>
            {totalArea.toFixed(2)}
          </Text>
          <Text style={styles.summaryLabel}>Total Hectares</Text>
        </View>
      </View>

      {/* Add Farm Button */}
      <Pressable
        style={styles.addButton}
        onPress={() => setShowForm(!showForm)}
      >
        <Ionicons
          name={showForm ? "close-circle-outline" : "add-circle-outline"}
          size={21}
          color={COLORS.white}
        />
        <Text style={styles.addButtonText}>
          {showForm ? "Cancel" : "Add New Farm"}
        </Text>
      </Pressable>

      {/* Add Farm Form */}
      {showForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Farm Details</Text>

          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter state"
            value={state}
            onChangeText={setState}
          />

          <Text style={styles.label}>District *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter district"
            value={district}
            onChangeText={setDistrict}
          />

          <Text style={styles.label}>Land Area (Hectares) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: 2.5"
            value={landArea}
            onChangeText={setLandArea}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Soil Type *</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: Loamy"
            value={soilType}
            onChangeText={setSoilType}
          />

          <Text style={styles.label}>Irrigation Method *</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: Tube Well"
            value={irrigationType}
            onChangeText={setIrrigationType}
          />

          <Text style={styles.label}>Previous Crop</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: Wheat"
            value={previousCrop}
            onChangeText={setPreviousCrop}
          />

          <Pressable
            style={[styles.saveButton, saving && { opacity: 0.6 }]}
            onPress={handleAddFarm}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Farm</Text>
            )}
          </Pressable>
        </View>
      )}

      {/* Error */}
      {error !== "" && (
        <View style={styles.errorCard}>
          <Ionicons
            name="alert-circle-outline"
            color={COLORS.error}
            size={21}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Farm List */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Your Registered Farms</Text>
        <Text style={styles.farmCount}>{farms.length} farms</Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 30 }}
        />
      ) : farms.length === 0 ? (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="leaf-outline"
              color={COLORS.primary}
              size={38}
            />
          </View>

          <Text style={styles.emptyTitle}>No Farms Added Yet</Text>
          <Text style={styles.emptyDescription}>
            Add your agricultural land details to manage your farms
            and receive crop recommendations.
          </Text>
        </View>
      ) : (
        farms.map((farm) => (
          <View key={farm.id} style={styles.farmCard}>
            <View style={styles.farmHeader}>
              <View style={styles.farmIcon}>
                <Ionicons
                  name="leaf"
                  size={23}
                  color={COLORS.primary}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.farmName}>
                  Farm #{farm.id}
                </Text>
                <Text style={styles.farmLocation}>
                  {farm.district}, {farm.state}
                </Text>
              </View>

              <View style={styles.areaBadge}>
                <Text style={styles.areaValue}>
                  {farm.landArea}
                </Text>
                <Text style={styles.areaUnit}>hectares</Text>
              </View>
            </View>

            <View style={styles.farmDivider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Soil Type</Text>
              <Text style={styles.detailValue}>{farm.soilType}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Irrigation</Text>
              <Text style={styles.detailValue}>
                {farm.irrigationType}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Previous Crop</Text>
              <Text style={styles.detailValue}>
                {farm.previousCrop || "Not specified"}
              </Text>
            </View>
          </View>
        ))
      )}
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  heading: {
    fontSize: 27,
    fontWeight: "800",
    color: COLORS.primary,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 5,
  },
  refreshButton: {
    width: 43,
    height: 43,
    backgroundColor: COLORS.sage,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryCard: {
    backgroundColor: COLORS.sage,
    borderRadius: 16,
    padding: 19,
    flexDirection: "row",
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
  summaryValue: {
    color: COLORS.primary,
    fontSize: 23,
    fontWeight: "800",
  },
  summaryLabel: {
    color: COLORS.muted,
    fontSize: 11,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 13,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    marginBottom: 20,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 17,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 18,
  },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
  },
  input: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 11,
    padding: 13,
    color: COLORS.text,
    marginBottom: 16,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: COLORS.leaf,
    padding: 15,
    alignItems: "center",
    borderRadius: 12,
    marginTop: 5,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 15,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  farmCount: {
    fontSize: 12,
    color: COLORS.muted,
  },
  farmCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  farmHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  farmIcon: {
    backgroundColor: COLORS.sage,
    height: 45,
    width: 45,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  farmName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  farmLocation: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },
  areaBadge: {
    backgroundColor: "#FFF5D9",
    borderRadius: 10,
    padding: 9,
    alignItems: "center",
  },
  areaValue: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 16,
  },
  areaUnit: {
    color: COLORS.muted,
    fontSize: 9,
  },
  farmDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  detailLabel: {
    color: COLORS.muted,
    fontSize: 12,
  },
  detailValue: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 12,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 26,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: COLORS.sage,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  emptyTitle: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "800",
  },
  emptyDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },
  errorCard: {
    backgroundColor: "#FCE8E6",
    padding: 13,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 18,
  },
  errorText: {
    color: COLORS.error,
    flex: 1,
    fontSize: 12,
  },
});
