import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRadiologyOrder,
  deleteRadiologyOrder,
  fetchRadiologyOrders,
  fetchRadiologyStats,
  getRadiologyOrderById,
  startRadiologyExam,
  submitRadiologyReport,
  updateRadiologyOrder,
  type RadiologyOrder,
  type RadiologyReportPayload,
} from "@/lib/radiologyService";

export const radiologyKeys = {
  all: ["radiology"] as const,
  list: (page?: number, limit?: number, filters?: any) =>
    [...radiologyKeys.all, "list", page ?? 1, limit ?? 50, filters] as const,
  detail: (id: string) => [...radiologyKeys.all, "detail", id] as const,
  stats: () => [...radiologyKeys.all, "stats"] as const,
};

export function useRadiologyOrders(
  page = 1,
  limit = 50,
  filters?: {
    status?: string;
    modality?: string;
    urgency?: string;
    search?: string;
    patient?: string;
  }
) {
  return useQuery({
    queryKey: radiologyKeys.list(page, limit, filters),
    queryFn: () => fetchRadiologyOrders(page, limit, filters),
  });
}

export function useRadiologyStats() {
  return useQuery({
    queryKey: radiologyKeys.stats(),
    queryFn: () => fetchRadiologyStats(),
    refetchInterval: 30000,
  });
}

export function useRadiologyOrder(id: string) {
  return useQuery({
    queryKey: radiologyKeys.detail(id),
    queryFn: () => getRadiologyOrderById(id),
    enabled: !!id,
  });
}

export function useCreateRadiologyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createRadiologyOrder>[0]) => createRadiologyOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: radiologyKeys.all });
    },
  });
}

export function useUpdateRadiologyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RadiologyOrder> }) =>
      updateRadiologyOrder(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: radiologyKeys.detail(id) });
      qc.invalidateQueries({ queryKey: radiologyKeys.all });
    },
  });
}

export function useStartRadiologyExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, technicianName }: { id: string; technicianName?: string }) =>
      startRadiologyExam(id, technicianName),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: radiologyKeys.detail(id) });
      qc.invalidateQueries({ queryKey: radiologyKeys.all });
    },
  });
}

export function useSubmitRadiologyReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, report }: { id: string; report: RadiologyReportPayload }) =>
      submitRadiologyReport(id, report),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: radiologyKeys.detail(id) });
      qc.invalidateQueries({ queryKey: radiologyKeys.all });
    },
  });
}

export function useDeleteRadiologyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRadiologyOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: radiologyKeys.all });
    },
  });
}
