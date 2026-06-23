// TEMPLATE: Generic Module Service
// Copy this and replace [ModuleName] with the actual module name
// Replace /endpoint with the actual API endpoint

import apiClient from "@/lib/api";

export interface [ModuleName]Item {
  _id?: string;
  id?: string;
  itemId?: string;
  // Add your fields here based on the module
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface [ModuleName]PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Paginated[ModuleName] {
  success: boolean;
  count: number;
  pagination: [ModuleName]PaginationMeta;
  data: [ModuleName]Item[];
}

const unwrap = <T,>(response: any): T => {
  if (response && typeof response === "object" && "data" in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

export async function fetch[ModuleName]Items(
  page = 1,
  limit = 25,
  filters?: Record<string, any>
): Promise<Paginated[ModuleName]> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, String(value));
    });
  }

  const response = await apiClient.get<any>(`/endpoint?${params.toString()}`);
  return response as Paginated[ModuleName];
}

export async function get[ModuleName]ItemById(id: string): Promise<[ModuleName]Item> {
  const response = await apiClient.get<any>(`/endpoint/${id}`);
  return unwrap(response);
}

export async function create[ModuleName]Item(
  data: Omit<[ModuleName]Item, '_id' | 'id' | 'itemId' | 'createdAt' | 'updatedAt'>
): Promise<[ModuleName]Item> {
  const response = await apiClient.post<any>("/endpoint", data);
  return unwrap(response);
}

export async function update[ModuleName]Item(id: string, data: Partial<[ModuleName]Item>): Promise<[ModuleName]Item> {
  const response = await apiClient.put<any>(`/endpoint/${id}`, data);
  return unwrap(response);
}

export async function delete[ModuleName]Item(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/endpoint/${id}`);
}
