
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const TOKEN_KEY = "kisaan_sathi_token";

export type Farm = {
  id: number;
  state: string;
  district: string;
  landArea: number;
  soilType: string;
  irrigationType: string;
  previousCrop: string | null;
};

export type FarmRequest = {
  state: string;
  district: string;
  landArea: number;
  soilType: string;
  irrigationType: string;
  previousCrop: string | null;
};

async function apiRequest<T>(
  endpoint: string,
  method: "GET" | "POST",
  body?: FarmRequest
): Promise<T> {
  if (!API_URL) {
    throw new Error("Backend URL is missing in .env");
  }

  const token = await AsyncStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error("Please login first. Authentication token not found.");
  }

  const response = await fetch(
    `${API_URL.replace(/\/$/, "")}${endpoint}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }
  );

  const responseText = await response.text();
  let data: any = null;

  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = null;
  }

  if (response.status === 401) {
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `Server error: ${response.status}`
    );
  }

  return data as T;
}

export function getMyFarms(): Promise<Farm[]> {
  return apiRequest<Farm[]>("/api/farms", "GET");
}

export function addFarm(farm: FarmRequest): Promise<Farm> {
  return apiRequest<Farm>("/api/farms", "POST", farm);
}
