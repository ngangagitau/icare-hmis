import apiClient, { ApiResponse } from "@/lib/api";

export interface Appointment {
  _id?: string;
  id?: string;
  appointmentId?: string;
  patient: string;
  doctor: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "Scheduled" | "Checked In" | "In Progress" | "Completed" | "Cancelled" | "No Show";
  reason: string;
  notes?: string;
  department?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppointmentPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalAppointments: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedAppointments {
  success: boolean;
  count: number;
  pagination: AppointmentPaginationMeta;
  data: Appointment[];
}

const unwrap = <T,>(response: any): T => {
  if (response && typeof response === "object" && "data" in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

export async function fetchAppointments(
  page = 1,
  limit = 25,
  filters?: {
    status?: string;
    patient?: string;
    doctor?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<PaginatedAppointments> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.status) params.append("status", filters.status);
  if (filters?.patient) params.append("patient", filters.patient);
  if (filters?.doctor) params.append("doctor", filters.doctor);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const response = await apiClient.get<any>(`/appointments?${params.toString()}`);
  return response as PaginatedAppointments;
}

export async function getAppointmentById(id: string): Promise<Appointment> {
  const response = await apiClient.get<any>(`/appointments/${id}`);
  return unwrap(response);
}

export async function createAppointment(
  data: Omit<Appointment, '_id' | 'id' | 'appointmentId' | 'createdAt' | 'updatedAt'>
): Promise<Appointment> {
  const response = await apiClient.post<any>("/appointments", data);
  return unwrap(response);
}

export async function updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
  const response = await apiClient.put<any>(`/appointments/${id}`, data);
  return unwrap(response);
}

export async function deleteAppointment(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/appointments/${id}`);
}
