import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  addToQueue,
  fetchQueueEntries,
  updateQueueStatus,
  transferQueueEntry,
  type AddToQueuePayload,
  type QueueDepartment,
  type QueuePriority,
  type QueueStatus,
} from '@/lib/queueService';

export const queueKeys = {
  all: ['queues'] as const,
  department: (department?: QueueDepartment, includeServed = false) =>
    [...queueKeys.all, department ?? 'all', includeServed ? 'all-statuses' : 'active'] as const,
};

export function useQueueList(
  department?: QueueDepartment,
  options?: { refetchInterval?: number; includeServed?: boolean }
) {
  return useQuery({
    queryKey: queueKeys.department(department, options?.includeServed),
    queryFn: () =>
      fetchQueueEntries({
        department,
        active: !options?.includeServed,
      }),
    refetchInterval: options?.refetchInterval ?? 15000,
  });
}

export function useAddToQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddToQueuePayload) => addToQueue(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueKeys.all });
    },
  });
}

export function useUpdateQueueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QueueStatus }) =>
      updateQueueStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueKeys.all });
    },
  });
}

export function useTransferQueue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      department,
      priority,
      complaint,
      serviceName,
    }: {
      id: string;
      department: QueueDepartment;
      priority?: QueuePriority;
      complaint?: string;
      serviceName?: string;
    }) => transferQueueEntry(id, department, { priority, complaint, serviceName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queueKeys.all });
    },
  });
}
