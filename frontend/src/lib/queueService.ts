import apiClient, { ApiResponse } from './api';

export type QueueDepartment =
  | 'opd'
  | 'triage'
  | 'doctor'
  | 'lab'
  | 'pharmacy'
  | 'radiology';

export type QueuePriority = 'Normal' | 'Urgent' | 'Emergency';
export type QueueStatus = 'Waiting' | 'In Progress' | 'Served' | 'Cancelled';

export interface QueuePatientRef {
  _id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
}

export interface QueueEntry {
  _id: string;
  ticketNumber: string;
  patient: QueuePatientRef | string;
  patientDisplayId: string;
  patientName: string;
  department: QueueDepartment;
  priority: QueuePriority;
  status: QueueStatus;
  complaint?: string;
  serviceName?: string;
  queuedAt: string;
  waitMinutes: number;
  waitTime: string;
}

export interface AddToQueuePayload {
  patientId: string;
  department: QueueDepartment;
  priority?: QueuePriority;
  complaint?: string;
  serviceName?: string;
}

export const QUEUE_DEPARTMENTS: { id: QueueDepartment; label: string; code: string }[] = [
  { id: 'opd', label: 'Outpatient (OPD)', code: 'OPD' },
  { id: 'triage', label: 'Triage', code: 'Triage' },
  { id: 'doctor', label: 'Doctor', code: 'Doctor' },
  { id: 'lab', label: 'Laboratory', code: 'Lab' },
  { id: 'pharmacy', label: 'Pharmacy', code: 'Pharmacy' },
  { id: 'radiology', label: 'Radiology', code: 'Radiology' },
];

export const SERVICE_TO_DEPARTMENT: Record<string, QueueDepartment> = {
  outpatient: 'opd',
  triage: 'triage',
  doctor: 'doctor',
  lab: 'lab',
  pharmacy: 'pharmacy',
  radiology: 'radiology',
};

function unwrap<T>(response: ApiResponse<T> & T): T {
  if (response && typeof response === 'object' && 'data' in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
}

export async function fetchQueueEntries(params?: {
  department?: QueueDepartment;
  status?: QueueStatus;
  active?: boolean;
}): Promise<QueueEntry[]> {
  const query = new URLSearchParams();
  if (params?.department) query.set('department', params.department);
  if (params?.status) query.set('status', params.status);
  if (params?.active === false) query.set('active', 'false');

  const qs = query.toString() ? `?${query.toString()}` : '';
  const response = await apiClient.get<ApiResponse<QueueEntry[]>>(`/queues${qs}`);
  return unwrap(response);
}

export async function addToQueue(payload: AddToQueuePayload): Promise<QueueEntry> {
  const response = await apiClient.post<ApiResponse<QueueEntry>>('/queues', payload);
  return unwrap(response);
}

export async function updateQueueStatus(
  id: string,
  status: QueueStatus
): Promise<QueueEntry> {
  const response = await apiClient.patch<ApiResponse<QueueEntry>>(`/queues/${id}/status`, {
    status,
  });
  return unwrap(response);
}

export async function transferQueueEntry(
  id: string,
  department: QueueDepartment,
  options?: { priority?: QueuePriority; complaint?: string; serviceName?: string }
): Promise<QueueEntry> {
  const response = await apiClient.post<ApiResponse<QueueEntry>>(
    `/queues/${id}/transfer`,
    { department, ...options }
  );
  return unwrap(response);
}

export function getDepartmentLabel(department: QueueDepartment): string {
  return QUEUE_DEPARTMENTS.find((d) => d.id === department)?.code ?? department;
}

export function calcAge(dateOfBirth?: string): number | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
