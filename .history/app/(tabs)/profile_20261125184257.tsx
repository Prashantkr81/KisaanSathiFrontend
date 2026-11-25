
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { getMyProfile, FarmerProfile } from "../../src/services/farmerService";
import { logoutUser } from "../../src/services/authService";

const COLORS = {
  background: "#F5F7EF",
  primary: "#174D32",
  leaf: "#286B46",
  sage: "#E8EDE3",
  text: "#343B34",
  muted: "#788276",
  border: "#DFE5D9",
  white: "#FFFFFF",
  error: "#C7473A",
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || "Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

 const handleLogout = async () => {
  try {
    await logoutUser();

    console.log("JWT token removed successfully");

    router.replace("/login");
  } catch (error) {
    console.error("Logout failed:", error);
    setError("Unable to logout. Please try again.");
  }
};

  const confirmLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: handleLogout },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>My Profile</Text>

        <Pressable onPress={loadProfile} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={21} color={COLORS.primary} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 50 }}
        />
      ) : error ? (
        <View style={styles.errorCard}>
          <Ionicons
            name="alert-circle-outline"
            size={28}
            color={COLORS.error}
          />
          <Text style={styles.errorText}>{error}</Text>

          <Pressable style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>

          {error.includes("Session expired") && (
            <Pressable
            style={styles.logoutButton}
            onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={21} color={COLORS.error}/>

            <Text style={styles.logoutText}>Logout</Text></Pressable>
                    )}
        </View>
      ) : profile ? (
        <>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={42} color={COLORS.white} />
            </View>

            <Text style={styles.name}>{profile.fullName}</Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{profile.role}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Account Information</Text>

          <View style={styles.detailsCard}>
            <ProfileRow
              icon="person-outline"
              label="Full Name"
              value={profile.fullName}
            />

            <View style={styles.divider} />

            <ProfileRow
              icon="call-outline"
              label="Mobile Number"
              value={profile.phoneNumber}
            />

            <View style={styles.divider} />

            <ProfileRow
              icon="shield-checkmark-outline"
              label="Account Role"
              value={profile.role}
            />

            <View style={styles.divider} />

            <ProfileRow
              icon="finger-print-outline"
              label="Farmer ID"
              value={`KS-${profile.id}`}
            />
          </View>

          <Text style={styles.sectionTitle}>Account</Text>

          <Pressable style={styles.logoutButton} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={21} color={COLORS.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.profileRow}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
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
    marginBottom: 22,
  },
  heading: {
    fontSize: 27,
    fontWeight: "800",
    color: COLORS.primary,
  },
  refreshButton: {
    backgroundColor: COLORS.sage,
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 19,
    alignItems: "center",
    padding: 26,
    marginBottom: 25,
  },
  avatar: {
    width: 85,
    height: 85,
    borderRadius: 28,
    backgroundColor: COLORS.leaf,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },
  name: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "800",
  },
  roleBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 11,
  },
  roleText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    gap: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.sage,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    color: COLORS.muted,
    fontSize: 11,
  },
  rowValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  logoutButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "700",
  },
  errorCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 22,
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    color: COLORS.error,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.sage,
    borderRadius: 9,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryText: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});
