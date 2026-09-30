import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collectLabSample,
  createLabTest,
  deleteLabTest,
  fetchLabStats,
  fetchLabTemplates,
  fetchLabTests,
  getLabTestById,
  saveLabResults,
  updateLabOrderStatus,
  updateLabTest,
  type LabOrderStatus,
  type LabStats,
  type LabTest,
} from "@/lib/laboratoryService";

const keys = {
  all: ["lab-tests"] as const,
  list: (page?: number, limit?: number, filters?: any) =>
    [...keys.all, "list", page ?? 1, limit ?? 100, filters] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
  templates: ["lab-templates"] as const,
  stats: ["lab-stats"] as const,
};

export function useLabTests(
  page = 1,
  limit = 100,
  filters?: {
    status?: string;
    patient?: string;
    queueEntryId?: string;
    search?: string;
  }
) {
  return useQuery({
    queryKey: keys.list(page, limit, filters),
    queryFn: () => fetchLabTests(page, limit, filters),
    refetchInterval: 10000,
  });
}

export function useLabTemplates() {
  return useQuery({
    queryKey: keys.templates,
    queryFn: fetchLabTemplates,
  });
}

export function useLabTest(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => getLabTestById(id),
    enabled: !!id,
  });
}

export function useCreateLabTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createLabTest>[0]) => createLabTest(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateLabTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LabTest> }) => updateLabTest(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useLabStats() {
  return useQuery({
    queryKey: keys.stats,
    queryFn: fetchLabStats,
    refetchInterval: 10000,
  });
}

export function useCollectLabSample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: string | { id: string; specimenCondition?: string; notes?: string }) => {
      if (typeof args === "string") return collectLabSample(args);
      return collectLabSample(args.id, {
        specimenCondition: args.specimenCondition,
        notes: args.notes,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

export function useUpdateLabOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LabOrderStatus }) => updateLabOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useSaveLabResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof saveLabResults>[1];
    }) => saveLabResults(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeleteLabTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLabTest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
