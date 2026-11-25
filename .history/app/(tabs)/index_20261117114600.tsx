
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  COLORS,
  SPACING,
  RADIUS,
} from "../../src/constants/theme";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              GOOD MORNING 👋
            </Text>

            <Text style={styles.heading}>
              Namaste, Farmer!
            </Text>

            <View style={styles.location}>
              <Ionicons
                name="location-outline"
                size={15}
                color={COLORS.secondary}
              />

              <Text style={styles.locationText}>
                Your farming location
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.notification}>
            <Ionicons
              name="notifications-outline"
              size={23}
              color={COLORS.primary}
            />

            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Weather Card */}
        <View style={styles.weatherCard}>
          <View style={styles.weatherTop}>
            <View>
              <Text style={styles.weatherLabel}>
                TODAY'S WEATHER
              </Text>

              <Text style={styles.temperature}>
                28° C
              </Text>

              <Text style={styles.weatherDescription}>
                Partly Cloudy
              </Text>
            </View>

            <Ionicons
              name="partly-sunny-outline"
              size={65}
              color={COLORS.accent}
            />
          </View>

          <View style={styles.weatherDivider} />

          <View style={styles.weatherDetails}>
            <WeatherInfo
              icon="water-outline"
              label="Humidity"
              value="65%"
            />

            <WeatherInfo
              icon="speedometer-outline"
              label="Wind"
              value="12 km/h"
            />

            <WeatherInfo
              icon="rainy-outline"
              label="Rain"
              value="10%"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>
          What do you need today?
        </Text>

        <View style={styles.actionGrid}>
          <ActionCard
            icon="leaf-outline"
            title="Crop Advisory"
            subtitle="Find suitable crops"
            onPress={() => {}}
          />

          <ActionCard
            icon="cloud-outline"
            title="Weather"
            subtitle="Check forecast"
            onPress={() => {}}
          />

          <ActionCard
            icon="trending-up-outline"
            title="Mandi Prices"
            subtitle="Market rates"
            onPress={() => {}}
          />

          <ActionCard
            icon="medkit-outline"
            title="Crop Health"
            subtitle="Disease guidance"
            onPress={() => {}}
          />
        </View>

        {/* Recommendation Banner */}
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTag}>
              SMART FARMING
            </Text>

            <Text style={styles.recommendationTitle}>
              Grow the right crop,
              {"\n"}
              at the right time.
            </Text>

            <Text style={styles.recommendationDescription}>
              Get crop suggestions based on your
              soil and farming conditions.
            </Text>

            <TouchableOpacity
              style={styles.recommendButton}
              onPress={() => {}}
            >
              <Text style={styles.recommendButtonText}>
                Get Recommendations
              </Text>

              <Ionicons
                name="arrow-forward"
                size={16}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          <Ionicons
            name="leaf"
            size={70}
            color={COLORS.accent}
          />
        </View>

        {/* Mandi Prices */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Today's Mandi Prices
          </Text>

          <TouchableOpacity>
            <Text style={styles.viewAll}>
              View all
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mandiCard}>
          <MandiRow
            crop="Wheat"
            market="Sample market"
            price="₹2,425"
            change="+2.1%"
          />

          <View style={styles.rowDivider} />

          <MandiRow
            crop="Rice"
            market="Sample market"
            price="₹3,100"
            change="+1.4%"
          />

          <View style={styles.rowDivider} />

          <MandiRow
            crop="Mustard"
            market="Sample market"
            price="₹5,650"
            change="-0.8%"
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Kisaan Sathi • Smart Farming, Better Future
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

// Weather Information Component
function WeatherInfo({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.weatherInfo}>
      <Ionicons
        name={icon}
        size={19}
        color={COLORS.accent}
      />

      <Text style={styles.weatherInfoLabel}>
        {label}
      </Text>

      <Text style={styles.weatherInfoValue}>
        {value}
      </Text>
    </View>
  );
}

// Quick Action Card Component
function ActionCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.actionIcon}>
        <Ionicons
          name={icon}
          size={25}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.actionTitle}>
        {title}
      </Text>

      <Text style={styles.actionSubtitle}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

// Mandi Price Row Component
function MandiRow({
  crop,
  market,
  price,
  change,
}: {
  crop: string;
  market: string;
  price: string;
  change: string;
}) {
  const positive = change.startsWith("+");

  return (
    <View style={styles.mandiRow}>
      <View style={styles.cropIcon}>
        <Ionicons
          name="leaf"
          size={21}
          color={COLORS.primary}
        />
      </View>

      <View style={styles.cropDetails}>
        <Text style={styles.cropName}>
          {crop}
        </Text>

        <Text style={styles.marketName}>
          {market}
        </Text>
      </View>

      <View style={styles.priceDetails}>
        <Text style={styles.cropPrice}>
          {price}
        </Text>

        <Text
          style={[
            styles.priceChange,
            {
              color: positive
                ? COLORS.secondary
                : COLORS.error,
            },
          ]}
        >
          {change}
        </Text>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    padding: SPACING.md,
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  greeting: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.secondary,
    letterSpacing: 1.2,
  },

  heading: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.primary,
    marginTop: 5,
  },

  location: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  locationText: {
    fontSize: 12,
    color: COLORS.muted,
    marginLeft: 4,
  },

  notification: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },

  notificationDot: {
    position: "absolute",
    right: 10,
    top: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },

  weatherCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },

  weatherTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  weatherLabel: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },

  temperature: {
    color: COLORS.surface,
    fontSize: 39,
    fontWeight: "800",
    marginTop: 5,
  },

  weatherDescription: {
    color: COLORS.sage,
    fontSize: 13,
  },

  weatherDivider: {
    height: 1,
    backgroundColor: "#FFFFFF30",
    marginVertical: SPACING.md,
  },

  weatherDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  weatherInfo: {
    gap: 4,
  },

  weatherInfoLabel: {
    color: COLORS.sage,
    fontSize: 10,
  },

  weatherInfoValue: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },

  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: SPACING.lg,
  },

  actionCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: RADIUS.md,
    minHeight: 125,
  },

  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.sage,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 9,
  },

  actionTitle: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  actionSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },

  recommendationCard: {
    backgroundColor: COLORS.sage,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  recommendationContent: {
    flex: 1,
  },

  recommendationTag: {
    color: COLORS.secondary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },

  recommendationTitle: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 8,
    lineHeight: 26,
  },

  recommendationDescription: {
    color: COLORS.text,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 7,
    marginBottom: 13,
  },

  recommendButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
  },

  recommendButtonText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  viewAll: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "700",
  },

  mandiCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: 13,
  },

  mandiRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  cropIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.sage,
    alignItems: "center",
    justifyContent: "center",
  },

  cropDetails: {
    flex: 1,
    marginLeft: 12,
  },

  cropName: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  marketName: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  priceDetails: {
    alignItems: "flex-end",
  },

  cropPrice: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 13,
  },

  priceChange: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
  },

  rowDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  footer: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: "center",
    marginTop: 25,
  },
});
