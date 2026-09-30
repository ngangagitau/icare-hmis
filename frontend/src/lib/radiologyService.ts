import apiClient from "@/lib/api";

export interface RadiologyOrder {
  _id?: string;
  id?: string;
  orderId?: string;
  orderNumber?: string;
  patientId: string;
  patientName?: string;
  patientDisplayId?: string;
  patientGender?: string;
  patientDob?: string;
  modality: string; // X-Ray, CT Scan, MRI, Ultrasound, Mammography, etc.
  bodyPart: string;
  imagingType?: string;
  urgency: "Routine" | "Urgent" | "STAT" | "Emergency";
  orderDate?: string;
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  findings?: string;
  impression?: string;
  recommendations?: string;
  technique?: string;
  clinicalIndication?: string;
  images?: string[];
  radiologistName?: string;
  technicianName?: string;
  paymentStatus?: "Cleared" | "Pending" | "Insurance" | "Unpaid";
  paymentAmount?: number;
  paymentMethod?: string;
  notes?: string;
  requestedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RadiologyPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedRadiology {
  success: boolean;
  count: number;
  pagination: RadiologyPaginationMeta;
  data: RadiologyOrder[];
}

export interface RadiologyStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export interface RadiologyReportPayload {
  findings: string;
  impression: string;
  recommendations?: string;
  technique?: string;
  radiologistName?: string;
  publish?: boolean;
  images?: string[];
  notes?: string;
}

const unwrap = <T,>(response: any): T => {
  if (response && typeof response === "object" && "data" in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

export async function fetchRadiologyOrders(
  page = 1,
  limit = 50,
  filters?: {
    status?: string;
    modality?: string;
    urgency?: string;
    search?: string;
    patient?: string;
  }
): Promise<PaginatedRadiology> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.status && filters.status !== "All") params.append("status", filters.status);
  if (filters?.modality && filters.modality !== "All") params.append("modality", filters.modality);
  if (filters?.urgency && filters.urgency !== "All") params.append("urgency", filters.urgency);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.patient) params.append("patient", filters.patient);

  const response = await apiClient.get<any>(`/radiology?${params.toString()}`);
  return response as PaginatedRadiology;
}

export async function fetchRadiologyStats(): Promise<RadiologyStats> {
  const response = await apiClient.get<any>("/radiology/stats");
  return unwrap(response);
}

export async function getRadiologyOrderById(id: string): Promise<RadiologyOrder> {
  const response = await apiClient.get<any>(`/radiology/${id}`);
  return unwrap(response);
}

export async function createRadiologyOrder(
  data: Partial<RadiologyOrder> & { patientId: string; modality: string }
): Promise<RadiologyOrder> {
  const response = await apiClient.post<any>("/radiology", data);
  return unwrap(response);
}

export async function updateRadiologyOrder(id: string, data: Partial<RadiologyOrder>): Promise<RadiologyOrder> {
  const response = await apiClient.put<any>(`/radiology/${id}`, data);
  return unwrap(response);
}

export async function startRadiologyExam(id: string, technicianName?: string): Promise<RadiologyOrder> {
  const response = await apiClient.put<any>(`/radiology/${id}/start`, { technicianName });
  return unwrap(response);
}

export async function submitRadiologyReport(id: string, report: RadiologyReportPayload): Promise<RadiologyOrder> {
  const response = await apiClient.put<any>(`/radiology/${id}/report`, report);
  return unwrap(response);
}

export async function deleteRadiologyOrder(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/radiology/${id}`);
}
