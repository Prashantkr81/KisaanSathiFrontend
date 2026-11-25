
import { apiRequest } from "./api";

export type FarmerProfile = {
  id: number;
  fullName: string;
  phoneNumber: string;
  role: string;
};

export type UpdateProfileRequest = {
  fullName: string;
};

export function getMyProfile(): Promise<FarmerProfile> {
  return apiRequest<FarmerProfile>(
    "/api/farmers/profile",
    { method: "GET" }
  );
}

export function updateMyProfile(
  data: UpdateProfileRequest
): Promise<FarmerProfile> {
  return apiRequest<FarmerProfile>(
    "/api/farmers/profile",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}
