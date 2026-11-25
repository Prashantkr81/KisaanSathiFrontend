
import { apiRequest } from "./api";

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

export function getMyFarms(): Promise<Farm[]> {
  return apiRequest<Farm[]>("/api/farms", {
    method: "GET",
  });
}

export function addFarm(data: FarmRequest): Promise<Farm> {
  return apiRequest<Farm>("/api/farms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
