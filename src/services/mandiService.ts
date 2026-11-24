
const API_KEY = process.env.EXPO_PUBLIC_DATA_GOV_API_KEY;

const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

const BASE_URL = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

export type MandiRecord = {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
};

type MandiApiResponse = {
  total: number;
  count: number;
  records: MandiRecord[];
};

type MandiFilters = {
  state: string;
  district?: string;
  commodity?: string;
};

export async function getMandiPrices(
  filters: MandiFilters
): Promise<MandiRecord[]> {
  if (!API_KEY) {
    throw new Error("API key missing. Check your .env file.");
  }

  const params = new URLSearchParams();

  params.append("api-key", API_KEY);
  params.append("format", "json");
  params.append("limit", "100");
  params.append("offset", "0");

  params.append("filters[state.keyword]", filters.state);

  if (filters.district) {
    params.append("filters[district]", filters.district);
  }

  if (filters.commodity) {
    params.append("filters[commodity]", filters.commodity);
  }

  const url = `${BASE_URL}?${params.toString()}`;

  console.log("Fetching Mandi Prices...");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data: MandiApiResponse = await response.json();

  if (!Array.isArray(data.records)) {
    throw new Error("Invalid API response");
  }

  console.log("Mandi records received:", data.records.length);

  return data.records;
}
