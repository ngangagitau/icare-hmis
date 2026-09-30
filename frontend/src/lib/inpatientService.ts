import apiClient, { ApiResponse } from "@/lib/api";

export interface InpatientAdmission {
  id: string;
  admissionId?: string;
  admissionNumber?: string;
  patientId?: string;
  pid: string;
  patient: string;
  gender?: string;
  ward: string;
  bed: string;
  admissionDate: string;
  days: number;
  status: "Active" | "Pending Discharge" | "Discharged" | string;
  doctor: string;
  diagnosis?: string;
  dischargeDate?: string | null;
  dischargeNotes?: string | null;
}

export interface WardSummary {
  name: string;
  total: number;
  occupied: number;
  available: number;
}

export interface CreateAdmissionPayload {
  patient: string;
  patientId?: string;
  ward: string;
  bed: string;
  admissionType?: string;
  urgency?: string;
  referralSource?: string;
  attendingDoctor?: string;
  provisionalDiagnosis?: string;
  notes?: string;
  paymentMode?: string;
  insurancePanel?: string;
}

export async function fetchInpatientAdmissions(params?: {
  status?: string;
  ward?: string;
  search?: string;
}): Promise<InpatientAdmission[]> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.ward) query.append("ward", params.ward);
  if (params?.search) query.append("search", params.search);

  const qs = query.toString() ? `?${query.toString()}` : "";
  const response = await apiClient.get<any>(`/inpatient/admissions${qs}`);

  if (response && response.data && Array.isArray(response.data)) {
    return response.data;
  }
  if (Array.isArray(response)) {
    return response;
  }
  return [];
}

export async function fetchWardSummaries(): Promise<WardSummary[]> {
  const response = await apiClient.get<any>("/inpatient/wards");
  if (response && response.data && Array.isArray(response.data)) {
    return response.data;
  }
  return [];
}

export async function createInpatientAdmission(
  payload: CreateAdmissionPayload
): Promise<InpatientAdmission> {
  const response = await apiClient.post<any>("/inpatient/admissions", payload);
  if (response && response.data) {
    return response.data;
  }
  return response as InpatientAdmission;
}

export async function updateInpatientAdmission(
  id: string,
  payload: Partial<InpatientAdmission>
): Promise<InpatientAdmission> {
  const response = await apiClient.patch<any>(`/inpatient/admissions/${id}`, payload);
  return response?.data || response;
}

export async function deleteInpatientAdmission(id: string): Promise<boolean> {
  try {
    const response = await apiClient.delete<any>(`/inpatient/admissions/${id}`);
    return response?.success !== false;
  } catch (err) {
    console.error("Error deleting admission:", err);
    return false;
  }
}

export interface WardTransfer {
  id: string;
  patient: string;
  from: string;
  to: string;
  reason: string;
  doctor: string;
  status: string;
  createdAt?: string;
}

export async function fetchWardTransfers(): Promise<WardTransfer[]> {
  const response = await apiClient.get<any>("/inpatient/transfers");
  if (response && response.data && Array.isArray(response.data)) {
    return response.data;
  }
  return [];
}

export async function createWardTransfer(payload: {
  patient: string;
  from: string;
  to: string;
  reason: string;
  doctor?: string;
  admissionId?: string;
  newBed?: string;
}): Promise<WardTransfer> {
  const response = await apiClient.post<any>("/inpatient/transfers", payload);
  return response?.data || response;
}

export interface DischargeRecord {
  id: string;
  admissionId?: string;
  patient: string;
  pid: string;
  ward: string;
  admitted: string;
  doctor: string;
  billTotal: number;
  billCount: number;
  billStatus: "Cleared" | "Pending" | string;
  status: "Discharged" | "Ready" | "Admitted" | string;
}

export async function fetchDischargeRecords(): Promise<DischargeRecord[]> {
  const response = await apiClient.get<any>("/inpatient/discharges");
  if (response && response.data && Array.isArray(response.data)) {
    return response.data;
  }
  return [];
}

export async function finalizePatientDischarge(
  admissionId: string,
  payload?: { dischargeNotes?: string; dischargeType?: string }
): Promise<boolean> {
  try {
    const response = await apiClient.post<any>(`/inpatient/discharges/${admissionId}`, payload || {});
    return response?.success !== false;
  } catch (err) {
    console.error("Error finalizing discharge:", err);
    return false;
  }
}

