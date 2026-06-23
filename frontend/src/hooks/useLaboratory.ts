import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLabTest,
  deleteLabTest,
  fetchLabTests,
  getLabTestById,
  updateLabTest,
  type LabTest,
} from "@/lib/laboratoryService";

const keys = {
  all: ["lab-tests"] as const,
  list: (page?: number, limit?: number, filters?: any) =>
    [...keys.all, "list", page ?? 1, limit ?? 25, filters] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
};

export function useLabTests(
  page = 1,
  limit = 25,
  filters?: {
    status?: string;
    patient?: string;
  }
) {
  return useQuery({
    queryKey: keys.list(page, limit, filters),
    queryFn: () => fetchLabTests(page, limit, filters),
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

export function useDeleteLabTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLabTest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
