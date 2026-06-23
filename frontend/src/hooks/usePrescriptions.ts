import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPrescription,
  fetchPrescriptions,
  updatePrescriptionStatus,
  type PrescriptionStatus,
  type PrescriptionItem,
} from "@/lib/prescriptionService";

const keys = {
  all: ["prescriptions"] as const,
  byStatus: (status?: PrescriptionStatus) => [...keys.all, status ?? "all"] as const,
};

export function usePrescriptions(status?: PrescriptionStatus) {
  return useQuery({
    queryKey: keys.byStatus(status),
    queryFn: () => fetchPrescriptions(status),
    refetchInterval: 10000,
  });
}

export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { patientId: string; queueEntryId?: string; items: PrescriptionItem[]; notes?: string }) =>
      createPrescription(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useUpdatePrescriptionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PrescriptionStatus }) =>
      updatePrescriptionStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
