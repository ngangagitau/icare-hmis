import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBill,
  deleteBill,
  fetchBills,
  getBillById,
  recordPayment,
  updateBill,
  type Bill,
  type Payment,
} from "@/lib/billingService";

const keys = {
  all: ["billing"] as const,
  list: (page?: number, limit?: number, filters?: any) => 
    [...keys.all, "list", page ?? 1, limit ?? 25, filters] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
};

export function useBills(
  page = 1,
  limit = 25,
  filters?: {
    status?: string;
    patient?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  return useQuery({
    queryKey: keys.list(page, limit, filters),
    queryFn: () => fetchBills(page, limit, filters),
  });
}

export function useBill(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => getBillById(id),
    enabled: !!id,
  });
}

export function useCreateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createBill>[0]) => createBill(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Bill> }) => updateBill(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ billId, payment }: { billId: string; payment: Payment }) => recordPayment(billId, payment),
    onSuccess: (_, { billId }) => {
      qc.invalidateQueries({ queryKey: keys.detail(billId) });
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBill(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
