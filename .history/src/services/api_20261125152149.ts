
import AsyncStorage from "@react-native-async-storage/async-storage";

export const TOKEN_KEY = "kisaan_sathi_token";

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requiresAuth = true
): Promise<T> {
  if (!API_URL) {
    throw new Error("Backend URL missing. Check your .env file.");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (requiresAuth) {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (!token) {
      throw new Error("Please login to continue.");
    }

    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Cannot connect to backend. Check server, IP address and network."
    );
  }

  const responseText = await response.text();

  let data: any = null;

  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = responseText;
  }

  if (response.status === 401) {
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.detail ||
      data?.error ||
      `Request failed: ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}
