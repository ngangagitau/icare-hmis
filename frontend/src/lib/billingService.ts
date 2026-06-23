import apiClient from "@/lib/api";

export interface BillingItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Bill {
  _id?: string;
  id?: string;
  billId?: string;
  patientId: string;
  patientName?: string;
  invoiceNumber?: string;
  items: BillingItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  totalAmount: number;
  amountPaid?: number;
  balance?: number;
  status: "Pending" | "Partial" | "Paid" | "Overdue" | "Cancelled";
  paymentMethod?: string;
  dueDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  billId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

export interface BillingPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalBills: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedBills {
  success: boolean;
  count: number;
  pagination: BillingPaginationMeta;
  data: Bill[];
}

const unwrap = <T,>(response: any): T => {
  if (response && typeof response === "object" && "data" in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

export async function fetchBills(
  page = 1,
  limit = 25,
  filters?: {
    status?: string;
    patient?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<PaginatedBills> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.status) params.append("status", filters.status);
  if (filters?.patient) params.append("patient", filters.patient);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const response = await apiClient.get<any>(`/billing?${params.toString()}`);
  return response as PaginatedBills;
}

export async function getBillById(id: string): Promise<Bill> {
  const response = await apiClient.get<any>(`/billing/${id}`);
  return unwrap(response);
}

export async function createBill(data: Omit<Bill, '_id' | 'id' | 'billId' | 'createdAt' | 'updatedAt'>): Promise<Bill> {
  const response = await apiClient.post<any>("/billing", data);
  return unwrap(response);
}

export async function updateBill(id: string, data: Partial<Bill>): Promise<Bill> {
  const response = await apiClient.put<any>(`/billing/${id}`, data);
  return unwrap(response);
}

export async function recordPayment(billId: string, payment: Payment): Promise<Bill> {
  const response = await apiClient.post<any>(`/billing/${billId}/payment`, payment);
  return unwrap(response);
}

export async function deleteBill(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/billing/${id}`);
}
