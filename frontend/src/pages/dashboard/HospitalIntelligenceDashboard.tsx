import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertTriangle, Activity, Users, Clock, Bell, ArrowRight } from 'lucide-react';
import { getHighRiskPatients, getHospitalAlerts } from '@/lib/clinicalIntelligenceService';
import { getLiveFlow, getFlowAlerts, DEPARTMENT_LABELS } from '@/lib/patientFlowService';
import { getRiskColor } from '@/lib/clinicalIntelligenceService';

export default function HospitalIntelligenceDashboard() {
  const { data: highRisk = [] } = useQuery({
    queryKey: ['high-risk-patients'],
    queryFn: getHighRiskPatients,
    refetchInterval: 60_000,
  });

  const { data: clinicalAlerts = [] } = useQuery({
    queryKey: ['hospital-alerts', ''],
    queryFn: () => getHospitalAlerts(),
    refetchInterval: 30_000,
  });

  const { data: flow } = useQuery({
    queryKey: ['live-flow'],
    queryFn: getLiveFlow,
    refetchInterval: 30_000,
  });

  const { data: flowAlerts = [] } = useQuery({
    queryKey: ['flow-alerts'],
    queryFn: getFlowAlerts,
    refetchInterval: 30_000,
  });

  const critical = highRisk.filter((p) => p.risk_level === 'CRITICAL').length;
  const totalActive = flow?.totalActive ?? 0;
  const totalLongWait = flow?.totalLongWait ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Activity size={22} className="text-blue-600" /> Hospital Intelligence
        </h2>
        <span className="text-xs text-gray-400">Auto-refreshes every 30s</span>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><AlertTriangle size={16} className="text-red-600" /><p className="text-xs text-gray-600">Critical Risk</p></div>
            <p className="text-2xl font-bold text-red-600">{critical}</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><Bell size={16} className="text-orange-500" /><p className="text-xs text-gray-600">Clinical Alerts</p></div>
            <p className="text-2xl font-bold text-orange-500">{clinicalAlerts.length}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><Users size={16} className="text-blue-600" /><p className="text-xs text-gray-600">Active in Queue</p></div>
            <p className="text-2xl font-bold text-blue-600">{totalActive}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><Clock size={16} className="text-yellow-600" /><p className="text-xs text-gray-600">Long Waits</p></div>
            <p className="text-2xl font-bold text-yellow-600">{totalLongWait}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* High-risk patients */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">🔴 High/Critical Risk Patients</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/clinical-intelligence"><ArrowRight size={14} /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 max-h-56 overflow-y-auto">
            {highRisk.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No flagged patients</p>
            ) : (
              highRisk.slice(0, 6).map((p) => (
                <div key={p.patient_id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                  <div>
                    <p className="font-semibold text-sm">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-gray-400">{p.patient_number}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getRiskColor(p.risk_level)}`}>{Math.round(p.score)}/100</p>
                    <Badge variant={p.risk_level === 'CRITICAL' ? 'destructive' : 'secondary'} className="text-xs">{p.risk_level}</Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Flow alerts */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">⏱️ Flow Alerts</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient-flow/live"><ArrowRight size={14} /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 max-h-56 overflow-y-auto">
            {flowAlerts.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No flow alerts</p>
            ) : (
              flowAlerts.slice(0, 6).map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs border-b pb-2 last:border-0">
                  <AlertTriangle size={12} className={a.severity === 'CRITICAL' ? 'text-red-500' : 'text-orange-400'} />
                  <div className="flex-1">
                    {a.type === 'LONG_WAIT' ? (
                      <span><strong>{a.patientName}</strong> — {a.waitMinutes}m wait in {DEPARTMENT_LABELS[a.department] || a.department}</span>
                    ) : (
                      <span><strong>{DEPARTMENT_LABELS[a.department] || a.department}</strong> — congested ({a.activeCount}/{a.congestionLimit})</span>
                    )}
                  </div>
                  <Badge variant="outline" className={`text-xs ${a.severity === 'CRITICAL' ? 'text-red-600 border-red-300' : 'text-orange-600 border-orange-300'}`}>{a.severity}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department overview */}
      {flow && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">🏥 Department Queue Overview</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient-flow/live"><ArrowRight size={14} /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {Object.values(flow.byDepartment).map((dept) => (
                <div key={dept.department} className={`text-center p-2 rounded-lg border ${dept.isCongested ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <p className="text-xs font-semibold text-gray-700">{DEPARTMENT_LABELS[dept.department] || dept.department}</p>
                  <p className={`text-xl font-bold ${dept.isCongested ? 'text-red-600' : 'text-gray-800'}`}>{dept.activeCount}</p>
                  <p className="text-xs text-gray-500">{Math.round(dept.avgWaitMinutes)}m avg</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
