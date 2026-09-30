import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  getPatientRisk, assessAndSaveRisk, getRiskHistory, getPatientAlerts
} from '@/lib/clinicalIntelligenceService';
import { RiskScoreCard } from './RiskScoreCard';
import { RiskBreakdown } from './RiskBreakdown';
import { RiskHistory } from './RiskHistory';
import { ClinicalAlerts } from './ClinicalAlerts';
import { AIClinicalAssistant } from './AIClinicalAssistant';

interface Props {
  patientId: string;
  patientName: string;
}

export const PatientClinicalIntelligencePanel: React.FC<Props> = ({ patientId, patientName }) => {
  const queryClient = useQueryClient();

  const { data: risk, isLoading: riskLoading, refetch: refetchRisk } = useQuery({
    queryKey: ['patient-risk', patientId],
    queryFn: () => getPatientRisk(patientId),
    staleTime: 60_000,
  });

  const { data: history = [], isLoading: histLoading } = useQuery({
    queryKey: ['patient-risk-history', patientId],
    queryFn: () => getRiskHistory(patientId),
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['patient-alerts', patientId],
    queryFn: () => getPatientAlerts(patientId),
  });

  const saveMutation = useMutation({
    mutationFn: () => assessAndSaveRisk(patientId),
    onSuccess: () => {
      toast({ title: 'Risk assessment saved' });
      queryClient.invalidateQueries({ queryKey: ['patient-risk-history', patientId] });
    },
    onError: () => toast({ title: 'Save failed', variant: 'destructive' }),
  });

  const activeAlerts = alerts.filter((a) => a.status === 'Active').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">🧠 Clinical Intelligence — {patientName}</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => refetchRisk()}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save Assessment
          </Button>
        </div>
      </div>

      {riskLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-blue-500" />
        </div>
      ) : risk ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Risk Score */}
          <div className="md:col-span-1">
            <RiskScoreCard assessment={risk} />
          </div>

          {/* Tabs */}
          <div className="md:col-span-2">
            <Tabs defaultValue="breakdown">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                <TabsTrigger value="alerts">
                  Alerts {activeAlerts > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeAlerts}</span>}
                </TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="ai">AI Assist</TabsTrigger>
              </TabsList>

              <TabsContent value="breakdown">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Risk Factor Breakdown</CardTitle></CardHeader>
                  <CardContent>
                    <RiskBreakdown breakdown={risk.breakdown} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="alerts">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Active Clinical Alerts</CardTitle></CardHeader>
                  <CardContent>
                    {alertsLoading ? <Loader2 className="animate-spin" /> : (
                      <ClinicalAlerts
                        alerts={alerts}
                        patientId={patientId}
                        queryKey={['patient-alerts', patientId]}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Assessment History</CardTitle></CardHeader>
                  <CardContent>
                    {histLoading ? <Loader2 className="animate-spin" /> : <RiskHistory history={history} />}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ai">
                <Card>
                  <CardHeader><CardTitle className="text-sm">AI Clinical Assistant</CardTitle></CardHeader>
                  <CardContent>
                    <AIClinicalAssistant patientId={patientId} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p>No risk data available. Click Refresh to evaluate.</p>
        </div>
      )}
    </div>
  );
};
