import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addToQueue,
  fetchQueue,
  getQueueEntryById,
  removeFromQueue,
  updateQueueEntry,
  updateQueueStatus,
  type QueueEntry,
} from "@/lib/queueService";

const keys = {
  all: ["queue"] as const,
  list: (page?: number, limit?: number, filters?: any) => 
    [...keys.all, "list", page ?? 1, limit ?? 25, filters] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
};

export function useQueue(
  page = 1,
  limit = 25,
  filters?: {
    department?: string;
    status?: string;
  }
) {
  return useQuery({
    queryKey: keys.list(page, limit, filters),
    queryFn: () => fetchQueue(page, limit, filters),
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

export function useQueueEntry(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => getQueueEntryById(id),
    enabled: !!id,
  });
}

export function useAddToQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof addToQueue>[0]) => addToQueue(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateQueueStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QueueEntry["status"] }) => updateQueueStatus(id, status),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateQueueEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QueueEntry> }) => updateQueueEntry(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useRemoveFromQueue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeFromQueue(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
