import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, RefreshCw, AlertTriangle, Clock, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  getLiveFlow, getCongestionMetrics, prioritizePatient,
  formatWait, DEPARTMENT_LABELS, QueueFlowEntry, DepartmentFlowData
} from '@/lib/patientFlowService';

const PRIORITY_BADGE: Record<string, string> = {
  Emergency: 'bg-red-100 text-red-700',
  Urgent: 'bg-orange-100 text-orange-700',
  Normal: 'bg-blue-100 text-blue-700',
  Low: 'bg-gray-100 text-gray-600',
};

function DepartmentCard({ dept, onPrioritize }: { dept: DepartmentFlowData; onPrioritize: (entry: QueueFlowEntry) => void }) {
  return (
    <Card className={`border-2 ${dept.isCongested ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{DEPARTMENT_LABELS[dept.department] || dept.department}</span>
          <div className="flex items-center gap-2">
            {dept.isCongested && <Badge variant="destructive" className="text-xs">CONGESTED</Badge>}
            <Badge variant="outline"><Users size={12} className="mr-1" />{dept.activeCount}</Badge>
          </div>
        </CardTitle>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Avg wait: <strong>{Math.round(dept.avgWaitMinutes)}m</strong></span>
          {dept.longWaitCount > 0 && <span className="text-orange-600">{dept.longWaitCount} long wait{dept.longWaitCount > 1 ? 's' : ''}</span>}
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2 max-h-56 overflow-y-auto">
        {dept.entries.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-3">No active patients</p>
        ) : (
          dept.entries.map((entry) => (
            <div key={entry.id} className={`flex items-center gap-2 p-2 rounded text-xs border ${entry.isLongWait ? 'bg-red-50 border-red-200' : entry.isWarningWait ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}>
              <Clock size={12} className={entry.isLongWait ? 'text-red-500' : entry.isWarningWait ? 'text-orange-400' : 'text-gray-400'} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{entry.patient_name}</p>
                <p className="text-gray-400">#{entry.ticket_number} · {formatWait(entry.waitMinutes)}</p>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PRIORITY_BADGE[entry.priority] || 'bg-gray-100 text-gray-600'}`}>{entry.priority}</span>
              {entry.recommendedPriority && entry.recommendedPriority !== entry.priority && (
                <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => onPrioritize(entry)}>
                  → {entry.recommendedPriority}
                </Button>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export default function PatientFlowLivePage() {
  const queryClient = useQueryClient();
  const [prioritizeEntry, setPrioritizeEntry] = useState<QueueFlowEntry | null>(null);
  const [newPriority, setNewPriority] = useState('');
  const [reason, setReason] = useState('');

  const { data: flow, isLoading, refetch } = useQuery({
    queryKey: ['live-flow'],
    queryFn: () => getLiveFlow(),
    refetchInterval: 30_000,
  });

  const prioritizeMutation = useMutation({
    mutationFn: () => prioritizePatient(prioritizeEntry!.id, newPriority, reason),
    onSuccess: () => {
      toast({ title: `Priority updated to ${newPriority}` });
      setPrioritizeEntry(null);
      setNewPriority('');
      setReason('');
      queryClient.invalidateQueries({ queryKey: ['live-flow'] });
    },
    onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
  });

  const departments = flow ? Object.values(flow.byDepartment) : [];
  const totalActive = flow?.totalActive ?? 0;
  const totalLongWait = flow?.totalLongWait ?? 0;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Patient Flow</h1>
          <p className="text-sm text-gray-500">Real-time queue across all departments — refreshes every 30s</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          <RefreshCw size={14} className="mr-1" /> Refresh
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><Users size={22} className="text-blue-600" /><div><p className="text-xl font-bold">{totalActive}</p><p className="text-xs text-gray-500">Active Patients</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><AlertTriangle size={22} className="text-orange-500" /><div><p className="text-xl font-bold text-orange-500">{totalLongWait}</p><p className="text-xs text-gray-500">Long Waits</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Clock size={22} className="text-gray-500" /><div><p className="text-xl font-bold">{departments.filter((d) => d.isCongested).length}</p><p className="text-xs text-gray-500">Congested Depts</p></div></CardContent></Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-blue-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <DepartmentCard key={dept.department} dept={dept} onPrioritize={(e) => { setPrioritizeEntry(e); setNewPriority(e.recommendedPriority || ''); }} />
          ))}
        </div>
      )}

      {/* Priority confirmation dialog */}
      <Dialog open={!!prioritizeEntry} onOpenChange={(open) => !open && setPrioritizeEntry(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Priority Change</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-600">
              You are changing priority for <strong>{prioritizeEntry?.patient_name}</strong> (#{prioritizeEntry?.ticket_number}).
            </p>
            {prioritizeEntry?.priorityReasons && prioritizeEntry.priorityReasons.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs font-semibold text-blue-700 mb-1">AI Recommendations:</p>
                <ul className="text-xs text-blue-600 list-disc list-inside space-y-0.5">
                  {prioritizeEntry.priorityReasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">New Priority</label>
              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  {['Emergency', 'Urgent', 'Normal', 'Low'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason (optional)</label>
              <input className="w-full border rounded px-3 py-2 text-sm" placeholder="Clinical reason..." value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">⚠️ This action will be logged. Priority changes are always staff-confirmed and never automatic.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrioritizeEntry(null)}>Cancel</Button>
            <Button onClick={() => prioritizeMutation.mutate()} disabled={!newPriority || prioritizeMutation.isPending}>
              {prioritizeMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
