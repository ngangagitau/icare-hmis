import apiClient from './api';

// ---- Types ----

export interface RiskFactor {
  category: string;
  factor: string;
  points: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detail: string;
}

export interface RiskBreakdownCategory {
  category: string;
  score: number;
  maxScore: number;
  factors: RiskFactor[];
}

export interface RiskAssessment {
  patientId: string;
  patientName: string;
  score: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  factors: RiskFactor[];
  breakdown: RiskBreakdownCategory[];
  trend?: 'Increasing' | 'Decreasing' | 'Stable';
  scoreDelta?: number;
  rapidDeterioration?: boolean;
  previousScore?: number;
  assessedAt?: string;
  id?: string;
}

export interface ClinicalAlert {
  id: string;
  patient_id: string;
  alert_type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  created_at: string;
  acknowledged_at?: string;
  first_name?: string;
  last_name?: string;
  patient_number?: string;
}

export interface HighRiskPatient {
  id: string;
  patient_id: string;
  score: number;
  risk_level: string;
  factors: RiskFactor[];
  assessed_at: string;
  first_name: string;
  last_name: string;
  patient_number: string;
  date_of_birth: string;
  gender: string;
}

export interface AIAssistanceResult {
  text: string;
  disclaimer: string;
  model: string;
  type: string;
  generatedAt: string;
}

function unwrap<T>(response: { data?: T } | T): T {
  if (response && typeof response === 'object' && 'data' in response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
}

// ---- API Functions ----

export async function getPatientRisk(patientId: string): Promise<RiskAssessment> {
  const res = await apiClient.get(`/clinical-intelligence/${patientId}/risk`);
  return unwrap<RiskAssessment>(res);
}

export async function assessAndSaveRisk(patientId: string): Promise<RiskAssessment> {
  const res = await apiClient.post(`/clinical-intelligence/${patientId}/risk/assess`, {});
  return unwrap<RiskAssessment>(res);
}

export async function getRiskHistory(patientId: string, limit = 20): Promise<RiskAssessment[]> {
  const res = await apiClient.get(`/clinical-intelligence/${patientId}/risk-history?limit=${limit}`);
  return unwrap<RiskAssessment[]>(res);
}

export async function getPatientAlerts(patientId: string): Promise<ClinicalAlert[]> {
  const res = await apiClient.get(`/clinical-intelligence/${patientId}/clinical-alerts`);
  return unwrap<ClinicalAlert[]>(res);
}

export async function getHospitalAlerts(severity?: string): Promise<ClinicalAlert[]> {
  const params = severity ? `?severity=${severity}` : '';
  const res = await apiClient.get<{ data?: ClinicalAlert[] } | ClinicalAlert[]>(`/clinical-intelligence/alerts${params}`);
  return unwrap<ClinicalAlert[]>(res) ?? [];
}

export async function acknowledgeAlert(alertId: string): Promise<void> {
  await apiClient.patch(`/clinical-intelligence/alerts/${alertId}/acknowledge`, {});
}

export async function getHighRiskPatients(): Promise<HighRiskPatient[]> {
  const res = await apiClient.get('/clinical-intelligence/high-risk');
  return unwrap<HighRiskPatient[]>(res);
}

export async function getAIAssistance(
  patientId: string,
  type: 'summary' | 'explain_risk' | 'review_history' | 'abnormal_results' | 'handover' | 'query',
  userQuery?: string
): Promise<AIAssistanceResult> {
  const res = await apiClient.post(`/clinical-intelligence/${patientId}/ai-assist`, { type, userQuery });
  return unwrap<AIAssistanceResult>(res);
}

// ---- Utility Functions ----

export function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'CRITICAL': return 'text-red-700';
    case 'HIGH': return 'text-orange-600';
    case 'MODERATE': return 'text-yellow-600';
    case 'LOW': return 'text-green-600';
    default: return 'text-gray-500';
  }
}

export function getRiskBgColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'CRITICAL': return 'bg-red-50 border-red-200';
    case 'HIGH': return 'bg-orange-50 border-orange-200';
    case 'MODERATE': return 'bg-yellow-50 border-yellow-200';
    case 'LOW': return 'bg-green-50 border-green-200';
    default: return 'bg-gray-50 border-gray-200';
  }
}

export function getRiskBadgeVariant(riskLevel: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (riskLevel) {
    case 'CRITICAL':
    case 'HIGH':
      return 'destructive';
    case 'MODERATE':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL': return 'text-red-700 bg-red-50';
    case 'HIGH': return 'text-orange-600 bg-orange-50';
    case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
    case 'LOW': return 'text-green-600 bg-green-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

export function formatRiskScore(score: number): string {
  return `${Math.round(score)}/100`;
}
