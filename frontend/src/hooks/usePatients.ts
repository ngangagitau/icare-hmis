import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPatient,
  deletePatient,
  fetchPatients,
  getPatientById,
  searchPatients,
  updatePatient,
  type Patient,
} from "@/lib/patientService";

const keys = {
  all: ["patients"] as const,
  list: (page?: number, limit?: number) => [...keys.all, "list", page ?? 1, limit ?? 25] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
  search: (query: string) => [...keys.all, "search", query] as const,
};

export function usePatients(page = 1, limit = 25) {
  return useQuery({
    queryKey: keys.list(page, limit),
    queryFn: () => fetchPatients(page, limit),
  });
}

export function useSearchPatients(query: string) {
  return useQuery({
    queryKey: keys.search(query),
    queryFn: () => searchPatients(query),
    enabled: !!query,
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => getPatientById(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createPatient>[0]) => createPatient(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Patient> }) => updatePatient(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
