import apiClient from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
    permissions?: any[];
  };
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface User {
  id: string;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: string;
  department?: string;
  phone?: string;
  isActive?: boolean;
  permissions?: any[];
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

    if (response.token) {
      apiClient.setToken(response.token);
    }

    return response;
  }

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);

    if (response.token) {
      apiClient.setToken(response.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      apiClient.logout();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<any>('/auth/me');
    // Handle both response formats (with or without wrapper)
    return response.user || response;
  }

  async refreshToken(): Promise<string> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh');
    if (response.token) {
      apiClient.setToken(response.token);
    }
    return response.token;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put<User>('/auth/profile', data);
  }

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  getToken(): string | null {
    return apiClient.getToken();
  }
}

export const authService = new AuthService();
export default authService;
