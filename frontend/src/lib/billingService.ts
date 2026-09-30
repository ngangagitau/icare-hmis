import apiClient from "@/lib/api";

export interface BillingItem {
  description: string;
  category?: "Consultation" | "Pharmacy" | "Laboratory" | "Radiology" | "Procedure" | "Ward" | "Nursing" | "Other";
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PaymentRecord {
  receiptNumber?: string;
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  date?: string;
  cashierName?: string;
}

export interface InsuranceClaimDetails {
  provider: string;
  memberNumber: string;
  policyNumber?: string;
  preAuthCode?: string;
  claimNumber?: string;
  amountClaimed: number;
  copayAmount?: number;
  status?: "Draft" | "Submitted" | "Approved" | "Rejected" | "Settled";
  submissionDate?: string;
  notes?: string;
}

export interface LinkedOrder {
  department: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  status: string;
  date: string;
  clearedAt?: string;
}

export interface InsuranceApproval {
  preAuthCode: string;
  approvedBy?: string;
  cashierName?: string;
  approvalDate: string;
  notes?: string;
}

export interface Bill {
  _id?: string;
  id?: string;
  billId?: string;
  invoiceNumber?: string;
  patientId: string;
  patient?: string;
  patientName?: string;
  patientDisplayId?: string;
  patientPhone?: string;
  patientInsurance?: any;
  items: BillingItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  totalAmount: number;
  total?: number;
  amountPaid?: number;
  balance?: number;
  status: "Pending" | "Partial" | "Paid" | "Approved" | "Pending Approval" | "Overdue" | "Cancelled" | string;
  paymentStatus?: "Pending" | "Partial" | "Paid" | "Approved" | "Pending Approval" | "Overdue" | "Cancelled" | string;
  paymentMethod?: string;
  scheme?: string;
  dueDate?: string;
  billDate?: string;
  invoiceDate?: string;
  notes?: string;
  paymentHistory?: PaymentRecord[];
  insuranceClaim?: InsuranceClaimDetails;
  insuranceApproval?: InsuranceApproval;
  linkedOrders?: LinkedOrder[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentPayload {
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  receiptNumber?: string;
}

export interface SplitPaymentPayload {
  payments: Array<{
    amount: number;
    method: string;
    reference?: string;
    notes?: string;
  }>;
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

export interface BillingStats {
  totalBills: number;
  pendingCount: number;
  pendingAmount: number;
  pendingCashCount?: number;
  pendingCashAmount?: number;
  pendingInsuranceCount?: number;
  pendingInsuranceAmount?: number;
  todayCollections: number;
  todayInvoicesCount: number;
  byMethod: Record<string, number>;
}

export interface ReceiptItem {
  id: string;
  receiptNumber: string;
  billId: string;
  invoiceNumber: string;
  patientId?: string;
  patientName: string;
  patientDisplayId: string;
  patientPhone?: string;
  amount: number;
  method: string;
  reference: string;
  cashier: string;
  date: string;
  notes?: string;
}

const unwrap = <T,>(response: any): T => {
  if (response && typeof response === "object" && "data" in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

export async function fetchBills(
  page = 1,
  limit = 50,
  filters?: {
    status?: string;
    patient?: string;
    scheme?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<PaginatedBills> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.status && filters.status !== "All") params.append("status", filters.status);
  if (filters?.patient) params.append("patient", filters.patient);
  if (filters?.scheme && filters.scheme !== "All") params.append("scheme", filters.scheme);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.startDate) params.append("startDate", filters.startDate);
  if (filters?.endDate) params.append("endDate", filters.endDate);

  const response = await apiClient.get<any>(`/billing?${params.toString()}`);
  return response as PaginatedBills;
}

export async function fetchBillingStats(): Promise<BillingStats> {
  const response = await apiClient.get<any>("/billing/stats");
  return unwrap(response);
}

export async function fetchReceipts(): Promise<ReceiptItem[]> {
  const response = await apiClient.get<any>("/billing/receipts");
  return unwrap(response) || [];
}

export async function getBillById(id: string): Promise<Bill> {
  const response = await apiClient.get<any>(`/billing/${id}`);
  return unwrap(response);
}

export async function createBill(
  data: Partial<Bill> & { patientId?: string; patient?: string; totalAmount?: number; total?: number; items: BillingItem[] }
): Promise<Bill> {
  const response = await apiClient.post<any>("/billing", data);
  return unwrap(response);
}

export async function updateBill(id: string, data: Partial<Bill>): Promise<Bill> {
  const response = await apiClient.put<any>(`/billing/${id}`, data);
  return unwrap(response);
}

export async function recordPayment(billId: string, payment: PaymentPayload): Promise<Bill> {
  const response = await apiClient.post<any>(`/billing/${billId}/payment`, payment);
  return unwrap(response);
}

export async function recordSplitPayment(billId: string, payload: SplitPaymentPayload): Promise<Bill> {
  const response = await apiClient.post<any>(`/billing/${billId}/split-payment`, payload);
  return unwrap(response);
}

export async function updateBillClaim(billId: string, claimData: InsuranceClaimDetails): Promise<Bill> {
  const response = await apiClient.post<any>(`/billing/${billId}/claim`, claimData);
  return unwrap(response);
}

export async function approveInsurance(
  billId: string,
  payload?: { preAuthCode?: string; notes?: string; copayAmount?: number }
): Promise<Bill> {
  const response = await apiClient.post<any>(`/billing/${billId}/approve-insurance`, payload || {});
  return unwrap(response);
}

export async function deleteBill(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/billing/${id}`);
}
