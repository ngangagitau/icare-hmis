import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import apiClient, { ApiResponse } from "@/lib/api";
import { SERVICE_TO_DEPARTMENT, getDepartmentLabel } from "@/lib/queueService";
import { useAddToQueue, useQueueList } from "@/hooks/useQueue";
import { useToast } from "@/components/ui/use-toast";

interface PatientRow {
  _id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  insurance?: { provider?: string };
}

const services = [
  { id: "outpatient", label: "Outpatient Consultation", dept: "Outpatient" },
  { id: "lab", label: "Laboratory Test", dept: "Laboratory" },
  { id: "pharmacy", label: "Pharmacy Collection", dept: "Pharmacy" },
  { id: "radiology", label: "Radiology Scan", dept: "Radiology" },
  { id: "doctor", label: "Doctor Consultation", dept: "Doctor" },
  { id: "triage", label: "Triage Nursing", dept: "Triage" },
];

export default function SearchPatients() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedService, setSelectedService] = useState("");

  const addMutation = useAddToQueue();
  const { data: queue = [], isLoading: loadingQueue } = useQueueList(undefined, { refetchInterval: 10000 });

  const { data: patients = [], isLoading: loadingPatients } = useQuery({
    queryKey: ["patients", "search", query],
    queryFn: async () => {
      if (query.trim().length < 2) {
        const res = await apiClient.get<ApiResponse<PatientRow[]>>("/patients?limit=50");
        return res.data ?? [];
      }
      const res = await apiClient.get<ApiResponse<PatientRow[]>>(
        `/patients/search/${encodeURIComponent(query.trim())}`
      );
      return res.data ?? [];
    },
  });

  const handleBookService = async () => {
    if (!selectedPatient || !selectedService) return;
    const service = services.find((s) => s.id === selectedService);
    const department = SERVICE_TO_DEPARTMENT[selectedService];
    if (!department) return;

    try {
      await addMutation.mutateAsync({
        patientId: selectedPatient._id,
        department,
        serviceName: service?.label,
        priority: "Normal",
      });
      toast({ title: "Queued", description: `${selectedPatient.firstName} added to ${service?.dept}` });
      setShowBookingDialog(false);
      setSelectedPatient(null);
      setSelectedService("");
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Patient Search & Queue Management</h1>
        <p className="text-muted-foreground text-sm">Search patients and push them to department queues</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search name, ID, phone..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
            </div>
            <Button variant="secondary" disabled={loadingPatients}>
              {loadingPatients ? <Loader2 className="h-4 w-4 animate-spin" /> : `${patients.length} results`}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Gender</TableHead><TableHead>Scheme</TableHead><TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-mono text-sm">{p.patientId}</TableCell>
                  <TableCell>{p.firstName} {p.lastName}</TableCell>
                  <TableCell>{p.phone}</TableCell>
                  <TableCell>{p.gender}</TableCell>
                  <TableCell><Badge variant="secondary">{p.insurance?.provider || "Cash"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => { setSelectedPatient(p); setShowBookingDialog(true); }}>Book Service</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Active Queue ({queue.length})</span>
            <span className="text-xs font-normal text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Live</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingQueue && <Loader2 className="h-5 w-5 animate-spin mx-auto" />}
          {!loadingQueue && queue.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No patients in queue</p>}
          {queue.map((entry, i) => (
            <div key={entry._id} className="flex justify-between p-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium">{i + 1}. {entry.patientName} ({entry.patientDisplayId})</p>
                <p className="text-xs text-muted-foreground">{getDepartmentLabel(entry.department)} · {entry.waitTime}</p>
              </div>
              <Badge>{entry.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Service</DialogTitle>
            <DialogDescription>{selectedPatient?.firstName} {selectedPatient?.lastName}</DialogDescription>
          </DialogHeader>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger><SelectValue placeholder="Service" /></SelectTrigger>
            <SelectContent>
              {services.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>Cancel</Button>
            <Button onClick={handleBookService} disabled={!selectedService || addMutation.isPending}>
              <CheckCircle2 className="h-4 w-4 mr-1" /> Add to Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
