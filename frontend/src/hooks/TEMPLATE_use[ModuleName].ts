// TEMPLATE: Generic Module Hook
// Copy this and replace [ModuleName] with the actual module name

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  create[ModuleName]Item,
  delete[ModuleName]Item,
  fetch[ModuleName]Items,
  get[ModuleName]ItemById,
  update[ModuleName]Item,
  type [ModuleName]Item,
} from "@/lib/[moduleName]Service";

const keys = {
  all: ["[module-name]"] as const,
  list: (page?: number, limit?: number, filters?: any) =>
    [...keys.all, "list", page ?? 1, limit ?? 25, filters] as const,
  detail: (id: string) => [...keys.all, "detail", id] as const,
};

export function use[ModuleName]Items(
  page = 1,
  limit = 25,
  filters?: Record<string, any>
) {
  return useQuery({
    queryKey: keys.list(page, limit, filters),
    queryFn: () => fetch[ModuleName]Items(page, limit, filters),
  });
}

export function use[ModuleName]Item(id: string) {
  return useQuery({
    queryKey: keys.detail(id),
    queryFn: () => get[ModuleName]ItemById(id),
    enabled: !!id,
  });
}

export function useCreate[ModuleName]Item() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof create[ModuleName]Item>[0]) => create[ModuleName]Item(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdate[ModuleName]Item() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<[ModuleName]Item> }) => update[ModuleName]Item(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: keys.detail(id) });
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDelete[ModuleName]Item() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => delete[ModuleName]Item(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
