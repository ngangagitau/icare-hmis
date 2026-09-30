import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Clock, Loader2, Users } from "lucide-react";
import { useQueueList, useTransferQueue, useUpdateQueueStatus } from "@/hooks/useQueue";
import { getDepartmentLabel, type QueueDepartment, type QueueEntry } from "@/lib/queueService";
import { useToast } from "@/components/ui/use-toast";

const priorityStyle: Record<string, string> = {
  Emergency: "bg-red-100 text-red-700 border-red-200 animate-pulse font-bold",
  Urgent: "bg-amber-100 text-amber-800 border-amber-200 font-semibold",
  Normal: "bg-blue-50 text-blue-700 border-blue-200",
};

interface Props {
  department: QueueDepartment;
  title?: string;
}

export default function DepartmentWaitingPatients({ department, title = "Waiting Patients" }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: patients = [], isLoading } = useQueueList(department, { refetchInterval: 10000 });
  const statusMutation = useUpdateQueueStatus();
  const transferMutation = useTransferQueue();

  const handleStatusChange = async (entry: QueueEntry) => {
    const isStarting = entry.status === "Waiting";
    const sendBackToDoctor = department === "lab" && !isStarting;
    const status = isStarting ? "In Progress" : "Served";
    try {
      if (sendBackToDoctor) {
        await transferMutation.mutateAsync({
          id: entry._id,
          department: "doctor",
          serviceName: "Laboratory review",
        });
        toast({ title: "Sent back to doctor", description: `${entry.patientName} returned to the doctor queue.` });
        return;
      }

      await statusMutation.mutateAsync({ id: entry._id, status });
      if (isStarting) {
        const patient = typeof entry.patient === "object" ? entry.patient._id : entry.patient;
        const query = `?patient=${encodeURIComponent(patient)}&queueEntry=${encodeURIComponent(entry._id)}`;
        const nextStage: Record<QueueDepartment, string> = {
          opd: "/patients/queue",
          triage: "/triage",
          doctor: "/doctor",
          lab: "/laboratory/samples",
          radiology: "/radiology/imaging",
          pharmacy: "/pharmacy",
        };
        navigate(`${nextStage[department]}${query}`);
      }
    } catch {
      toast({ title: "Queue update failed", description: "Could not update patient status.", variant: "destructive" });
    }
  };

  return (
    <Card className="shadow-card border-border overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/60 pb-3">
        <CardTitle className="text-sm font-heading flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            {title}
          </span>
          <Badge variant="outline" className="text-xs font-bold">
            {patients.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-1.5 max-h-[560px] overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {!isLoading && patients.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-10">
            No patients waiting in {getDepartmentLabel(department)} queue.
          </p>
        )}
        {patients.map((patient) => (
          <div key={patient._id} className="p-3 rounded-xl border border-border transition-all hover:bg-muted/40">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-foreground">{patient.patientName}</span>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityStyle[patient.priority] || ""}`}>
                {patient.priority}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {patient.patientDisplayId} <span className="mx-1">•</span> Wait: {patient.waitTime}
            </p>
            {patient.serviceName && <p className="text-[11px] text-foreground/80 mt-1 truncate">{patient.serviceName}</p>}
            {patient.complaint && <p className="text-[11px] text-foreground/80 mt-1 truncate font-medium">{patient.complaint}</p>}
            <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between gap-1.5">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" /> {patient.status}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange(patient)}
                disabled={statusMutation.isPending || transferMutation.isPending}
                className="h-6 text-[10px] px-2 text-primary border-primary/30 hover:bg-primary/10"
              >
                {patient.status === "Waiting"
                  ? department === "lab"
                    ? "Collect Sample"
                    : department === "pharmacy"
                    ? "Dispense"
                    : department === "radiology"
                    ? "Start Imaging"
                    : "Start"
                  : department === "lab"
                  ? "Send Back to Doctor"
                  : "Complete"}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}