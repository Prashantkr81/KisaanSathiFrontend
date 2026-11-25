import { apiRequest } from "./api";

export type Farm = {
  id: number;
  farmName: string;
  // Area is stored in hectares.
  landArea: number;
  currentCrop: string | null;
  pastCrop: string | null;
  cropSowedDate: string | null;
  state?: string | null;
  district?: string | null;
  soilType?: string | null;
  irrigationType?: string | null;
};

export type FarmRequest = {
  farmName: string;
  landArea: number;
  currentCrop: string | null;
  pastCrop: string | null;
  cropSowedDate: string | null;
};

export function getMyFarms(): Promise<Farm[]> {
  return apiRequest<Farm[]>("/api/farms", { method: "GET" });
}

export function getFarmById(id: number): Promise<Farm> {
  return apiRequest<Farm>(`/api/farms/${id}`, { method: "GET" });
}

export function addFarm(data: FarmRequest): Promise<Farm> {
  return apiRequest<Farm>("/api/farms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
