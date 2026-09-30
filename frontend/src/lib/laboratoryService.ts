import apiClient, { ApiResponse } from "@/lib/api";

export type LabOrderStatus = "Pending" | "Sample Received" | "Processing" | "Completed";
export type LabPaymentStatus = "Pending" | "Cleared" | "Unpaid" | "Insurance";

export interface LabParameter {
  key: string;
  label: string;
  ref?: string;
  value?: string | number;
  flag?: string | null;
}

export interface LabTemplate {
  code: string;
  name: string;
  specimenType: string;
  parameters: LabParameter[];
}

export interface LabTest {
  _id: string;
  id?: string;
  testId?: string;
  orderNumber: string;
  patientId: string;
  patientName?: string;
  patientDisplayId?: string;
  queueEntryId?: string;
  testName: string;
  testCode?: string;
  specimen?: string;
  specimenType?: string;
  sampleType?: string;
  orderDate?: string;
  status: LabOrderStatus;
  results?: Record<string, unknown> & { parameters?: LabParameter[]; comments?: string; abnormal?: boolean };
  notes?: string;
  orderedBy?: string;
  analyzedBy?: string;
  collectorName?: string;
  collectionTime?: string;
  paymentStatus?: LabPaymentStatus;
  resultStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LabPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalTests: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedLabTests {
  success: boolean;
  count: number;
  pagination: LabPaginationMeta;
  data: LabTest[];
}

const unwrap = <T,>(response: any): T => {
  if (response && typeof response === "object" && "data" in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

export async function fetchLabTests(
  page = 1,
  limit = 100,
  filters?: {
    status?: string;
    patient?: string;
    queueEntryId?: string;
    search?: string;
  }
): Promise<PaginatedLabTests> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.status) params.append("status", filters.status);
  if (filters?.patient) params.append("patient", filters.patient);
  if (filters?.queueEntryId) params.append("queueEntryId", filters.queueEntryId);
  if (filters?.search) params.append("search", filters.search);

  return apiClient.get<PaginatedLabTests>(`/laboratory?${params.toString()}`);
}

export interface LabStats {
  total: number;
  pending: number;
  collected: number;
  processing: number;
  completed: number;
  unpaid: number;
  today: number;
}

export async function fetchLabStats(): Promise<LabStats> {
  const response = await apiClient.get<ApiResponse<LabStats>>("/laboratory/stats");
  return unwrap(response);
}

export async function fetchLabTemplates(): Promise<LabTemplate[]> {
  const response = await apiClient.get<ApiResponse<LabTemplate[]>>("/laboratory/templates");
  return unwrap(response);
}

export async function getLabTestById(id: string): Promise<LabTest> {
  const response = await apiClient.get<any>(`/laboratory/${id}`);
  return unwrap(response);
}

export async function createLabTest(data: {
  patientId: string;
  queueEntryId?: string;
  testName?: string;
  testCode?: string;
  specimenType?: string;
  specimen?: string;
  notes?: string;
  paymentStatus?: LabPaymentStatus;
  tests?: Array<{ testName?: string; testCode?: string; specimenType?: string; name?: string; code?: string }>;
}): Promise<LabTest | LabTest[]> {
  const response = await apiClient.post<any>("/laboratory", data);
  return unwrap(response);
}

export async function updateLabTest(id: string, data: Partial<LabTest>): Promise<LabTest> {
  const response = await apiClient.put<any>(`/laboratory/${id}`, data);
  return unwrap(response);
}

export async function collectLabSample(id: string, details?: { specimenCondition?: string; notes?: string }): Promise<LabTest> {
  const response = await apiClient.patch<any>(`/laboratory/${id}/collect`, details || {});
  return unwrap(response);
}

export async function updateLabOrderStatus(id: string, status: LabOrderStatus): Promise<LabTest> {
  const response = await apiClient.patch<any>(`/laboratory/${id}/status`, { status });
  return unwrap(response);
}

export async function saveLabResults(
  id: string,
  payload: { parameters?: LabParameter[]; comments?: string; results?: Record<string, unknown>; publish?: boolean }
): Promise<LabTest> {
  const response = await apiClient.put<any>(`/laboratory/${id}/results`, payload);
  return unwrap(response);
}

export async function deleteLabTest(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/laboratory/${id}`);
}
