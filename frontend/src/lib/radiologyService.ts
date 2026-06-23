import apiClient from "@/lib/api";

export interface RadiologyOrder {
  _id?: string;
  id?: string;
  orderId?: string;
  patientId: string;
  patientName?: string;
  modality: string; // X-ray, CT, MRI, Ultrasound, etc.
  bodyPart: string;
  urgency: "Routine" | "Urgent" | "Emergency";
  orderDate?: string;
  status: "Ordered" | "Scheduled" | "In Progress" | "Completed" | "Reported";
  findings?: string;
  impression?: string;
  recommendations?: string;
  images?: string[];
  radiologistName?: string;
  notes?: string;
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

const unwrap = <T,>(response: any): T => {
  if (response && typeof response === "object" && "data" in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

export async function fetchRadiologyOrders(
  page = 1,
  limit = 25,
  filters?: {
    status?: string;
    modality?: string;
    urgency?: string;
  }
): Promise<PaginatedRadiology> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.status) params.append("status", filters.status);
  if (filters?.modality) params.append("modality", filters.modality);
  if (filters?.urgency) params.append("urgency", filters.urgency);

  const response = await apiClient.get<any>(`/radiology?${params.toString()}`);
  return response as PaginatedRadiology;
}

export async function getRadiologyOrderById(id: string): Promise<RadiologyOrder> {
  const response = await apiClient.get<any>(`/radiology/${id}`);
  return unwrap(response);
}

export async function createRadiologyOrder(
  data: Omit<RadiologyOrder, '_id' | 'id' | 'orderId' | 'createdAt' | 'updatedAt'>
): Promise<RadiologyOrder> {
  const response = await apiClient.post<any>("/radiology", data);
  return unwrap(response);
}

export async function updateRadiologyOrder(id: string, data: Partial<RadiologyOrder>): Promise<RadiologyOrder> {
  const response = await apiClient.put<any>(`/radiology/${id}`, data);
  return unwrap(response);
}

export async function deleteRadiologyOrder(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/radiology/${id}`);
}
