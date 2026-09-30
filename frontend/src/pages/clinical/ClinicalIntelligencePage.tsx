import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, AlertTriangle, Activity } from 'lucide-react';
import { getHighRiskPatients, HighRiskPatient, getRiskColor, formatRiskScore } from '@/lib/clinicalIntelligenceService';
import { PatientClinicalIntelligencePanel } from '@/components/clinical/PatientClinicalIntelligencePanel';
import { calculateAge } from '@/lib/utils';

export default function ClinicalIntelligencePage() {
  const [selectedPatient, setSelectedPatient] = useState<HighRiskPatient | null>(null);
  const [search, setSearch] = useState('');

  const { data: highRisk = [], isLoading } = useQuery({
    queryKey: ['high-risk-patients'],
    queryFn: getHighRiskPatients,
    refetchInterval: 60_000,
  });

  const filtered = highRisk.filter((p) =>
    `${p.first_name} ${p.last_name} ${p.patient_number}`.toLowerCase().includes(search.toLowerCase())
  );

  const critical = highRisk.filter((p) => p.risk_level === 'CRITICAL').length;
  const high = highRisk.filter((p) => p.risk_level === 'HIGH').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Activity size={28} className="text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinical Intelligence</h1>
          <p className="text-sm text-gray-500">Deterministic risk scoring — scores are calculated, not generated</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle size={24} className="text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">{critical}</p>
              <p className="text-xs text-gray-500">Critical Risk</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle size={24} className="text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-orange-500">{high}</p>
              <p className="text-xs text-gray-500">High Risk</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Activity size={24} className="text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{highRisk.length}</p>
              <p className="text-xs text-gray-500">Total Flagged</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient list */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              High/Critical Risk Patients
              <Badge variant="destructive">{highRisk.length}</Badge>
            </CardTitle>
            <div className="relative mt-2">
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              <Input
                className="pl-8 text-sm"
                placeholder="Search patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No flagged patients</p>
            ) : (
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {filtered.map((p) => (
                  <button
                    key={p.patient_id}
                    onClick={() => setSelectedPatient(p)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${selectedPatient?.patient_id === p.patient_id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-gray-400">{p.patient_number} · {p.gender} · Age {calculateAge(p.date_of_birth)}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getRiskColor(p.risk_level)}`}>{Math.round(p.score)}</p>
                        <Badge
                          className="text-xs"
                          variant={p.risk_level === 'CRITICAL' || p.risk_level === 'HIGH' ? 'destructive' : 'secondary'}
                        >
                          {p.risk_level}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <PatientClinicalIntelligencePanel
              patientId={selectedPatient.patient_id}
              patientName={`${selectedPatient.first_name} ${selectedPatient.last_name}`}
            />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center text-gray-400 py-16">
                <Activity size={48} className="mx-auto mb-3 opacity-30" />
                <p>Select a patient to view their clinical intelligence report</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
