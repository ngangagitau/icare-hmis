import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBill,
  deleteBill,
  fetchBills,
  fetchBillingStats,
  fetchReceipts,
  getBillById,
  recordPayment,
  recordSplitPayment,
  updateBill,
  updateBillClaim,
  approveInsurance,
  type Bill,
  type PaymentPayload,
  type SplitPaymentPayload,
  type InsuranceClaimDetails,
} from "@/lib/billingService";

export const billingKeys = {
  all: ["billing"] as const,
  list: (page?: number, limit?: number, filters?: any) =>
    [...billingKeys.all, "list", page ?? 1, limit ?? 50, filters] as const,
  detail: (id: string) => [...billingKeys.all, "detail", id] as const,
  stats: () => [...billingKeys.all, "stats"] as const,
  receipts: () => [...billingKeys.all, "receipts"] as const,
};

export function useBills(
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
) {
  return useQuery({
    queryKey: billingKeys.list(page, limit, filters),
    queryFn: () => fetchBills(page, limit, filters),
  });
}

export function useBillingStats() {
  return useQuery({
    queryKey: billingKeys.stats(),
    queryFn: () => fetchBillingStats(),
    refetchInterval: 30000,
  });
}

export function useReceipts() {
  return useQuery({
    queryKey: billingKeys.receipts(),
    queryFn: () => fetchReceipts(),
  });
}

export function useBill(id: string) {
  return useQuery({
    queryKey: billingKeys.detail(id),
    queryFn: () => getBillById(id),
    enabled: !!id,
  });
}

export function useCreateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createBill>[0]) => createBill(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useUpdateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Bill> }) => updateBill(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: billingKeys.detail(id) });
      qc.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ billId, payment }: { billId: string; payment: PaymentPayload }) =>
      recordPayment(billId, payment),
    onSuccess: (_, { billId }) => {
      qc.invalidateQueries({ queryKey: billingKeys.detail(billId) });
      qc.invalidateQueries({ queryKey: billingKeys.all });
      qc.invalidateQueries({ queryKey: ["laboratory"] });
      qc.invalidateQueries({ queryKey: ["radiology"] });
      qc.invalidateQueries({ queryKey: ["pharmacy"] });
      qc.invalidateQueries({ queryKey: ["pharmacyOps"] });
      qc.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
}

export function useRecordSplitPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ billId, payload }: { billId: string; payload: SplitPaymentPayload }) =>
      recordSplitPayment(billId, payload),
    onSuccess: (_, { billId }) => {
      qc.invalidateQueries({ queryKey: billingKeys.detail(billId) });
      qc.invalidateQueries({ queryKey: billingKeys.all });
      qc.invalidateQueries({ queryKey: ["laboratory"] });
      qc.invalidateQueries({ queryKey: ["radiology"] });
      qc.invalidateQueries({ queryKey: ["pharmacy"] });
      qc.invalidateQueries({ queryKey: ["pharmacyOps"] });
      qc.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
}

export function useUpdateBillClaim() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ billId, claimData }: { billId: string; claimData: InsuranceClaimDetails }) =>
      updateBillClaim(billId, claimData),
    onSuccess: (_, { billId }) => {
      qc.invalidateQueries({ queryKey: billingKeys.detail(billId) });
      qc.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useDeleteBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBill(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: billingKeys.all });
    },
  });
}

export function useApproveInsurance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      billId,
      payload,
    }: {
      billId: string;
      payload?: { preAuthCode?: string; notes?: string; copayAmount?: number };
    }) => approveInsurance(billId, payload),
    onSuccess: (_, { billId }) => {
      qc.invalidateQueries({ queryKey: billingKeys.detail(billId) });
      qc.invalidateQueries({ queryKey: billingKeys.all });
      qc.invalidateQueries({ queryKey: ["laboratory"] });
      qc.invalidateQueries({ queryKey: ["radiology"] });
      qc.invalidateQueries({ queryKey: ["pharmacy"] });
      qc.invalidateQueries({ queryKey: ["pharmacyOps"] });
      qc.invalidateQueries({ queryKey: ["prescriptions"] });
    },
  });
}
