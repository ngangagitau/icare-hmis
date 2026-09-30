import apiClient from "@/lib/api";

export interface EmergencyCase {
  _id?: string;
  id?: string;
  caseId?: string;
  patientNumber?: string;
  patientId: string;
  patientName?: string;
  dateOfBirth?: string;
  gender?: string;
  triageLevel: "Red" | "Orange" | "Yellow" | "Green" | "Black" | string;
  presentingComplaint: string;
  vitalSigns?: {
    temperature?: number;
    heartRate?: number;
    bloodPressure?: string;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    gcsScore?: number;
    painScale?: number;
    bloodSugar?: number;
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
  summary: {
    arrivalsToday: number;
    activeCases: number;
    redCases: number;
    orangeCases: number;
  };
  data: EmergencyCase[];
}

export interface CreateEmergencyCaseInput {
  patientId: string;
  triageLevel: "Red" | "Orange" | "Yellow" | "Green" | "Black";
  presentingComplaint: string;
  vitalSigns?: EmergencyCase["vitalSigns"];
  notes?: string;
}

export interface EmergencyInvoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate?: string;
  patientId?: string;
  patientNumber: string;
  patientName: string;
  items: Array<{ description?: string; quantity?: number; unitPrice?: number; amount?: number }>;
  amountDue: number;
  balance: number;
  paymentStatus: string;
  paymentMethod: string;
  payer: string;
}

export interface PaginatedEmergencyInvoices {
  success: boolean;
  count: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalInvoices: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: EmergencyInvoice[];
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
    search?: string;
  }
): Promise<PaginatedEmergency> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.status) params.append("status", filters.status);
  if (filters?.triageLevel) params.append("triageLevel", filters.triageLevel);
  if (filters?.search) params.append("search", filters.search);

  const response = await apiClient.get<PaginatedEmergency>(`/emergency/cases?${params.toString()}`);
  return response as PaginatedEmergency;
}

export async function fetchEmergencyInvoices(page = 1, limit = 25): Promise<PaginatedEmergencyInvoices> {
  const response = await apiClient.get<PaginatedEmergencyInvoices>(`/emergency/billing?page=${page}&limit=${limit}`);
  return response;
}

export async function getEmergencyCaseById(id: string): Promise<EmergencyCase> {
  const response = await apiClient.get<any>(`/emergency/${id}`);
  return unwrap(response);
}

export async function createEmergencyCase(
  data: CreateEmergencyCaseInput
): Promise<EmergencyCase> {
  const response = await apiClient.post<any>("/emergency/cases", data);
  return unwrap(response);
}

export async function updateEmergencyCase(id: string, data: Partial<EmergencyCase>): Promise<EmergencyCase> {
  const response = await apiClient.put<any>(`/emergency/${id}`, data);
  return unwrap(response);
}

export async function deleteEmergencyCase(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/emergency/${id}`);
}
