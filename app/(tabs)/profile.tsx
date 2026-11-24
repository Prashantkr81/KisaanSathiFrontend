
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../src/constants/theme";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.subtitle}>
        Manage your farming information.
      </Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={35} color={COLORS.primary} />
        </View>
        <Text style={styles.name}>Farmer</Text>
        <Text style={styles.location}>Location not added</Text>
      </View>

      <View style={styles.infoCard}>
        <ProfileItem icon="person-outline" label="Personal Details" />
        <ProfileItem icon="location-outline" label="Farm Location" />
        <ProfileItem icon="leaf-outline" label="Land & Soil Details" />
        <ProfileItem icon="settings-outline" label="Settings" />
      </View>
    </SafeAreaView>
  );
}

function ProfileItem({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.item}>
      <Ionicons name={icon} size={21} color={COLORS.primary} />
      <Text style={styles.itemText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.primary,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 8,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: COLORS.sage,
    padding: 25,
    borderRadius: 20,
    marginTop: 25,
  },
  avatar: {
    backgroundColor: COLORS.accent,
    width: 75,
    height: 75,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    fontSize: 19,
    fontWeight: "800",
    color: COLORS.primary,
    marginTop: 12,
  },
  location: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 15,
    borderRadius: 16,
    marginTop: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
  },
});
