import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeartPulse, Thermometer, Activity, Droplets, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useQueueList, useTransferQueue, useUpdateQueueStatus } from "@/hooks/useQueue";
import { calcAge, type QueueEntry } from "@/lib/queueService";
import { useToast } from "@/components/ui/use-toast";

const priorityStyle: Record<string, string> = {
  Emergency: "bg-destructive/10 text-destructive border-destructive/20",
  Urgent: "bg-warning/10 text-warning border-warning/20",
  Normal: "bg-success/10 text-success border-success/20",
};

const TriageNursing = () => {
  const { toast } = useToast();
  const { data: queuePatients = [], isLoading } = useQueueList("triage", { refetchInterval: 10000 });
  const [selectedPatient, setSelectedPatient] = useState<QueueEntry | null>(null);
  const statusMutation = useUpdateQueueStatus();
  const transferMutation = useTransferQueue();

  useEffect(() => {
    if (queuePatients.length > 0 && !selectedPatient) {
      setSelectedPatient(queuePatients[0]);
    }
    if (selectedPatient && !queuePatients.find((p) => p._id === selectedPatient._id)) {
      setSelectedPatient(queuePatients[0] ?? null);
    }
  }, [queuePatients, selectedPatient]);

  const handleStart = async (entry: QueueEntry) => {
    if (entry.status === "Waiting") {
      await statusMutation.mutateAsync({ id: entry._id, status: "In Progress" });
    }
  };

  const handleSendToDoctor = async () => {
    if (!selectedPatient) return;
    try {
      await transferMutation.mutateAsync({ id: selectedPatient._id, department: "doctor" });
      toast({ title: "Transferred", description: "Patient sent to doctor queue" });
    } catch {
      toast({ title: "Error", description: "Could not transfer patient", variant: "destructive" });
    }
  };

  const age = selectedPatient?.patient && typeof selectedPatient.patient === "object"
    ? calcAge(selectedPatient.patient.dateOfBirth)
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold">Triage & Nursing</h1>
        <p className="text-sm text-muted-foreground mt-1">Assess patients and record vitals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Triage Queue ({queuePatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && queuePatients.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No patients in triage queue</p>
            )}
            {queuePatients.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => { setSelectedPatient(p); handleStart(p); }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedPatient?._id === p._id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{p.patientName}</span>
                  <Badge variant="outline" className={`text-[10px] ${priorityStyle[p.priority]}`}>{p.priority}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {p.patientDisplayId}
                  {typeof p.patient === "object" && p.patient?.dateOfBirth && ` · ${calcAge(p.patient.dateOfBirth)}y`}
                  {" · Wait: "}{p.waitTime}
                </p>
                {p.complaint && <p className="text-xs text-muted-foreground mt-1">Chief complaint: {p.complaint}</p>}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-heading">
                {selectedPatient ? `Recording Vitals — ${selectedPatient.patientName}` : "Select a patient"}
              </CardTitle>
              {selectedPatient && (
                <Badge variant="outline" className="text-xs">{selectedPatient.patientDisplayId}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedPatient ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Select a patient from the triage queue</p>
            ) : (
              <Tabs defaultValue="vitals">
                <TabsList className="mb-4">
                  <TabsTrigger value="vitals">Vitals</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="notes">Nursing Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="vitals">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-xs">
                        <HeartPulse className="h-3.5 w-3.5 text-destructive" /> Blood Pressure
                      </Label>
                      <div className="flex gap-2">
                        <Input placeholder="Sys" className="text-center" />
                        <Input placeholder="Dia" className="text-center" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-xs">
                        <Activity className="h-3.5 w-3.5 text-info" /> Heart Rate
                      </Label>
                      <Input placeholder="bpm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-xs">
                        <Thermometer className="h-3.5 w-3.5 text-warning" /> Temperature
                      </Label>
                      <Input placeholder="°C" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-xs">
                        <Droplets className="h-3.5 w-3.5 text-primary" /> SpO2
                      </Label>
                      <Input placeholder="%" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Respiratory Rate</Label>
                      <Input placeholder="breaths/min" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Weight (kg){age != null ? ` — age ${age}y` : ""}</Label>
                      <Input placeholder="kg" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline">Save Draft</Button>
                    <Button className="gap-2" onClick={handleSendToDoctor} disabled={transferMutation.isPending}>
                      Save & Send to Doctor <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <div className="text-sm text-muted-foreground space-y-3">
                    <p className="text-xs">Vitals history will appear here once saved to medical records.</p>
                  </div>
                </TabsContent>

                <TabsContent value="notes">
                  <textarea
                    className="w-full h-32 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter nursing notes..."
                  />
                  <div className="flex justify-end mt-3">
                    <Button>Save Notes</Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TriageNursing;
