import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Bell } from 'lucide-react';
import { ClinicalAlert, getSeverityColor, acknowledgeAlert } from '@/lib/clinicalIntelligenceService';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  alerts: ClinicalAlert[];
  patientId?: string;
  queryKey?: unknown[];
}

export const ClinicalAlerts: React.FC<Props> = ({ alerts, patientId, queryKey }) => {
  const queryClient = useQueryClient();

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      toast({ title: 'Alert acknowledged' });
      if (queryKey) queryClient.invalidateQueries({ queryKey });
    } catch {
      toast({ title: 'Failed to acknowledge', variant: 'destructive' });
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
        <Bell size={32} />
        <p className="text-sm">No active alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityBg(alert.severity)}`}>
          <AlertTriangle size={16} className={`shrink-0 mt-0.5 ${getSeverityColor(alert.severity).split(' ')[0]}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-xs ${getSeverityColor(alert.severity)}`}>{alert.severity}</Badge>
              <span className="font-semibold text-sm">{alert.title}</span>
              {(alert.first_name || alert.last_name) && (
                <span className="text-xs text-gray-500">— {alert.first_name} {alert.last_name} ({alert.patient_number})</span>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
            <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</p>
          </div>
          <Button size="sm" variant="ghost" className="shrink-0" onClick={() => handleAcknowledge(alert.id)}>
            <CheckCircle size={14} className="mr-1" /> Ack
          </Button>
        </div>
      ))}
    </div>
  );
};

function getSeverityBg(severity: string): string {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-50 border-red-200';
    case 'HIGH': return 'bg-orange-50 border-orange-200';
    case 'MEDIUM': return 'bg-yellow-50 border-yellow-200';
    default: return 'bg-gray-50 border-gray-200';
  }
}
