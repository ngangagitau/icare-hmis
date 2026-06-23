import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createRadiologyOrder,
  deleteRadiologyOrder,
  fetchRadiologyOrders,
  getRadiologyOrderById,
  updateRadiologyOrder,
  type RadiologyOrder,
} from "@/lib/radiologyService";

const keys = {
  all: ["radiology"] as const,
  list: (page?: number, limit?: number, filters?: any) =>
    [...keys.all, "list", page ?? 1, limit ?? 25, filters] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
};

export function useRadiologyOrders(
  page = 1,
  limit = 25,
  filters?: {
    status?: string;
    modality?: string;
    urgency?: string;
  }
) {
  return useQuery({
    queryKey: keys.list(page, limit, filters),
    queryFn: () => fetchRadiologyOrders(page, limit, filters),
  });
}

export function useRadiologyOrder(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => getRadiologyOrderById(id),
    enabled: !!id,
  });
}

export function useCreateRadiologyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createRadiologyOrder>[0]) => createRadiologyOrder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateRadiologyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RadiologyOrder> }) => updateRadiologyOrder(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteRadiologyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRadiologyOrder(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
