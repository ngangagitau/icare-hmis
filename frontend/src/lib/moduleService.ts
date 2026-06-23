import apiClient from './api';

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  filter?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

class ModuleService<T extends { id: string }> {
  constructor(private endpoint: string) {}

  async getAll(params?: PaginationParams): Promise<T[]> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort) queryParams.append('sort', params.sort);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<T[]>(`${this.endpoint}${query}`);
  }

  async getPaginated(params?: PaginationParams): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sort) queryParams.append('sort', params.sort);

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get<PaginatedResponse<T>>(`${this.endpoint}${query}`);
  }

  async getById(id: string): Promise<T> {
    return apiClient.get<T>(`${this.endpoint}/${id}`);
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    return apiClient.post<T>(this.endpoint, data);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return apiClient.put<T>(`${this.endpoint}/${id}`, data);
  }

  async delete(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<{ success: boolean }>(`${this.endpoint}/${id}`);
  }

  async search(query: string): Promise<T[]> {
    return apiClient.get<T[]>(`${this.endpoint}?search=${encodeURIComponent(query)}`);
  }
}

export default ModuleService;
