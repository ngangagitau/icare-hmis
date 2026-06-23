import apiClient from "@/lib/api";

export interface EmergencyCase {
  _id?: string;
  id?: string;
  caseId?: string;
  patientId: string;
  patientName?: string;
  triageLevel: "Red" | "Yellow" | "Green" | "Black";
  presentingComplaint: string;
  vitalSigns?: {
    temperature?: number;
    heartRate?: number;
    bloodPressure?: string;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  status: "Incoming" | "Triage" | "Treatment" | "Discharge" | "Admitted" | "Deceased";
  doctorAssigned?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmergencyPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalCases: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedEmergency {
  success: boolean;
  count: number;
  pagination: EmergencyPaginationMeta;
  data: EmergencyCase[];
}

const unwrap = <T,>(response: any): T => {
  if (response && typeof response === "object" && "data" in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

export async function fetchEmergencyCases(
  page = 1,
  limit = 25,
  filters?: {
    status?: string;
    triageLevel?: string;
  }
): Promise<PaginatedEmergency> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.status) params.append("status", filters.status);
  if (filters?.triageLevel) params.append("triageLevel", filters.triageLevel);

  const response = await apiClient.get<any>(`/emergency?${params.toString()}`);
  return response as PaginatedEmergency;
}

export async function getEmergencyCaseById(id: string): Promise<EmergencyCase> {
  const response = await apiClient.get<any>(`/emergency/${id}`);
  return unwrap(response);
}

export async function createEmergencyCase(
  data: Omit<EmergencyCase, '_id' | 'id' | 'caseId' | 'createdAt' | 'updatedAt'>
): Promise<EmergencyCase> {
  const response = await apiClient.post<any>("/emergency", data);
  return unwrap(response);
}

export async function updateEmergencyCase(id: string, data: Partial<EmergencyCase>): Promise<EmergencyCase> {
  const response = await apiClient.put<any>(`/emergency/${id}`, data);
  return unwrap(response);
}

export async function deleteEmergencyCase(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/emergency/${id}`);
}
