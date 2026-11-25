import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { getGeminiCropRecommendations } from "../../src/services/geminiCropService";
import type { GeminiCrop } from "../../src/services/geminiCropService";

import {
  COLORS,
  SPACING,
  RADIUS,
} from "../../src/constants/theme";

import {
  getWeather,
  WeatherData,
} from "../../src/services/weatherService";

type Crop = GeminiCrop;

const FARM_DETAILS_KEY = "kisaan_sathi_farm_details";

const soilOptions = [
  "Alluvial",
  "Black",
  "Red",
  "Sandy",
  "Clayey",
  "Loamy",
];

const seasonOptions = ["Kharif", "Rabi", "Zaid"];

const irrigationOptions = [
  "Rainfed",
  "Limited irrigation",
  "Adequate irrigation",
];

const previousCropOptions = [
  "None",
  "Wheat",
  "Rice",
  "Maize",
  "Cotton",
  "Mustard",
  "Other",
];

// Initial demo rules only. These are not scientifically validated recommendations.
export default function CropsScreen() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [landArea, setLandArea] = useState("");

  const [soil, setSoil] = useState("Alluvial");
  const [season, setSeason] = useState("Rabi");
  const [irrigation, setIrrigation] = useState("Adequate irrigation");
  const [previousCrop, setPreviousCrop] = useState("None");

  const [results, setResults] = useState<Crop[] | null>(null);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");


  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");
  const [aiAdvice, setAiAdvice] = useState("");
  const [aiCaution, setAiCaution] = useState("");

  // Load previously saved farm details when this screen opens.
  useEffect(() => {
    const loadFarmDetails = async () => {
      try {
        const savedData = await AsyncStorage.getItem(FARM_DETAILS_KEY);

        if (savedData) {
          const farmDetails = JSON.parse(savedData);

          setState(farmDetails.state ?? "");
          setDistrict(farmDetails.district ?? "");
          setLandArea(farmDetails.landArea ?? "");
          setSoil(farmDetails.soil ?? "Alluvial");
          setSeason(farmDetails.season ?? "Rabi");
          setIrrigation(
            farmDetails.irrigation ?? "Adequate irrigation"
          );
          setPreviousCrop(farmDetails.previousCrop ?? "None");
        }
      } catch (error) {
        console.log("Error loading farm details:", error);
      }
    };

    loadFarmDetails();
  }, []);

  const loadWeather = async () => {
    if (!state.trim() || !district.trim()) {
      setWeatherError("Enter your state and district first.");
      setWeather(null);
      return;
    }

    try {
      setWeatherLoading(true);
      setWeatherError("");

      const data = await getWeather(district.trim(), state.trim());
      setWeather(data);
    } catch (error) {
      setWeather(null);
      setWeatherError(
        error instanceof Error
          ? error.message
          : "Unable to load weather."
      );
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleRecommendation = async () => {
    const area = Number(landArea);

    if (!state.trim() || !district.trim() || !landArea.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter your state, district and land area."
      );
      return;
    }

    if (!Number.isFinite(area) || area <= 0 || area > 100000) {
      Alert.alert(
        "Invalid land area",
        "Please enter a valid land area in acres."
      );
      return;
    }

    // Save the farmer's details locally.
    try {
      const farmDetails = {
        state: state.trim(),
        district: district.trim(),
        landArea,
        soil,
        season,
        irrigation,
        previousCrop,
      };

      await AsyncStorage.setItem(
        FARM_DETAILS_KEY,
        JSON.stringify(farmDetails)
      );
    } catch (error) {
      console.log("Error saving farm details:", error);
      Alert.alert(
        "Save warning",
        "Recommendations can still be generated, but your farm details could not be saved."
      );
    }

    const recommendations = getRecommendations(
      soil,
      season,
      irrigation
    );

    setResults(recommendations);
  };

  const resetForm = () => {
    setState("");
    setDistrict("");
    setLandArea("");
    setSoil("Alluvial");
    setSeason("Rabi");
    setIrrigation("Adequate irrigation");
    setPreviousCrop("None");
    setResults(null);
    setWeather(null);
    setWeatherError("");
    // Saved details are intentionally retained in AsyncStorage.
  };

  const clearWeatherWhenLocationChanges = () => {
    setWeather(null);
    setWeatherError("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.heading}>Crop Advisory</Text>

        <Text style={styles.subtitle}>
          Tell us about your farm to discover suitable crops.
        </Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="location-outline" size={19} />
            {" "}Farm Location
          </Text>

          <FormLabel text="State" />
          <TextInput
            style={styles.input}
            placeholder="Enter your state"
            placeholderTextColor={COLORS.muted}
            value={state}
            onChangeText={(value) => {
              setState(value);
              setResults(null);
              clearWeatherWhenLocationChanges();
            }}
          />

          <FormLabel text="District" />
          <TextInput
            style={styles.input}
            placeholder="Enter your district"
            placeholderTextColor={COLORS.muted}
            value={district}
            onChangeText={(value) => {
              setDistrict(value);
              setResults(null);
              clearWeatherWhenLocationChanges();
            }}
          />

          {/* Weather advisory */}
          <View style={styles.weatherCard}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="cloud-outline" size={19} />
              {" "}Weather Advisory
            </Text>

            <Text style={styles.weatherHint}>
              Check current weather for your entered district.
            </Text>

            <TouchableOpacity
              style={[
                styles.weatherButton,
                weatherLoading && styles.disabledButton,
              ]}
              onPress={loadWeather}
              disabled={weatherLoading}
              activeOpacity={0.85}
            >
              <Ionicons
                name="cloud-download-outline"
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.weatherButtonText}>
                {weatherLoading
                  ? "Fetching Weather..."
                  : "Check Local Weather"}
              </Text>
            </TouchableOpacity>

            {weatherError ? (
              <Text style={styles.weatherError}>{weatherError}</Text>
            ) : null}

            {weather && (
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherLocation}>
                  {weather.location}
                </Text>

                <Text style={styles.temperature}>
                  {weather.temperature}°C
                </Text>

                <View style={styles.weatherGrid}>
                  <WeatherMetric
                    icon="water-outline"
                    label="Humidity"
                    value={`${weather.humidity}%`}
                  />
                  <WeatherMetric
                    icon="rainy-outline"
                    label="Rainfall"
                    value={`${weather.precipitation} mm`}
                  />
                  <WeatherMetric
                    icon="speedometer-outline"
                    label="Wind Speed"
                    value={`${weather.windSpeed} km/h`}
                  />
                  <WeatherMetric
                    icon="umbrella-outline"
                    label="Rain Probability"
                    value={`${weather.rainProbability}%`}
                  />
                  <WeatherMetric
                    icon="thermometer-outline"
                    label="Max Temperature"
                    value={`${weather.maxTemperature}°C`}
                  />
                  <WeatherMetric
                    icon="thermometer-outline"
                    label="Min Temperature"
                    value={`${weather.minTemperature}°C`}
                  />
                </View>

                <Text style={styles.weatherDisclaimer}>
                  Weather data is approximate for the selected district,
                  not a measurement from your exact farm.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>
            <Ionicons name="leaf-outline" size={19} />
            {" "}Farm Details
          </Text>

          <FormLabel text="Land Area (Acres)" />
          <TextInput
            style={styles.input}
            placeholder="Example: 2.5"
            placeholderTextColor={COLORS.muted}
            keyboardType="decimal-pad"
            value={landArea}
            onChangeText={(value) => {
              setLandArea(value);
              setResults(null);
            }}
          />

          <FormLabel text="Soil Type" />
          <Dropdown
            value={soil}
            options={soilOptions}
            onChange={(value) => {
              setSoil(value);
              setResults(null);
            }}
          />

          <FormLabel text="Farming Season" />
          <Dropdown
            value={season}
            options={seasonOptions}
            onChange={(value) => {
              setSeason(value);
              setResults(null);
            }}
          />

          <FormLabel text="Irrigation Availability" />
          <Dropdown
            value={irrigation}
            options={irrigationOptions}
            onChange={(value) => {
              setIrrigation(value);
              setResults(null);
            }}
          />

          <FormLabel text="Previous Crop" />
          <Dropdown
            value={previousCrop}
            options={previousCropOptions}
            onChange={(value) => {
              setPreviousCrop(value);
              setResults(null);
            }}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleRecommendation}
            activeOpacity={0.85}
          >
            <Ionicons
              name="sparkles-outline"
              size={19}
              color="#FFFFFF"
            />
            <Text style={styles.submitText}>
              Get Crop Recommendations
            </Text>
          </TouchableOpacity>
        </View>

        {results && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultHeading}>
              Recommended Crops
            </Text>

            <Text style={styles.resultSubtitle}>
              Based on your selected soil and season.
            </Text>

            {results.map((crop, index) => (
              <View key={crop.name} style={styles.resultCard}>
                <View style={styles.resultTop}>
                  <View style={styles.cropIcon}>
                    <Ionicons
                      name="leaf"
                      size={25}
                      color={COLORS.primary}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.cropName}>
                      {crop.name}
                    </Text>
                    <Text style={styles.duration}>
                      {crop.duration}
                    </Text>
                  </View>

                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>
                      Option {index + 1}
                    </Text>
                  </View>
                </View>

                <Text style={styles.reason}>
                  {crop.reason}
                </Text>
              </View>
            ))}

            <View style={styles.disclaimer}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.disclaimerText}>
                These are preliminary demo suggestions, not validated
                agronomic advice. Actual suitability depends on local
                climate, soil test results, water availability and
                regional crop guidance.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetForm}
            >
              <Text style={styles.resetText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.footer}>
          Kisaan Sathi • Smart Farming, Better Future
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function FormLabel({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function Dropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={value}
        onValueChange={onChange}
        style={styles.picker}
        dropdownIconColor={COLORS.primary}
      >
        {options.map((option) => (
          <Picker.Item
            key={option}
            label={option}
            value={option}
          />
        ))}
      </Picker>
    </View>
  );
}

function WeatherMetric({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.weatherMetric}>
      <Ionicons
        name={icon}
        size={18}
        color={COLORS.primary}
      />
      <View style={styles.weatherMetricText}>
        <Text style={styles.weatherMetricLabel}>{label}</Text>
        <Text style={styles.weatherMetricValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.md,
    paddingBottom: 35,
  },
  heading: {
    fontSize: 25,
    fontWeight: "800",
    color: COLORS.primary,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 7,
    marginBottom: 20,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 15,
  },
  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
    marginTop: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    paddingHorizontal: 13,
    height: 49,
    color: COLORS.text,
    fontSize: 14,
    backgroundColor: COLORS.background,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    backgroundColor: COLORS.background,
    overflow: "hidden",
    justifyContent: "center",
    minHeight: 50,
  },
  picker: {
    color: COLORS.text,
    height: 50,
    width: "100%",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 23,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 25,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  resultsContainer: {
    marginTop: 25,
  },
  resultHeading: {
    fontSize: 21,
    fontWeight: "800",
    color: COLORS.primary,
  },
  resultSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
    marginBottom: 15,
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 15,
    marginBottom: 12,
  },
  resultTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
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
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  duration: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
  },
  rankBadge: {
    backgroundColor: COLORS.sage,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rankText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "700",
  },
  reason: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 13,
  },
  disclaimer: {
    backgroundColor: COLORS.sage,
    padding: 13,
    borderRadius: 12,
    flexDirection: "row",
    gap: 9,
    marginTop: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.text,
    lineHeight: 17,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 11,
    padding: 13,
    alignItems: "center",
    marginTop: 15,
  },
  resetText: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 13,
  },
  footer: {
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 25,
  },
  weatherCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weatherHint: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
  },
  weatherButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 5,
  },
  disabledButton: {
    opacity: 0.65,
  },
  weatherButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  weatherInfo: {
    marginTop: 16,
  },
  weatherLocation: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  temperature: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.primary,
    marginTop: 5,
    marginBottom: 12,
  },
  weatherGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  weatherMetric: {
    width: "48%",
    minHeight: 65,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  weatherMetricText: {
    flex: 1,
  },
  weatherMetricLabel: {
    color: COLORS.muted,
    fontSize: 10,
  },
  weatherMetricValue: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
  },
  weatherDisclaimer: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 12,
  },
  weatherError: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 10,
    lineHeight: 17,
  },
});
