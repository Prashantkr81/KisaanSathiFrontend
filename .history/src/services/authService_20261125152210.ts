
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest, TOKEN_KEY } from "./api";

export type AuthResponse = {
  message: string;
  userId: number;
  fullName: string;
  phoneNumber: string;
  role: string;
  token: string | null;
};

export type RegisterRequest = {
  fullName: string;
  phoneNumber: string;
  password: string;
};

export type LoginRequest = {
  phoneNumber: string;
  password: string;
};

export async function registerUser(
  data: RegisterRequest
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    false
  );
}

export async function loginUser(
  data: LoginRequest
): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    false
  );

  if (!response.token) {
    throw new Error("Login successful but JWT token was not received.");
  }

  await AsyncStorage.setItem(TOKEN_KEY, response.token);

  return response;
}

export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return Boolean(token);
}
