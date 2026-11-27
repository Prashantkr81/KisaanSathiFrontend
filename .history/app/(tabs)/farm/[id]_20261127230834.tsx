import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS, RADIUS, SPACING } from "../../../src/constants/theme";
import {
  CropActivityStatus,
  CropScheduleResult,
  ScheduledActivity,
  getFarmActivities,
} from "../../../src/services/cropActivityService";
import { Farm, getFarmById } from "../../../src/services/farmService";

type ActivityFilter = "ALL" | CropActivityStatus;

function formatDate(value: string | null | undefined, long = true) {
  if (!value) return "Not recorded";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(
    "en-IN",
    long
      ? { day: "2-digit", month: "long", year: "numeric" }
      : { day: "numeric", month: "short" },
  );
}

function formatDateRange(start: string, end: string) {
  if (start === end) return formatDate(start, false);
  return `${formatDate(start, false)} – ${formatDate(end, false)}`;
}

function statusLabel(status: string) {
  switch (status?.toUpperCase()) {
    case "UPCOMING":
      return "Upcoming";
    case "IN_WINDOW":
      return "In progress";
    case "PAST_WINDOW":
      return "Past window";
    default:
      return status || "Scheduled";
  }
}

function referenceLabel(value: string | null | undefined) {
  switch (value?.toUpperCase()) {
    case "SOWING":
      return "sowing date";
    case "TRANSPLANTING":
      return "transplanting date";
    case "PLANTING":
      return "planting date";
    case "CROP_START":
      return "crop start date";
    default:
      return "crop start date";
  }
}

function categoryIcon(category: string): keyof typeof Ionicons.glyphMap {
  const value = category?.toLowerCase() || "";
  if (value.includes("irrigation") || value.includes("water"))
    return "water-outline";
  if (value.includes("harvest")) return "basket-outline";
  if (value.includes("weed") || value.includes("management"))
    return "leaf-outline";
  if (value.includes("fertil")) return "flask-outline";
  if (value.includes("pest") || value.includes("disease")) return "bug-outline";
  if (value.includes("monitor") || value.includes("inspection"))
    return "eye-outline";
  return "calendar-outline";
}

const handleBack = () => {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace("/(tabs)/farms");
  }
};
function statusColors(status: string) {
  switch (status?.toUpperCase()) {
    case "IN_WINDOW":
      return {
        background: "#FFF3CF",
        text: "#795B12",
        icon: "time-outline" as const,
      };
    case "PAST_WINDOW":
      return {
        background: "#EFF1ED",
        text: "#697267",
        icon: "checkmark-circle-outline" as const,
      };
    default:
      return {
        background: COLORS.sage,
        text: COLORS.primary,
        icon: "calendar-outline" as const,
      };
  }
}

export default function FarmDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [schedule, setSchedule] = useState<CropScheduleResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [error, setError] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [filter, setFilter] = useState<ActivityFilter>("ALL");

  const farmId = Number(id);

  const loadSchedule = useCallback(async (targetFarm: Farm) => {
    if (!targetFarm.currentCrop?.trim()) {
      setSchedule(null);
      setScheduleError("");
      return;
    }

    if (!targetFarm.cropSowedDate) {
      setSchedule(null);
      setScheduleError("");
      return;
    }

    setScheduleLoading(true);
    setScheduleError("");

    try {
      const result = await getFarmActivities(targetFarm.id);
      setSchedule(result);
    } catch (err) {
      setSchedule(null);
      setScheduleError(
        err instanceof Error ? err.message : "Unable to load crop activities.",
      );
    } finally {
      setScheduleLoading(false);
    }
  }, []);

  const loadFarm = useCallback(async () => {
    if (!Number.isInteger(farmId) || farmId <= 0) {
      setError("Invalid farm ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getFarmById(farmId);
      setFarm(data);
      await loadSchedule(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load farm details.",
      );
    } finally {
      setLoading(false);
    }
  }, [farmId, loadSchedule]);

  useEffect(() => {
    loadFarm();
  }, [loadFarm]);

  const activities = schedule?.activities || [];

  const counts = useMemo(
    () => ({
      upcoming: activities.filter(
        (item) => item.status?.toUpperCase() === "UPCOMING",
      ).length,
      active: activities.filter(
        (item) => item.status?.toUpperCase() === "IN_WINDOW",
      ).length,
      past: activities.filter(
        (item) => item.status?.toUpperCase() === "PAST_WINDOW",
      ).length,
    }),
    [activities],
  );

  const filteredActivities = useMemo(() => {
    if (filter === "ALL") return activities;
    return activities.filter((item) => item.status?.toUpperCase() === filter);
  }, [activities, filter]);

  const retrySchedule = () => {
    if (farm) loadSchedule(farm);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={21} color={COLORS.primary} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>Farm Details</Text>
            <Text style={styles.subtitle}>
              Farm information and crop calendar
            </Text>
          </View>
          {!loading && !!farm && (
            <Pressable style={styles.refreshButton} onPress={loadFarm}>
              <Ionicons
                name="refresh-outline"
                size={19}
                color={COLORS.primary}
              />
            </Pressable>
          )}
        </View>

        {loading ? (
          <ActivityIndicator
            color={COLORS.primary}
            size="large"
            style={{ marginTop: 45 }}
          />
        ) : error ? (
          <View style={styles.messageCard}>
            <Ionicons
              name="alert-circle-outline"
              size={30}
              color={COLORS.error}
            />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.primaryButton} onPress={loadFarm}>
              <Text style={styles.primaryButtonText}>Try again</Text>
            </Pressable>
            <Pressable
              style={styles.backToFarms}
              onPress={() => router.replace("/(tabs)/farms")}
            >
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
              ) : (
                <Text style={styles.heroHint}>No current crop added</Text>
              )}
              <View style={styles.areaPill}>
                <Ionicons
                  name="resize-outline"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.areaText}>{farm.landArea} hectares</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Farm Information</Text>
            <View style={styles.detailsCard}>
              <DetailRow
                icon="business-outline"
                label="Farm name"
                value={farm.farmName}
              />
              <DetailRow
                icon="resize-outline"
                label="Land area"
                value={`${farm.landArea} hectares`}
              />
              <DetailRow
                icon="location-outline"
                label="Location"
                value={
                  [farm.district, farm.state].filter(Boolean).join(", ") ||
                  "Not recorded"
                }
              />
              <DetailRow
                icon="layers-outline"
                label="Soil type"
                value={farm.soilType || "Not recorded"}
              />
              <DetailRow
                icon="water-outline"
                label="Irrigation"
                value={farm.irrigationType || "Not recorded"}
                last
              />
            </View>

            <Text style={styles.sectionTitle}>Crop Details</Text>
            <View style={styles.detailsCard}>
              <DetailRow
                icon="leaf-outline"
                label="Current crop"
                value={farm.currentCrop || "Not added"}
              />
              <DetailRow
                icon="time-outline"
                label="Past crop"
                value={farm.pastCrop || "Not recorded"}
              />
              <DetailRow
                icon="calendar-outline"
                label="Crop start date"
                value={formatDate(farm.cropSowedDate)}
                last
              />
            </View>

            <View style={styles.sectionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Crop Activity Calendar</Text>
                <Text style={styles.sectionSubtitle}>
                  Activities generated for this farm
                </Text>
              </View>
              {farm.currentCrop && farm.cropSowedDate ? (
                <Pressable
                  style={styles.smallRefresh}
                  onPress={retrySchedule}
                  disabled={scheduleLoading}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={17}
                    color={COLORS.primary}
                  />
                  <Text style={styles.smallRefreshText}>Refresh</Text>
                </Pressable>
              ) : null}
            </View>

            {!farm.currentCrop?.trim() ? (
              <PlannerMessage
                icon="leaf-outline"
                title="Add a current crop"
                message="Add the crop being grown on this farm to generate its activity calendar."
              />
            ) : !farm.cropSowedDate ? (
              <PlannerMessage
                icon="calendar-outline"
                title="Crop start date missing"
                message="Add the sowing, planting or transplanting date to calculate activity dates."
              />
            ) : scheduleLoading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator color={COLORS.primary} size="large" />
                <Text style={styles.loadingText}>
                  Generating crop activity calendar…
                </Text>
              </View>
            ) : scheduleError ? (
              <View style={styles.messageCard}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={29}
                  color={COLORS.error}
                />
                <Text style={styles.errorText}>{scheduleError}</Text>
                <Pressable style={styles.primaryButton} onPress={retrySchedule}>
                  <Text style={styles.primaryButtonText}>Retry activities</Text>
                </Pressable>
              </View>
            ) : schedule ? (
              <>
                <View style={styles.scheduleIntro}>
                  <View style={styles.scheduleCropIcon}>
                    <Ionicons
                      name="leaf-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.scheduleCrop}>
                      {schedule.crop || farm.currentCrop}
                    </Text>
                    <Text style={styles.scheduleBasis}>
                      Calculated from {referenceLabel(schedule.dayCountFrom)} ·{" "}
                      {formatDate(schedule.referenceDate || farm.cropSowedDate)}
                    </Text>
                  </View>
                  <View style={styles.activityCountPill}>
                    <Text style={styles.activityCountText}>
                      {activities.length}
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <StatusStat
                    count={counts.upcoming}
                    label="Upcoming"
                    tone="upcoming"
                  />
                  <StatusStat
                    count={counts.active}
                    label="In progress"
                    tone="active"
                  />
                  <StatusStat
                    count={counts.past}
                    label="Past window"
                    tone="past"
                  />
                </View>

                <View style={styles.filterRow}>
                  <FilterChip
                    label={`All (${activities.length})`}
                    value="ALL"
                    selected={filter}
                    onPress={setFilter}
                  />
                  <FilterChip
                    label="Upcoming"
                    value="UPCOMING"
                    selected={filter}
                    onPress={setFilter}
                  />
                  <FilterChip
                    label="Active"
                    value="IN_WINDOW"
                    selected={filter}
                    onPress={setFilter}
                  />
                  <FilterChip
                    label="Past"
                    value="PAST_WINDOW"
                    selected={filter}
                    onPress={setFilter}
                  />
                </View>

                {filteredActivities.length > 0 ? (
                  <View style={styles.timelineList}>
                    {filteredActivities.map((activity, index) => (
                      <ActivityCard
                        key={`${activity.id}-${index}`}
                        activity={activity}
                        last={index === filteredActivities.length - 1}
                        reference={schedule.dayCountFrom}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.noActivitiesCard}>
                    <Ionicons
                      name="calendar-clear-outline"
                      size={25}
                      color={COLORS.muted}
                    />
                    <Text style={styles.noActivitiesTitle}>
                      No activities in this filter
                    </Text>
                    <Text style={styles.noActivitiesText}>
                      Choose another filter to see the crop activities.
                    </Text>
                  </View>
                )}

                <Text style={styles.disclaimer}>
                  These are indicative planning windows. Actual farm operations
                  should follow local agricultural advice, crop condition and
                  weather.
                </Text>
              </>
            ) : (
              <PlannerMessage
                icon="calendar-outline"
                title="No activity calendar available"
                message={
                  schedule?.message ||
                  "The backend did not return an activity schedule for this crop."
                }
              />
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  icon,
  label,
  value,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && styles.detailBorder]}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function PlannerMessage({
  icon,
  title,
  message,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}) {
  return (
    <View style={styles.plannerMessage}>
      <View style={styles.plannerMessageIcon}>
        <Ionicons name={icon} size={25} color={COLORS.primary} />
      </View>
      <Text style={styles.plannerMessageTitle}>{title}</Text>
      <Text style={styles.plannerMessageText}>{message}</Text>
    </View>
  );
}

function StatusStat({
  count,
  label,
  tone,
}: {
  count: number;
  label: string;
  tone: "upcoming" | "active" | "past";
}) {
  const colorSet =
    tone === "active"
      ? { background: "#FFF3CF", color: "#795B12" }
      : tone === "past"
        ? { background: "#EFF1ED", color: "#697267" }
        : { background: COLORS.sage, color: COLORS.primary };

  return (
    <View style={[styles.statCard, { backgroundColor: colorSet.background }]}>
      <Text style={[styles.statNumber, { color: colorSet.color }]}>
        {count}
      </Text>
      <Text style={[styles.statLabel, { color: colorSet.color }]}>{label}</Text>
    </View>
  );
}

function FilterChip({
  label,
  value,
  selected,
  onPress,
}: {
  label: string;
  value: ActivityFilter;
  selected: ActivityFilter;
  onPress: (value: ActivityFilter) => void;
}) {
  const active = selected === value;
  return (
    <Pressable
      onPress={() => onPress(value)}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Text
        style={[styles.filterChipText, active && styles.filterChipTextActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ActivityCard({
  activity,
  last,
  reference,
}: {
  activity: ScheduledActivity;
  last: boolean;
  reference: string | null;
}) {
  const colors = statusColors(activity.status);

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineRail}>
        <View style={styles.timelineDot} />
        {!last && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.activityCard}>
        <View style={styles.activityTopRow}>
          <View style={styles.activityCategoryIcon}>
            <Ionicons
              name={categoryIcon(activity.category)}
              size={19}
              color={COLORS.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.activityCategory}>
              {activity.category || "Crop activity"}
            </Text>
            <Text style={styles.activityName}>{activity.name}</Text>
          </View>
        </View>

        <View style={styles.activityMetaRow}>
          <Ionicons name="calendar-outline" size={15} color={COLORS.muted} />
          <Text style={styles.activityDate}>
            {formatDateRange(activity.startDate, activity.endDate)}
          </Text>
        </View>

        <Text style={styles.activityDayRange}>
          Day {activity.startDayOffset}–{activity.endDayOffset} from{" "}
          {referenceLabel(reference)}
        </Text>

        {activity.description ? (
          <Text style={styles.activityDescription}>{activity.description}</Text>
        ) : null}

        <View style={styles.activityBottomRow}>
          <View
            style={[styles.statusBadge, { backgroundColor: colors.background }]}
          >
            <Ionicons name={colors.icon} size={13} color={colors.text} />
            <Text style={[styles.statusText, { color: colors.text }]}>
              {statusLabel(activity.status)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: 42 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 19,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: { fontSize: 25, fontWeight: "800", color: COLORS.primary },
  subtitle: { color: COLORS.muted, fontSize: 12, marginTop: 3 },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    padding: 22,
    marginBottom: 23,
  },
  heroIcon: {
    width: 65,
    height: 65,
    borderRadius: 21,
    backgroundColor: COLORS.sage,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  farmName: { color: "#FFFFFF", fontSize: 22, fontWeight: "800" },
  currentCrop: { color: "#E8EDE3", fontSize: 13, marginTop: 5 },
  heroHint: { color: "#E8EDE3", fontSize: 12, marginTop: 5 },
  areaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8BD55",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 13,
  },
  areaText: { color: COLORS.primary, fontWeight: "800", fontSize: 12 },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 5,
    marginTop: 2,
  },
  sectionSubtitle: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 11,
    gap: 10,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    marginBottom: 22,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 13,
  },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: { color: COLORS.muted, fontSize: 10 },
  detailValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },
  smallRefresh: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.sage,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  smallRefreshText: { color: COLORS.primary, fontWeight: "700", fontSize: 11 },
  scheduleIntro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 13,
    marginBottom: 12,
  },
  scheduleCropIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleCrop: { fontSize: 15, color: COLORS.text, fontWeight: "800" },
  scheduleBasis: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  activityCountPill: {
    minWidth: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
  },
  activityCountText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 13 },
  statCard: {
    flex: 1,
    borderRadius: 13,
    paddingVertical: 11,
    paddingHorizontal: 7,
    alignItems: "center",
  },
  statNumber: { fontSize: 20, fontWeight: "800" },
  statLabel: {
    fontSize: 9,
    fontWeight: "700",
    marginTop: 3,
    textAlign: "center",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginBottom: 13,
  },
  filterChip: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: { color: COLORS.text, fontSize: 10, fontWeight: "700" },
  filterChipTextActive: { color: "#FFFFFF" },
  timelineList: { gap: 0 },
  timelineItem: { flexDirection: "row", alignItems: "stretch" },
  timelineRail: { width: 23, alignItems: "center" },
  timelineDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.leaf,
    marginTop: 17,
    zIndex: 1,
  },
  timelineLine: {
    position: "absolute",
    top: 27,
    bottom: -1,
    width: 2,
    backgroundColor: COLORS.border,
  },
  activityCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 13,
    marginBottom: 11,
  },
  activityTopRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  activityCategoryIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: COLORS.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  activityCategory: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  activityName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 3,
    lineHeight: 18,
  },
  activityMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  activityDate: { color: COLORS.primary, fontSize: 11, fontWeight: "800" },
  activityDayRange: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  activityDescription: {
    color: COLORS.text,
    opacity: 0.82,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 9,
  },
  activityBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 11,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: { fontSize: 10, fontWeight: "800" },
  disclaimer: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
    marginLeft: 23,
  },
  plannerMessage: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    padding: 23,
  },
  plannerMessageIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: COLORS.sage,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },
  plannerMessageTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  plannerMessageText: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 6,
  },
  loadingCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 25,
    alignItems: "center",
    gap: 10,
  },
  loadingText: { color: COLORS.muted, fontSize: 12, marginTop: 8 },
  messageCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    color: COLORS.error,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 3,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
  backToFarms: {
    backgroundColor: COLORS.sage,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 4,
  },
  backToFarmsText: { color: COLORS.primary, fontSize: 12, fontWeight: "800" },
  noActivitiesCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    alignItems: "center",
    padding: 23,
  },
  noActivitiesTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 8,
  },
  noActivitiesText: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
});
