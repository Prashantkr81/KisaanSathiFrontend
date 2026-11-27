import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { addFarm, Farm, FarmRequest, getMyFarms } from "../../src/services/farmService";
import { COLORS, RADIUS, SPACING } from "../../src/constants/theme";

function formatDate(value: string | null) {
  if (!value) return "";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function FarmsScreen() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [farmName, setFarmName] = useState("");
  const [landArea, setLandArea] = useState("");
  const [currentCrop, setCurrentCrop] = useState("");
  const [pastCrop, setPastCrop] = useState("");
  const [cropSowedDate, setCropSowedDate] = useState("");

  const loadFarms = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");
    try {
      const data = await getMyFarms();
      setFarms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load farms.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFarms(true);
    }, [loadFarms])
  );

  const resetForm = () => {
    setFarmName("");
    setLandArea("");
    setCurrentCrop("");
    setPastCrop("");
    setCropSowedDate("");
  };

  const handleAddFarm = async () => {
    const area = Number(landArea);
    const hasCurrentCrop = Boolean(currentCrop.trim());
    const hasSowedDate = Boolean(cropSowedDate.trim());
    const dateIsValid = !hasSowedDate || (
      /^\d{4}-\d{2}-\d{2}$/.test(cropSowedDate) &&
      !Number.isNaN(new Date(`${cropSowedDate}T00:00:00`).getTime())
    );

    if (!farmName.trim() || !landArea.trim()) {
      Alert.alert("Missing details", "Please fill farm name and area.");
      return;
    }
    if (!Number.isFinite(area) || area <= 0) {
      Alert.alert("Invalid area", "Enter a land area greater than zero.");
      return;
    }
    if (hasCurrentCrop && !hasSowedDate) {
      Alert.alert("Sowing date required", "Enter the sowing date when you add a current crop, or leave both fields blank.");
      return;
    }
    if (!dateIsValid || (hasSowedDate && cropSowedDate > new Date().toISOString().slice(0, 10))) {
      Alert.alert("Invalid sowing date", "Enter a valid date in YYYY-MM-DD format. It cannot be in the future.");
      return;
    }

    const payload: FarmRequest = {
      farmName: farmName.trim(),
      landArea: area,
      currentCrop: currentCrop.trim() || null,
      pastCrop: pastCrop.trim() || null,
      cropSowedDate: hasCurrentCrop && hasSowedDate ? cropSowedDate : null,
    };

    setSaving(true);
    try {
      await addFarm(payload);
      resetForm();
      setShowForm(false);
      await loadFarms(false);
      Alert.alert("Farm added", "Your farm has been saved successfully.");
    } catch (err) {
      Alert.alert("Unable to add farm", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const totalArea = farms.reduce((sum, farm) => sum + (Number(farm.landArea) || 0), 0);

  const openFarm = (farm: Farm) => {
    router.push({
      pathname: "/farm/[id]",
      params: { id: String(farm.id) },
    } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>My Farms</Text>
            <Text style={styles.subtitle}>Manage your fields and crop records</Text>
          </View>
          <Pressable
            style={styles.iconButton}
            onPress={() => {
              setRefreshing(true);
              loadFarms(false);
            }}
            accessibilityLabel="Refresh farms"
          >
            <Ionicons name="refresh-outline" size={21} color={COLORS.primary} />
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Ionicons name="business-outline" size={23} color={COLORS.primary} />
            <Text style={styles.summaryValue}>{farms.length}</Text>
            <Text style={styles.summaryLabel}>Registered farms</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="resize-outline" size={23} color={COLORS.primary} />
            <Text style={styles.summaryValue}>{totalArea.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Total hectares</Text>
          </View>
        </View>

        <Pressable style={styles.addButton} onPress={() => setShowForm((value) => !value)}>
          <Ionicons name={showForm ? "close-outline" : "add-outline"} size={21} color="#FFFFFF" />
          <Text style={styles.addButtonText}>{showForm ? "Close Form" : "Add New Farm"}</Text>
        </Pressable>

        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Farm Details</Text>
            <Field label="Farm Name *" placeholder="e.g. North Field" value={farmName} onChangeText={setFarmName} />
            <Field label="Area (Hectares) *" placeholder="e.g. 2.5" value={landArea} onChangeText={setLandArea} keyboardType="decimal-pad" />
            <Field label="Current Crop" placeholder="Leave blank if no crop is sown" value={currentCrop} onChangeText={(value) => { setCurrentCrop(value); if (!value.trim()) setCropSowedDate(""); }} />
            <Field label="Past Crop" placeholder="Leave blank if unavailable" value={pastCrop} onChangeText={setPastCrop} />
            <Field label="Crop Sowed Date" placeholder="YYYY-MM-DD (optional)" value={cropSowedDate} onChangeText={setCropSowedDate} />
            <Text style={styles.helperText}>Leave current crop and sowing date blank when the field has no crop.</Text>
            <Pressable style={[styles.saveButton, saving && styles.disabled]} onPress={handleAddFarm} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Save Farm</Text>}
            </Pressable>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Fields</Text>
          <Text style={styles.countText}>{farms.length} farms</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 32 }} />
        ) : error ? (
          <View style={styles.stateCard}>
            <Ionicons name="cloud-offline-outline" size={32} color={COLORS.error} />
            <Text style={styles.stateTitle}>Couldn't load farms</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => loadFarms()}><Text style={styles.retryText}>Try Again</Text></Pressable>
          </View>
        ) : farms.length === 0 ? (
          <View style={styles.stateCard}>
            <View style={styles.emptyIcon}><Ionicons name="leaf-outline" size={34} color={COLORS.primary} /></View>
            <Text style={styles.stateTitle}>No farms added yet</Text>
            <Text style={styles.stateText}>Add your first farm to keep its crop and sowing details in one place.</Text>
          </View>
        ) : (
          farms.map((farm) => (
            <Pressable key={farm.id} style={styles.farmCard} onPress={() => openFarm(farm)}>
              <View style={styles.farmTop}>
                <View style={styles.farmIcon}><Ionicons name="leaf-outline" size={23} color={COLORS.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.farmNameText}>{farm.farmName}</Text>
                  {farm.currentCrop ? <Text style={styles.cropText}>{farm.currentCrop}</Text> : null}
                </View>
                <View style={styles.areaBadge}>
                  <Text style={styles.areaValue}>{farm.landArea}</Text>
                  <Text style={styles.areaUnit}>acres</Text>
                </View>
                <Ionicons name="chevron-forward" size={19} color={COLORS.muted} />
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Past crop</Text>
                  <Text style={styles.metaValue}>{farm.pastCrop || ""}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Sowed on</Text>
                  <Text style={styles.metaValue}>{formatDate(farm.cropSowedDate)}</Text>
                </View>
              </View>
              <Text style={styles.viewDetails}>View farm details <Ionicons name="arrow-forward" size={12} /></Text>
            </Pressable>
          ))
        )}

        <Text style={styles.footer}>Kisaan Sathi • Smart Farming, Better Future</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "decimal-pad";
};

function Field({ label, placeholder, value, onChangeText, keyboardType = "default" }: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="words"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md, gap: 12 },
  heading: { fontSize: 27, fontWeight: "800", color: COLORS.primary },
  subtitle: { color: COLORS.muted, fontSize: 13, marginTop: 5 },
  iconButton: { width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.sage, alignItems: "center", justifyContent: "center" },
  summaryCard: { backgroundColor: COLORS.sage, borderRadius: RADIUS.lg, padding: 17, flexDirection: "row", marginBottom: 17 },
  summaryItem: { flex: 1, alignItems: "center", gap: 4 },
  summaryValue: { color: COLORS.primary, fontSize: 23, fontWeight: "800" },
  summaryLabel: { color: COLORS.muted, fontSize: 11 },
  summaryDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 10 },
  addButton: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 22 },
  addButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  formCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: 22, borderWidth: 1, borderColor: COLORS.border },
  formTitle: { color: COLORS.primary, fontSize: 19, fontWeight: "800", marginBottom: 16 },
  fieldGroup: { marginBottom: 13 },
  label: { color: COLORS.text, fontSize: 13, fontWeight: "700", marginBottom: 7 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 11, height: 47, paddingHorizontal: 13, backgroundColor: COLORS.background, color: COLORS.text, fontSize: 14 },
  helperText: { color: COLORS.muted, fontSize: 11, marginTop: -5, marginBottom: 12 },
  saveButton: { backgroundColor: COLORS.leaf, borderRadius: 11, minHeight: 48, alignItems: "center", justifyContent: "center", marginTop: 4 },
  saveButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  disabled: { opacity: 0.6 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: "800" },
  countText: { color: COLORS.muted, fontSize: 12 },
  farmCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: 15, marginBottom: 13 },
  farmTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  farmIcon: { width: 43, height: 43, borderRadius: 12, backgroundColor: COLORS.sage, alignItems: "center", justifyContent: "center" },
  farmNameText: { color: COLORS.text, fontSize: 16, fontWeight: "800" },
  cropText: { color: COLORS.leaf, fontSize: 12, fontWeight: "700", marginTop: 3 },
  areaBadge: { backgroundColor: "#FFF5D9", borderRadius: 9, paddingHorizontal: 9, paddingVertical: 6, alignItems: "center" },
  areaValue: { color: COLORS.primary, fontWeight: "800", fontSize: 14 },
  areaUnit: { color: COLORS.muted, fontSize: 9 },
  cardDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 13 },
  metaRow: { flexDirection: "row", gap: 20 },
  metaItem: { flex: 1 },
  metaLabel: { color: COLORS.muted, fontSize: 10, marginBottom: 4 },
  metaValue: { color: COLORS.text, fontSize: 12, fontWeight: "700" },
  viewDetails: { color: COLORS.primary, fontSize: 11, fontWeight: "800", textAlign: "right", marginTop: 13 },
  stateCard: { alignItems: "center", backgroundColor: COLORS.surface, padding: 25, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, backgroundColor: COLORS.sage, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  stateTitle: { color: COLORS.primary, fontSize: 16, fontWeight: "800", marginTop: 10 },
  stateText: { color: COLORS.muted, fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 7 },
  retryButton: { backgroundColor: COLORS.sage, paddingHorizontal: 20, paddingVertical: 9, borderRadius: 9, marginTop: 13 },
  retryText: { color: COLORS.primary, fontWeight: "800", fontSize: 12 },
  footer: { textAlign: "center", color: COLORS.muted, fontSize: 10, marginTop: 25 },
});
