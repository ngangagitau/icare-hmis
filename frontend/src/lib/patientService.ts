import apiClient, { ApiResponse } from "@/lib/api";

export interface Patient {
  _id?: string;
  id?: string;
  patientId?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender: string;
  phone: string;
  email?: string;
  idNumber?: string;
  bloodType?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  allergies?: string;
  currentMedications?: string;
  insurance?: string;
  height?: number;
  weight?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalPatients: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedPatients {
  success: boolean;
  count: number;
  pagination: PaginationMeta;
  data: Patient[];
}

const unwrap = <T,>(response: any): T => {
  if (response && typeof response === "object" && "data" in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

export async function fetchPatients(page = 1, limit = 25): Promise<PaginatedPatients> {
  const response = await apiClient.get<any>(`/patients?page=${page}&limit=${limit}`);
  return response as PaginatedPatients;
}

export async function searchPatients(query: string): Promise<Patient[]> {
  const response = await apiClient.get<any>(`/patients/search/${encodeURIComponent(query)}`);
  return unwrap(response);
}

export async function getPatientById(id: string): Promise<Patient> {
  const response = await apiClient.get<any>(`/patients/${id}`);
  return unwrap(response);
}

export async function createPatient(data: Omit<Patient, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
  const response = await apiClient.post<any>("/patients", data);
  return unwrap(response);
}

export async function updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
  const response = await apiClient.put<any>(`/patients/${id}`, data);
  return unwrap(response);
}

export async function deletePatient(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/patients/${id}`);
}
