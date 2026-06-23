import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAppointment,
  deleteAppointment,
  fetchAppointments,
  getAppointmentById,
  updateAppointment,
  type Appointment,
} from "@/lib/appointmentService";

const keys = {
  all: ["appointments"] as const,
  list: (page?: number, limit?: number, filters?: any) => 
    [...keys.all, "list", page ?? 1, limit ?? 25, filters] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
};

export function useAppointments(
  page = 1,
  limit = 25,
  filters?: {
    status?: string;
    patient?: string;
    doctor?: string;
    startDate?: string;
    endDate?: string;
  }
) {
  return useQuery({
    queryKey: keys.list(page, limit, filters),
    queryFn: () => fetchAppointments(page, limit, filters),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => getAppointmentById(id),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createAppointment>[0]) => createAppointment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Appointment> }) => updateAppointment(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
