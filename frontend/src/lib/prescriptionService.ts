import apiClient, { ApiResponse } from "@/lib/api";

export type PrescriptionStatus = "Pending" | "Ready" | "Dispensed";

export interface PrescriptionItem {
  drug: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  _id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientDisplayId: string;
  queueEntryId?: string;
  doctorId: string;
  items: PrescriptionItem[];
  notes?: string;
  status: PrescriptionStatus;
  createdAt: string;
  preparedAt?: string;
  dispensedAt?: string;
}

const unwrap = <T,>(response: ApiResponse<T> & T): T =>
  response && typeof response === "object" && "data" in response && response.data !== undefined
    ? (response.data as T)
    : (response as T);

export async function fetchPrescriptions(status?: PrescriptionStatus): Promise<Prescription[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await apiClient.get<ApiResponse<Prescription[]>>(`/prescriptions${qs}`);
  return unwrap(response);
}

export async function createPrescription(payload: {
  patientId: string;
  queueEntryId?: string;
  items: PrescriptionItem[];
  notes?: string;
}): Promise<Prescription> {
  const response = await apiClient.post<ApiResponse<Prescription>>("/prescriptions", payload);
  return unwrap(response);
}

export async function updatePrescriptionStatus(id: string, status: PrescriptionStatus): Promise<Prescription> {
  const response = await apiClient.patch<ApiResponse<Prescription>>(`/prescriptions/${id}/status`, { status });
  return unwrap(response);
}
