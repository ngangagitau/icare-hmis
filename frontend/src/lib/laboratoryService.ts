import apiClient from "@/lib/api";

export interface LabTest {
  _id?: string;
  id?: string;
  testId?: string;
  patientId: string;
  patientName?: string;
  testName: string;
  testCode?: string;
  specimen?: string;
  specimenType?: string;
  orderDate?: string;
  status: "Ordered" | "Sample Received" | "Processing" | "Completed" | "Resulted";
  results?: any;
  normalRange?: string;
  notes?: string;
  orderedBy?: string;
  analyzedBy?: string;
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
  limit = 25,
  filters?: {
    status?: string;
    patient?: string;
  }
): Promise<PaginatedLabTests> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.status) params.append("status", filters.status);
  if (filters?.patient) params.append("patient", filters.patient);

  const response = await apiClient.get<any>(`/laboratory?${params.toString()}`);
  return response as PaginatedLabTests;
}

export async function getLabTestById(id: string): Promise<LabTest> {
  const response = await apiClient.get<any>(`/laboratory/${id}`);
  return unwrap(response);
}

export async function createLabTest(data: Omit<LabTest, '_id' | 'id' | 'testId' | 'createdAt' | 'updatedAt'>): Promise<LabTest> {
  const response = await apiClient.post<any>("/laboratory", data);
  return unwrap(response);
}

export async function updateLabTest(id: string, data: Partial<LabTest>): Promise<LabTest> {
  const response = await apiClient.put<any>(`/laboratory/${id}`, data);
  return unwrap(response);
}

export async function deleteLabTest(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/laboratory/${id}`);
}
