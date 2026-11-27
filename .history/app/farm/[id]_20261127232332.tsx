import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Farm, getFarmById } from "../../src/services/farmService";
import { COLORS, RADIUS, SPACING } from "../../src/constants/theme";

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
}

export default function FarmDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const farmId = Number(id);
      if (!Number.isInteger(farmId) || farmId <= 0) {
        setError("Invalid farm ID.");
        setLoading(false);
        return;
      }
      try {
        const data = await getFarmById(farmId);
        if (active) setFarm(data);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unable to load farm details.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={21} color={COLORS.primary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>Farm Details</Text>
            <Text style={styles.subtitle}>Farm and crop information</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 45 }} />
        ) : error ? (
          <View style={styles.messageCard}>
            <Ionicons name="alert-circle-outline" size={30} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.backToFarms} onPress={() => router.replace("/(tabs)/farms")}>
              <Text style={styles.backToFarmsText}>Back to My Farms</Text>
            </Pressable>
          </View>
        ) : farm ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroIcon}>
                <Ionicons name="leaf" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.farmName}>{farm.farmName}</Text>
              {farm.currentCrop ? (
                <Text style={styles.currentCrop}>{farm.currentCrop}</Text>
              ) : null}
              <View style={styles.areaPill}>
                <Ionicons name="resize-outline" size={16} color={COLORS.primary} />
                <Text style={styles.areaText}>{farm.landArea} acres</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Farm Information</Text>
            <View style={styles.detailsCard}>
              <DetailRow icon="business-outline" label="Farm name" value={farm.farmName} />
              <DetailRow icon="resize-outline" label="Land area" value={`${farm.landArea} hectares`} />
              <DetailRow icon="location-outline" label="Location" value={[farm.district, farm.state].filter(Boolean).join(", ") || "Not recorded"} />
              <DetailRow icon="layers-outline" label="Soil type" value={farm.soilType || "Not recorded"} />
              <DetailRow icon="water-outline" label="Irrigation" value={farm.irrigationType || "Not recorded"} last />
            </View>

            <Text style={styles.sectionTitle}>Crop Details</Text>
            <View style={styles.detailsCard}>
              <DetailRow icon="leaf-outline" label="Current crop" value={farm.currentCrop || ""} />
              <DetailRow icon="time-outline" label="Past crop" value={farm.pastCrop || ""} />
              <DetailRow icon="calendar-outline" label="Crop sowed date" value={formatDate(farm.cropSowedDate)} last />
            </View>

            <Text style={styles.sectionTitle}>Next Activities</Text>
            <View style={styles.activitiesCard}>
              <View style={styles.comingSoonBadge}>
                <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                <Text style={styles.comingSoonText}>Coming in a future update</Text>
              </View>
              <Text style={styles.activitiesHeading}>Crop activity planner</Text>
              <Text style={styles.activitiesDescription}>
                Activity dates and reminders will be planned for this farm in a future version.
              </Text>
              <ActivityPlaceholder icon="water-outline" title="Irrigation schedule" />
              <ActivityPlaceholder icon="flask-outline" title="Fertilizer application" />
              <ActivityPlaceholder icon="cut-outline" title="Weed and field management" />
              <ActivityPlaceholder icon="notifications-outline" title="Crop monitoring reminders" last />
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value, last = false }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.detailRow, !last && styles.detailBorder]}>
      <View style={styles.detailIcon}><Ionicons name={icon} size={18} color={COLORS.primary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function ActivityPlaceholder({ icon, title, last = false }: { icon: keyof typeof Ionicons.glyphMap; title: string; last?: boolean }) {
  return (
    <View style={[styles.activityRow, !last && styles.activityBorder]}>
      <Ionicons name={icon} size={19} color={COLORS.leaf} />
      <Text style={styles.activityText}>{title}</Text>
      <Text style={styles.laterText}>Later</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 19 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.sage, alignItems: "center", justifyContent: "center" },
  heading: { fontSize: 25, fontWeight: "800", color: COLORS.primary },
  subtitle: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  heroCard: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, alignItems: "center", padding: 22, marginBottom: 23 },
  heroIcon: { width: 65, height: 65, borderRadius: 21, backgroundColor: COLORS.sage, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  farmName: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  currentCrop: { color: "#E8EDE3", fontSize: 13, marginTop: 5 },
  areaPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#E8BD55", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, marginTop: 13 },
  areaText: { color: COLORS.primary, fontWeight: "800", fontSize: 12 },
  sectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: "800", marginBottom: 11, marginTop: 2 },
  detailsCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, marginBottom: 22 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 11, paddingVertical: 13 },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  detailIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.sage, alignItems: "center", justifyContent: "center" },
  detailLabel: { color: COLORS.muted, fontSize: 10 },
  detailValue: { color: COLORS.text, fontSize: 13, fontWeight: "700", marginTop: 3 },
  activitiesCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: 15 },
  comingSoonBadge: { alignSelf: "flex-start", backgroundColor: COLORS.sage, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, flexDirection: "row", alignItems: "center", gap: 5 },
  comingSoonText: { color: COLORS.primary, fontSize: 10, fontWeight: "800" },
  activitiesHeading: { color: COLORS.text, fontSize: 16, fontWeight: "800", marginTop: 14 },
  activitiesDescription: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 9 },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 13 },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  activityText: { flex: 1, color: COLORS.text, fontSize: 12, fontWeight: "600" },
  laterText: { color: COLORS.muted, fontSize: 10 },
  messageCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: 22, alignItems: "center", gap: 10 },
  errorText: { color: COLORS.error, textAlign: "center", fontSize: 13 },
  backToFarms: { backgroundColor: COLORS.sage, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginTop: 5 },
  backToFarmsText: { color: COLORS.primary, fontSize: 12, fontWeight: "800" },
});
