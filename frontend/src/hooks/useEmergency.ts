import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEmergencyCase,
  deleteEmergencyCase,
  fetchEmergencyCases,
  getEmergencyCaseById,
  updateEmergencyCase,
  type EmergencyCase,
} from "@/lib/emergencyService";

const keys = {
  all: ["emergency"] as const,
  list: (page?: number, limit?: number, filters?: any) =>
    [...keys.all, "list", page ?? 1, limit ?? 25, filters] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
};

export function useEmergencyCases(
  page = 1,
  limit = 25,
  filters?: {
    status?: string;
    triageLevel?: string;
  }
) {
  return useQuery({
    queryKey: keys.list(page, limit, filters),
    queryFn: () => fetchEmergencyCases(page, limit, filters),
    refetchInterval: 10000, // Refetch every 10 seconds for emergency
  });
}

export function useEmergencyCase(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => getEmergencyCaseById(id),
    enabled: !!id,
  });
}

export function useCreateEmergencyCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createEmergencyCase>[0]) => createEmergencyCase(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateEmergencyCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EmergencyCase> }) => updateEmergencyCase(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteEmergencyCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmergencyCase(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
