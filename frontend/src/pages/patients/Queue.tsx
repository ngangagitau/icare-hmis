import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import apiClient, { ApiResponse } from "@/lib/api";
import {
  QUEUE_DEPARTMENTS,
  getDepartmentLabel,
  type QueueDepartment,
  type QueueEntry,
  type QueuePriority,
} from "@/lib/queueService";
import { useAddToQueue, useQueueList, useUpdateQueueStatus } from "@/hooks/useQueue";

interface PatientOption {
  _id: string;
  patientId: string;
  firstName: string;
  lastName: string;
}

const priorities: { id: string; label: string; code: QueuePriority }[] = [
  { id: "normal", label: "Normal", code: "Normal" },
  { id: "urgent", label: "Urgent", code: "Urgent" },
  { id: "emergency", label: "Emergency", code: "Emergency" },
];

const statusColor: Record<string, string> = {
  Waiting: "bg-warning/10 text-warning",
  "In Progress": "bg-primary/10 text-primary",
  Served: "bg-success/10 text-success",
  Cancelled: "bg-muted text-muted-foreground",
};
const prioColor: Record<string, string> = {
  Normal: "secondary",
  Urgent: "destructive",
  Emergency: "destructive",
};

export default function QueueManagement() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<QueueDepartment | "">("");
  const [selectedPriority, setSelectedPriority] = useState<string>("normal");
  const [filterDept, setFilterDept] = useState<QueueDepartment | "all">("all");

  const { data: queue = [], isLoading, refetch, isFetching } = useQueueList(
    filterDept === "all" ? undefined : filterDept,
    { includeServed: true, refetchInterval: 10000 }
  );

  const addMutation = useAddToQueue();
  const statusMutation = useUpdateQueueStatus();

  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["patients", "queue-picker"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<PatientOption[]>>("/patients?limit=100");
      return res.data ?? [];
    },
  });

  const filteredQueue =
    filterDept === "all" ? queue : queue.filter((q) => q.department === filterDept);

  const handleAddToQueue = async () => {
    if (!selectedPatient || !selectedDept) return;

    const priority = priorities.find((p) => p.id === selectedPriority)?.code ?? "Normal";
    const patient = patients.find(
      (p) => p._id === selectedPatient || p.patientId === selectedPatient
    );

    try {
      await addMutation.mutateAsync({
        patientId: patient?._id ?? selectedPatient,
        department: selectedDept,
        priority,
      });
      toast({
        title: "Added to queue",
        description: `${patient?.firstName ?? "Patient"} queued for ${getDepartmentLabel(selectedDept)}`,
      });
      setDialogOpen(false);
      setSelectedPatient("");
      setSelectedDept("");
      setSelectedPriority("normal");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to add to queue";
      toast({ title: "Queue error", description: message, variant: "destructive" });
    }
  };

  const handleServe = async (entry: QueueEntry) => {
    const nextStatus = entry.status === "Waiting" ? "In Progress" : "Served";
    try {
      await statusMutation.mutateAsync({ id: entry._id, status: nextStatus });
    } catch {
      toast({ title: "Error", description: "Could not update queue status", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Queue Management</h1>
          <p className="text-muted-foreground text-sm">Patient queues across departments (live from server)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setDialogOpen(true)}>Add to Queue</Button>
        </div>
      </div>

      <Select value={filterDept} onValueChange={(v) => setFilterDept(v as QueueDepartment | "all")}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Filter department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All departments</SelectItem>
          {QUEUE_DEPARTMENTS.map((d) => (
            <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-warning">{filteredQueue.filter(q => q.status === "Waiting").length}</p><p className="text-sm text-muted-foreground">Waiting</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-primary">{filteredQueue.filter(q => q.status === "In Progress").length}</p><p className="text-sm text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold text-success">{filteredQueue.filter(q => q.status === "Served").length}</p><p className="text-sm text-muted-foreground">Served</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredQueue.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No patients in queue. Add a patient or book a service from Patient Search.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Ticket</TableHead><TableHead>Patient</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead>Wait Time</TableHead><TableHead>Priority</TableHead><TableHead>Action</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueue.map(q => (
                  <TableRow key={q._id}>
                    <TableCell className="font-mono">{q.ticketNumber}</TableCell>
                    <TableCell className="font-medium">{q.patientName}</TableCell>
                    <TableCell>{getDepartmentLabel(q.department)}</TableCell>
                    <TableCell><Badge className={statusColor[q.status]}>{q.status}</Badge></TableCell>
                    <TableCell>{q.waitTime}</TableCell>
                    <TableCell><Badge variant={prioColor[q.priority] as "secondary" | "destructive"}>{q.priority}</Badge></TableCell>
                    <TableCell>
                      {q.status !== "Served" && q.status !== "Cancelled" && (
                        <Button size="sm" variant="outline" onClick={() => handleServe(q)} disabled={statusMutation.isPending}>
                          {q.status === "Waiting" ? "Start" : "Serve"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Patient to Queue</DialogTitle>
            <DialogDescription>Select a registered patient, department, and priority</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Patient</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient} disabled={loadingPatients}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Choose a patient..."} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(patient => (
                    <SelectItem key={patient._id} value={patient._id}>
                      <div className="flex flex-col">
                        <span>{patient.firstName} {patient.lastName}</span>
                        <span className="text-xs text-muted-foreground">{patient.patientId}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDept} onValueChange={(v) => setSelectedDept(v as QueueDepartment)}>
                <SelectTrigger><SelectValue placeholder="Choose department..." /></SelectTrigger>
                <SelectContent>
                  {QUEUE_DEPARTMENTS.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority.id} value={priority.id}>{priority.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddToQueue} disabled={!selectedPatient || !selectedDept || addMutation.isPending} className="gap-2">
              {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Add to Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
