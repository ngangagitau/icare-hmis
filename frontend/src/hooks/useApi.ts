import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

/**
 * Custom hook to fetch data using React Query
 */
export function useFetch<T>(
  key: string[],
  url: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await apiClient.get<T>(url);
      return response;
    },
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes default
  });
}

/**
 * Custom hook for creating/updating data
 */
export function useMutate<TData, TPayload>(
  mutationFn: (payload: TPayload) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    invalidateKeys?: string[][];
  }
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      // Invalidate related queries to refetch data
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }

      if (options?.onSuccess) {
        options.onSuccess(data);
      }

      toast({
        title: 'Success',
        description: 'Operation completed successfully',
      });
    },
    onError: (error: any) => {
      if (options?.onError) {
        options.onError(error);
      }

      toast({
        title: 'Error',
        description: error?.message || 'An error occurred',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Custom hook for API calls with loading state
 */
export function useApi<T>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: unknown;
    skip?: boolean;
  }
) {
  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      if (options?.method === 'POST') {
        return apiClient.post<T>(endpoint, options.data);
      }
      if (options?.method === 'PUT') {
        return apiClient.put<T>(endpoint, options.data);
      }
      if (options?.method === 'DELETE') {
        return apiClient.delete<T>(endpoint);
      }
      return apiClient.get<T>(endpoint);
    },
    enabled: !options?.skip,
  });

  return { data, isLoading, error };
}
