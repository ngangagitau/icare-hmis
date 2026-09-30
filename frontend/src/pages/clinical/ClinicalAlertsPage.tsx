import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Bell } from 'lucide-react';
import { getHospitalAlerts } from '@/lib/clinicalIntelligenceService';
import { ClinicalAlerts } from '@/components/clinical/ClinicalAlerts';

export default function ClinicalAlertsPage() {
  const [severityFilter, setSeverityFilter] = useState<string>('');

  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['hospital-alerts', severityFilter],
    queryFn: () => getHospitalAlerts(severityFilter || undefined),
    refetchInterval: 30_000,
  });

  const counts = {
    CRITICAL: alerts.filter((a) => a.severity === 'CRITICAL').length,
    HIGH: alerts.filter((a) => a.severity === 'HIGH').length,
    MEDIUM: alerts.filter((a) => a.severity === 'MEDIUM').length,
    LOW: alerts.filter((a) => a.severity === 'LOW').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell size={28} className="text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clinical Alerts</h1>
            <p className="text-sm text-gray-500">Hospital-wide active clinical alerts — auto-refreshes every 30s</p>
          </div>
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Severities</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Severity counts */}
      <div className="grid grid-cols-4 gap-3">
        {(Object.entries(counts) as [string, number][]).map(([sev, count]) => (
          <Card key={sev} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSeverityFilter(sev === severityFilter ? '' : sev)}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${sev === 'CRITICAL' ? 'text-red-600' : sev === 'HIGH' ? 'text-orange-500' : sev === 'MEDIUM' ? 'text-yellow-600' : 'text-green-600'}`}>{count}</p>
              <p className="text-xs text-gray-500 mt-1">{sev}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            Active Alerts
            <Badge variant={alerts.length > 0 ? 'destructive' : 'outline'}>{alerts.length} active</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            <ClinicalAlerts alerts={alerts} queryKey={['hospital-alerts', severityFilter]} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
