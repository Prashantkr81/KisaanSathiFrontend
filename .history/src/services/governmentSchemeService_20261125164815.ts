export type PmKisanRecord = Record<string, unknown>;

export type PmKisanDatasetResponse = {
  total: number;
  count: number;
  records: PmKisanRecord[];
};

export type PmKisanRecordView = {
  state: string;
  district: string;
  subDistrict: string;
  block: string;
  village: string;
  installment: string;
  male: string;
  female: string;
  transgender: string;
  totalBeneficiaries: string;
};

const API_KEY = process.env.EXPO_PUBLIC_DATA_GOV_API_KEY;
const RESOURCE_ID = "388208c6-d82a-4190-90df-91aa2c326fec";
const API_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findValue(
  record: PmKisanRecord,
  aliases: string[]
): unknown {
  const normalizedEntries = Object.entries(record).map(([key, value]) => [
    normalizeKey(key),
    value,
  ] as const);

  for (const alias of aliases) {
    const target = normalizeKey(alias);
    const match = normalizedEntries.find(([key]) => key === target);
    if (match && match[1] !== null && match[1] !== undefined && match[1] !== "") {
      return match[1];
    }
  }

  return undefined;
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not provided";
  return String(value);
}

export function normalizePmKisanRecord(record: PmKisanRecord): PmKisanRecordView {
  const male = findValue(record, ["male", "male_beneficiaries", "male_count", "male beneficiaries"]);
  const female = findValue(record, ["female", "female_beneficiaries", "female_count", "female beneficiaries"]);
  const transgender = findValue(record, ["transgender", "transgender_beneficiaries", "transgender_count"]);
  const rawTotal = findValue(record, ["total", "total_beneficiaries", "total_beneficiary", "beneficiaries", "total_count"]);

  let total = rawTotal;
  if ((total === undefined || total === null || total === "") && (male !== undefined || female !== undefined || transgender !== undefined)) {
    const sum = [male, female, transgender].reduce((value, item) => {
      const parsed = Number(item);
      return value + (Number.isFinite(parsed) ? parsed : 0);
    }, 0);
    total = sum > 0 ? sum : undefined;
  }

  return {
    state: displayValue(findValue(record, ["state_name", "state", "state_ut", "statename"])),
    district: displayValue(findValue(record, ["district_name", "district", "districtname"])),
    subDistrict: displayValue(findValue(record, ["subdistrict_name", "sub_district_name", "sub-district_name", "subdistrict"])),
    block: displayValue(findValue(record, ["block_name", "block"])),
    village: displayValue(findValue(record, ["village_name", "village"])),
    installment: displayValue(findValue(record, ["installment", "installment_number", "installment_no", "financial_year", "fy", "period"])),
    male: displayValue(male),
    female: displayValue(female),
    transgender: displayValue(transgender),
    totalBeneficiaries: displayValue(total),
  };
}

export async function getPmKisanDatasetPreview(
  limit = 10
): Promise<PmKisanDatasetResponse> {
  if (!API_KEY) {
    throw new Error(
      "Data.gov.in API key is missing. Add EXPO_PUBLIC_DATA_GOV_API_KEY to your frontend .env file."
    );
  }

  const params = new URLSearchParams({
    "api-key": API_KEY,
    format: "json",
    limit: String(limit),
    offset: "0",
  });

  let response: Response;
  try {
    response = await fetch(`${API_URL}?${params.toString()}`);
  } catch {
    throw new Error(
      "Could not connect to data.gov.in. Check your internet connection or whether the API allows browser requests."
    );
  }

  const responseText = await response.text();
  let data: any;
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error("Government API returned an unreadable response.");
  }

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `data.gov.in returned HTTP ${response.status}. Check the API key and dataset access.`
    );
  }

  if (!Array.isArray(data?.records)) {
    throw new Error("The PM-KISAN dataset response did not contain a records array.");
  }

  return {
    total: Number(data.total ?? data.count ?? data.records.length),
    count: Number(data.count ?? data.records.length),
    records: data.records as PmKisanRecord[],
  };
}
