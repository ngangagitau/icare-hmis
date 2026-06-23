import apiClient from "@/lib/api";

export interface Ticket {
  _id?: string;
  id?: string;
  ticketId?: string;
  title: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Resolved" | "Closed" | "Reopened";
  assignedTo?: string;
  reportedBy?: string;
  department?: string;
  attachments?: string[];
  comments?: Array<{ user: string; text: string; timestamp: string }>;
  createdAt?: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export interface TicketPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalTickets: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedTickets {
  success: boolean;
  count: number;
  pagination: TicketPaginationMeta;
  data: Ticket[];
}

const unwrap = <T,>(response: any): T => {
  if (response && typeof response === "object" && "data" in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
};

export async function fetchTickets(
  page = 1,
  limit = 25,
  filters?: {
    status?: string;
    priority?: string;
    category?: string;
  }
): Promise<PaginatedTickets> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.status) params.append("status", filters.status);
  if (filters?.priority) params.append("priority", filters.priority);
  if (filters?.category) params.append("category", filters.category);

  const response = await apiClient.get<any>(`/tickets?${params.toString()}`);
  return response as PaginatedTickets;
}

export async function getTicketById(id: string): Promise<Ticket> {
  const response = await apiClient.get<any>(`/tickets/${id}`);
  return unwrap(response);
}

export async function createTicket(data: Omit<Ticket, '_id' | 'id' | 'ticketId' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
  const response = await apiClient.post<any>("/tickets", data);
  return unwrap(response);
}

export async function updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket> {
  const response = await apiClient.put<any>(`/tickets/${id}`, data);
  return unwrap(response);
}

export async function deleteTicket(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/tickets/${id}`);
}
