import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, Clock3, Loader2, RefreshCw, Users, Workflow } from "lucide-react";
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
import { PatientMetricCard, PatientPageHeader } from "@/components/patients/PatientPageChrome";

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
  Waiting: "bg-warning/10 text-warning border-warning/20",
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  Served: "bg-success/10 text-success border-success/20",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

const prioColor: Record<string, "secondary" | "destructive"> = {
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

  const filteredQueue = filterDept === "all" ? queue : queue.filter((q) => q.department === filterDept);

  const handleAddToQueue = async () => {
    if (!selectedPatient || !selectedDept) return;

    const priority = priorities.find((p) => p.id === selectedPriority)?.code ?? "Normal";
    const patient = patients.find((p) => p._id === selectedPatient || p.patientId === selectedPatient);

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
        err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to add to queue";
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

  const summaryCards = [
    { label: "Waiting", value: String(filteredQueue.filter((q) => q.status === "Waiting").length), note: "Pending service", icon: Clock3, tone: "amber" as const },
    { label: "In progress", value: String(filteredQueue.filter((q) => q.status === "In Progress").length), note: "Currently active", icon: Workflow, tone: "cyan" as const },
    { label: "Served", value: String(filteredQueue.filter((q) => q.status === "Served").length), note: "Completed today", icon: Users, tone: "emerald" as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PatientPageHeader
        title="Queue Management"
        icon={Workflow}
      >
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-1 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setDialogOpen(true)}>Add to Queue</Button>
      </PatientPageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((metric) => (
          <PatientMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <Card className="border-border shadow-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base font-heading">Queue overview</CardTitle>

            <Select value={filterDept} onValueChange={(v) => setFilterDept(v as QueueDepartment | "all")}>
              <SelectTrigger className="w-full md:w-56">
                <SelectValue placeholder="Filter department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {QUEUE_DEPARTMENTS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredQueue.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No patients in queue. Add a patient or book a service from Patient Search.</p>
          ) : (
              <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
                <Table className="min-w-[820px]">
                  <TableHeader className="bg-muted/50 [&_tr]:border-border/70">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Ticket</TableHead>
                      <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Patient</TableHead>
                      <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Department</TableHead>
                      <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Status</TableHead>
                      <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Wait Time</TableHead>
                      <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Priority</TableHead>
                      <TableHead className="h-10 text-right text-[11px] font-semibold uppercase text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueue.map((q) => (
                    <TableRow key={q._id} className="border-border/60 transition-colors hover:bg-cyan-500/[0.04]">
                      <TableCell><span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">{q.ticketNumber}</span></TableCell>
                      <TableCell className="font-semibold text-foreground">{q.patientName}</TableCell>
                      <TableCell>{getDepartmentLabel(q.department)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColor[q.status] || "bg-muted text-foreground border-border"}>
                          {q.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{q.waitTime}</TableCell>
                      <TableCell>
                        <Badge variant={prioColor[q.priority] || "secondary"}>{q.priority}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add patient to queue</DialogTitle>
            <DialogDescription>Select a registered patient, department, and priority</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select patient</label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient} disabled={loadingPatients}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Choose a patient..."} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient._id} value={patient._id}>
                      <div className="flex flex-col">
                        <span>
                          {patient.firstName} {patient.lastName}
                        </span>
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
                <SelectTrigger>
                  <SelectValue placeholder="Choose department..." />
                </SelectTrigger>
                <SelectContent>
                  {QUEUE_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.id} value={priority.id}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToQueue} disabled={!selectedPatient || !selectedDept || addMutation.isPending}>
              {addMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Add to Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

