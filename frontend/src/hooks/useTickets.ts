import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTicket,
  deleteTicket,
  fetchTickets,
  getTicketById,
  updateTicket,
  type Ticket,
} from "@/lib/ticketService";

const keys = {
  all: ["tickets"] as const,
  list: (page?: number, limit?: number, filters?: any) => 
    [...keys.all, "list", page ?? 1, limit ?? 25, filters] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
};

export function useTickets(
  page = 1,
  limit = 25,
  filters?: {
    status?: string;
    priority?: string;
    category?: string;
  }
) {
  return useQuery({
    queryKey: keys.list(page, limit, filters),
    queryFn: () => fetchTickets(page, limit, filters),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => getTicketById(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createTicket>[0]) => createTicket(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Ticket> }) => updateTicket(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTicket(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
