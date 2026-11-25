import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS, SPACING, RADIUS } from "../../src/constants/theme";
import {
  getPmKisanDatasetPreview,
  normalizePmKisanRecord,
  type PmKisanRecord,
} from "../../src/services/governmentSchemeService";

type Scheme = {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  audience: string;
  officialUrl: string;
  officialPortalLabel: string;
};

const SCHEMES: Scheme[] = [
  {
    id: "pm-kisan",
    name: "Pradhan Mantri Kisan Samman Nidhi",
    shortName: "PM-KISAN",
    category: "Income support",
    description:
      "Central sector income-support scheme for eligible land-holding farmer families. The official portal provides farmer registration, beneficiary-list and status services.",
    audience: "Eligible land-holding farmer families",
    officialUrl: "https://pmkisan.gov.in/",
    officialPortalLabel: "PM-KISAN portal",
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana",
    shortName: "PMFBY",
    category: "Crop insurance",
    description:
      "Government crop-insurance programme. The official portal provides enrolment information, premium calculation, application-status tools and crop-loss support links.",
    audience: "Farmers growing notified crops in notified areas",
    officialUrl: "https://pmfby.gov.in/",
    officialPortalLabel: "PMFBY portal",
  },
  {
    id: "soil-health",
    name: "Soil Health Card Scheme",
    shortName: "Soil Health Card",
    category: "Soil and inputs",
    description:
      "Helps farmers access soil-test information and crop-wise nutrient and fertiliser recommendations based on soil health results.",
    audience: "Farmers seeking soil testing and nutrient guidance",
    officialUrl: "https://soilhealth.dac.gov.in/",
    officialPortalLabel: "Soil Health Card portal",
  },
  {
    id: "pmksy",
    name: "Pradhan Mantri Krishi Sinchayee Yojana",
    shortName: "PMKSY",
    category: "Irrigation",
    description:
      "Umbrella irrigation programme with components covering irrigation development and water-use efficiency, including Per Drop More Crop.",
    audience: "Farmers and implementing agencies; component rules vary",
    officialUrl: "https://pmksy.mowr.gov.in/",
    officialPortalLabel: "PMKSY portal",
  },
  {
    id: "aif",
    name: "Agriculture Infrastructure Fund",
    shortName: "AIF",
    category: "Infrastructure and finance",
    description:
      "Financing facility supporting post-harvest management infrastructure and community farming assets. The official portal provides scheme guidance and application access.",
    audience: "Farmers, FPOs, cooperatives and eligible agri-enterprises",
    officialUrl: "https://agriinfra.dac.gov.in/",
    officialPortalLabel: "AIF portal",
  },
  {
    id: "smam",
    name: "Sub-Mission on Agricultural Mechanization",
    shortName: "SMAM",
    category: "Farm machinery",
    description:
      "Supports access to agricultural machinery and mechanisation services. Application windows, targets and assistance are handled through the official DBT mechanisation portal and state processes.",
    audience: "Farmers and other eligible applicants under state targets",
    officialUrl: "https://agrimachinery.nic.in/",
    officialPortalLabel: "Agricultural Mechanization portal",
  },
];

const CATEGORIES = [
  "All",
  "Income support",
  "Crop insurance",
  "Soil and inputs",
  "Irrigation",
  "Infrastructure and finance",
  "Farm machinery",
];

const PM_KISAN_DATASET_URL =
  "https://data.gov.in/resource/village-and-gender-wise-beneficiaries-count-under-pm-kisan-scheme";
const MYSCHEME_URL = "https://www.myscheme.gov.in/";

function openOfficialUrl(url: string) {
  Linking.openURL(url).catch(() => {
    Alert.alert("Unable to open link", "Please try opening the official portal in your browser.");
  });
}

function getRecordLocation(record: PmKisanRecord) {
  const view = normalizePmKisanRecord(record);
  const parts = [view.village, view.district, view.state].filter(
    (value) => value !== "Not provided"
  );
  return parts.length ? parts.join(", ") : "Location fields not available in this record";
}

export default function SchemesScreen() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [records, setRecords] = useState<PmKisanRecord[]>([]);
  const [datasetTotal, setDatasetTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState("");

  const loadGovernmentData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setApiError("");

    try {
      const result = await getPmKisanDatasetPreview(10);
      setRecords(result.records);
      setDatasetTotal(result.total);
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : "Unable to load government data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGovernmentData();
  }, [loadGovernmentData]);

  const filteredSchemes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return SCHEMES.filter((scheme) => {
      const matchesCategory = category === "All" || scheme.category === category;
      const matchesSearch =
        !query ||
        scheme.name.toLowerCase().includes(query) ||
        scheme.shortName.toLowerCase().includes(query) ||
        scheme.description.toLowerCase().includes(query) ||
        scheme.category.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadGovernmentData(true)}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.heading}>Government Schemes</Text>
            <Text style={styles.subtitle}>
              Explore agriculture schemes and official farmer services.
            </Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="ribbon-outline" size={27} color={COLORS.primary} />
          </View>
        </View>

        <Pressable
          style={styles.mySchemeCard}
          onPress={() => openOfficialUrl(MYSCHEME_URL)}
        >
          <View style={styles.mySchemeIcon}>
            <Ionicons name="search-outline" size={23} color={COLORS.primary} />
          </View>
          <View style={styles.mySchemeText}>
            <Text style={styles.mySchemeTitle}>Find more schemes on myScheme</Text>
            <Text style={styles.mySchemeDescription}>
              Search central and state schemes and review eligibility on the Government of India portal.
            </Text>
            <Text style={styles.linkText}>Open myScheme portal  ›</Text>
          </View>
        </Pressable>

        <Text style={styles.sectionTitle}>Explore Farmer Schemes</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search scheme name or category"
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {CATEGORIES.map((item) => {
            const selected = category === item;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.categoryChip, selected && styles.categoryChipSelected]}
              >
                <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredSchemes.length ? (
          filteredSchemes.map((scheme) => (
            <View key={scheme.id} style={styles.schemeCard}>
              <View style={styles.schemeCardTop}>
                <View style={styles.schemeIcon}>
                  <Ionicons name="leaf-outline" size={22} color={COLORS.primary} />
                </View>
                <View style={styles.schemeTitleWrap}>
                  <Text style={styles.schemeShortName}>{scheme.shortName}</Text>
                  <Text style={styles.schemeName}>{scheme.name}</Text>
                </View>
              </View>
              <View style={styles.categoryLabel}>
                <Text style={styles.categoryLabelText}>{scheme.category}</Text>
              </View>
              <Text style={styles.schemeDescription}>{scheme.description}</Text>
              <View style={styles.audienceRow}>
                <Ionicons name="people-outline" size={16} color={COLORS.muted} />
                <Text style={styles.audienceText}>{scheme.audience}</Text>
              </View>
              <Pressable
                style={styles.officialButton}
                onPress={() => openOfficialUrl(scheme.officialUrl)}
              >
                <Text style={styles.officialButtonText}>Open {scheme.officialPortalLabel}</Text>
                <Ionicons name="open-outline" size={16} color={COLORS.primary} />
              </Pressable>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No schemes found</Text>
            <Text style={styles.emptyText}>Try another search or category.</Text>
          </View>
        )}

        <View style={styles.apiSectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Government Data API</Text>
            <Text style={styles.apiSubtitle}>PM-KISAN village and gender-wise beneficiary dataset</Text>
          </View>
          <View style={styles.apiBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.apiBadgeText}>API</Text>
          </View>
        </View>

        <View style={styles.apiCard}>
          <View style={styles.apiCardHeader}>
            <Ionicons name="server-outline" size={21} color={COLORS.primary} />
            <Text style={styles.apiCardTitle}>data.gov.in · Ministry of Agriculture</Text>
          </View>
          <Text style={styles.apiCardDescription}>
            This government dataset contains village-level PM-KISAN beneficiary counts by gender. The preview below shows up to 10 records returned by the API; it is not an individual farmer's payment or eligibility status.
          </Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading official dataset...</Text>
            </View>
          ) : apiError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={20} color={COLORS.error} />
              <Text style={styles.errorText}>{apiError}</Text>
              <Pressable onPress={() => loadGovernmentData()} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.datasetMetaRow}>
                <Text style={styles.datasetMetaLabel}>Records in API response</Text>
                <Text style={styles.datasetMetaValue}>{records.length}</Text>
              </View>
              <Text style={styles.datasetNote}>
                Dataset total reported by API: {datasetTotal.toLocaleString("en-IN")} records. Preview is limited to the first 10 records.
              </Text>
              {records.map((record, index) => {
                const item = normalizePmKisanRecord(record);
                return (
                  <View key={`pmkisan-${index}`} style={styles.recordCard}>
                    <Text style={styles.recordTitle}>Record {index + 1}</Text>
                    <Text style={styles.recordLocation}>{getRecordLocation(record)}</Text>
                    <View style={styles.recordStats}>
                      <RecordStat label="Male" value={item.male} />
                      <RecordStat label="Female" value={item.female} />
                      <RecordStat label="Other" value={item.transgender} />
                      <RecordStat label="Total" value={item.totalBeneficiaries} />
                    </View>
                    <Text style={styles.recordPeriod}>Installment / period: {item.installment}</Text>
                  </View>
                );
              })}
            </>
          )}

          <Pressable
            style={styles.refreshApiButton}
            onPress={() => loadGovernmentData(true)}
            disabled={refreshing || loading}
          >
            <Ionicons name="refresh-outline" size={17} color={COLORS.primary} />
            <Text style={styles.refreshApiText}>Refresh government data</Text>
          </Pressable>
          <Pressable onPress={() => openOfficialUrl(PM_KISAN_DATASET_URL)}>
            <Text style={styles.sourceLink}>View original dataset on data.gov.in  ›</Text>
          </Pressable>
        </View>

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={19} color={COLORS.primary} />
          <Text style={styles.disclaimerText}>
            Scheme summaries are for discovery only. Eligibility, benefits, application windows and required documents can change and may depend on state notifications. Confirm all details on the linked official portal before applying.
          </Text>
        </View>

        <Text style={styles.footer}>Kisaan Sathi • Government information directory</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function RecordStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.recordStat}>
      <Text style={styles.recordStatLabel}>{label}</Text>
      <Text style={styles.recordStatValue} numberOfLines={1}>{value}</Text>
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
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  heading: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: "800",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 6,
    lineHeight: 19,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: COLORS.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  mySchemeCard: {
    flexDirection: "row",
    gap: 12,
    padding: 15,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.sage,
    marginBottom: 23,
  },
  mySchemeIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  mySchemeText: {
    flex: 1,
  },
  mySchemeTitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  mySchemeDescription: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    marginTop: 7,
  },
  categoryList: {
    gap: 8,
    paddingVertical: 13,
  },
  categoryChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "600",
  },
  categoryTextSelected: {
    color: COLORS.white,
  },
  schemeCard: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  schemeCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  schemeIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: COLORS.sage,
    alignItems: "center",
    justifyContent: "center",
  },
  schemeTitleWrap: {
    flex: 1,
  },
  schemeShortName: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "800",
  },
  schemeName: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17,
  },
  categoryLabel: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.sage,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 12,
  },
  categoryLabelText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "700",
  },
  schemeDescription: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 11,
  },
  audienceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
  },
  audienceText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 11,
  },
  officialButton: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  officialButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  emptyCard: {
    padding: 22,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: "center",
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },
  apiSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 10,
    gap: 10,
  },
  apiSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  apiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.sage,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.leaf,
  },
  apiBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
  },
  apiCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: 15,
  },
  apiCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  apiCardTitle: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
    flex: 1,
  },
  apiCardDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 9,
  },
  loadingBox: {
    paddingVertical: 24,
    alignItems: "center",
    gap: 9,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 11,
  },
  errorBox: {
    backgroundColor: "#FCE8E6",
    borderRadius: 10,
    padding: 12,
    marginTop: 13,
    gap: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 11,
    lineHeight: 17,
  },
  retryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  retryText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  datasetMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  datasetMetaLabel: {
    color: COLORS.muted,
    fontSize: 11,
  },
  datasetMetaValue: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  datasetNote: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 9,
  },
  recordCard: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 11,
    marginTop: 9,
  },
  recordTitle: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  recordLocation: {
    color: COLORS.text,
    fontSize: 11,
    marginTop: 4,
  },
  recordStats: {
    flexDirection: "row",
    gap: 7,
    marginTop: 10,
  },
  recordStat: {
    flex: 1,
    minWidth: 0,
  },
  recordStatLabel: {
    color: COLORS.muted,
    fontSize: 9,
  },
  recordStatValue: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
  },
  recordPeriod: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 8,
  },
  refreshApiButton: {
    marginTop: 14,
    padding: 11,
    borderRadius: 10,
    backgroundColor: COLORS.sage,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },
  refreshApiText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  sourceLink: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },
  disclaimer: {
    flexDirection: "row",
    gap: 9,
    backgroundColor: COLORS.sage,
    borderRadius: RADIUS.md,
    padding: 13,
    marginTop: 17,
  },
  disclaimerText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 10,
    lineHeight: 16,
  },
  footer: {
    textAlign: "center",
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 24,
  },
});
