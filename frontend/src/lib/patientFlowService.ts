import apiClient from './api';

// ---- Types ----

export interface QueueFlowEntry {
  id: string;
  ticket_number: string;
  patient_id: string;
  patient_name: string;
  department: string;
  priority: string;
  status: string;
  created_at: string;
  waitMinutes: number;
  isLongWait: boolean;
  isWarningWait: boolean;
  risk_score?: number;
  risk_level?: string;
  recommendedPriority?: string;
  priorityReasons?: string[];
  assigned_to?: string;
}

export interface DepartmentFlowData {
  department: string;
  entries: QueueFlowEntry[];
  activeCount: number;
  avgWaitMinutes: number;
  longWaitCount: number;
  isCongested: boolean;
  config?: DepartmentConfig;
}

export interface LiveFlowData {
  byDepartment: Record<string, DepartmentFlowData>;
  totalActive: number;
  totalLongWait: number;
  generatedAt: string;
}

export interface CongestionMetric {
  department: string;
  activeCount: number;
  avgWaitMinutes: number;
  longWaitCount: number;
  isCongested: boolean;
  congestionLimit: number;
  warnWaitMinutes: number;
  criticalWaitMinutes: number;
}

export interface FlowAnalytics {
  period: string;
  totalPatients: number;
  avgWaitMinutes: number;
  peakHour?: number;
  peakCount?: number;
  byDepartment?: Record<string, { total: number; avgWait: number }>;
  byPriority?: Record<string, number>;
  servedCount?: number;
  cancelledCount?: number;
  dailyData?: Array<{ date: string; count: number; avgWait: number }>;
}

export interface PatientJourneyStep {
  id: string;
  department: string;
  status: string;
  priority: string;
  ticket_number: string;
  created_at: string;
  completed_at?: string;
  durationMinutes?: number;
  events: Array<{ event_type: string; performed_at: string; metadata?: Record<string, unknown> }>;
}

export interface PatientJourney {
  patientId: string;
  steps: PatientJourneyStep[];
  totalDurationMinutes?: number;
  departmentsVisited: string[];
}

export interface FlowAlert {
  type: 'LONG_WAIT' | 'CONGESTION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  patientId?: string;
  patientName?: string;
  department: string;
  waitMinutes?: number;
  ticketNumber?: string;
  queueEntryId?: string;
  activeCount?: number;
  congestionLimit?: number;
}

export interface DepartmentConfig {
  department: string;
  warn_wait_minutes: number;
  critical_wait_minutes: number;
  congestion_limit: number;
}

// ---- API Functions ----

export async function getLiveFlow(department?: string): Promise<LiveFlowData> {
  const params = department ? `?department=${department}` : '';
  const res = await apiClient.get(`/patient-flow/live${params}`);
  return res.data as LiveFlowData;
}

export async function getFlowAnalytics(
  period: 'today' | 'week' | 'month' = 'today',
  startDate?: string,
  endDate?: string
): Promise<FlowAnalytics> {
  let url = `/patient-flow/analytics?period=${period}`;
  if (startDate) url += `&startDate=${startDate}`;
  if (endDate) url += `&endDate=${endDate}`;
  const res = await apiClient.get(url);
  return res.data as FlowAnalytics;
}

export async function getCongestionMetrics(): Promise<CongestionMetric[]> {
  const res = await apiClient.get('/patient-flow/congestion');
  if (Array.isArray(res.data)) return res.data as CongestionMetric[];
  if (res.data && typeof res.data === 'object') {
    const rawObj = (res.data as any).departmentStats || res.data;
    return Object.entries(rawObj)
      .filter(([key]) => key !== 'congestionAlerts' && key !== 'workloadImbalances')
      .map(([department, val]: [string, any]) => ({
        department: val.department || department,
        activeCount: val.activeCount ?? val.waitingCount ?? 0,
        avgWaitMinutes: val.avgWaitMinutes ?? 0,
        longWaitCount: val.longWaitCount ?? 0,
        isCongested: !!val.isCongested,
        congestionLimit: val.congestionLimit ?? val.config?.congestionLimit ?? 15,
        warnWaitMinutes: val.warnWaitMinutes ?? val.config?.warnWaitMinutes ?? 30,
        criticalWaitMinutes: val.criticalWaitMinutes ?? val.config?.criticalWaitMinutes ?? 60,
      }));
  }
  return [];
}

export async function getFlowAlerts(): Promise<FlowAlert[]> {
  const res = await apiClient.get('/patient-flow/alerts');
  return res.data as FlowAlert[];
}

export async function prioritizePatient(
  queueEntryId: string,
  priority: string,
  reason: string
): Promise<void> {
  await apiClient.post(`/patient-flow/prioritize/${queueEntryId}`, { priority, reason });
}

export async function getPatientJourney(patientId: string): Promise<PatientJourney> {
  const res = await apiClient.get(`/patient-flow/patient/${patientId}/journey`);
  return res.data as PatientJourney;
}

export async function getDepartmentConfigs(): Promise<DepartmentConfig[]> {
  const res = await apiClient.get('/patient-flow/configs');
  return res.data as DepartmentConfig[];
}

export async function updateDepartmentConfig(
  department: string,
  config: Partial<Omit<DepartmentConfig, 'department'>>
): Promise<DepartmentConfig> {
  const res = await apiClient.put(`/patient-flow/configs/${department}`, config);
  return res.data as DepartmentConfig;
}

// ---- Utility ----

export function getCongestionColor(isCongested: boolean, activeCount: number, limit: number): string {
  if (isCongested) return 'text-red-600';
  if (activeCount >= limit * 0.75) return 'text-orange-500';
  return 'text-green-600';
}

export function getWaitColor(waitMinutes: number, warnMinutes: number, criticalMinutes: number): string {
  if (waitMinutes >= criticalMinutes) return 'text-red-600';
  if (waitMinutes >= warnMinutes) return 'text-orange-500';
  return 'text-green-600';
}

export function formatWait(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export const DEPARTMENT_LABELS: Record<string, string> = {
  opd: 'OPD',
  triage: 'Triage',
  doctor: 'Doctor',
  lab: 'Laboratory',
  pharmacy: 'Pharmacy',
  radiology: 'Radiology',
};
