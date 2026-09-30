import { useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock3, Loader2, Search, Stethoscope, Users } from "lucide-react";
import apiClient, { ApiResponse } from "@/lib/api";
import { SERVICE_TO_DEPARTMENT, getDepartmentLabel } from "@/lib/queueService";
import { useAddToQueue, useQueueList } from "@/hooks/useQueue";
import { useToast } from "@/components/ui/use-toast";
import { PatientMetricCard, PatientPageHeader } from "@/components/patients/PatientPageChrome";

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
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
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
      const res = await apiClient.get<ApiResponse<PatientRow[]>>(`/patients/search/${encodeURIComponent(query.trim())}`);
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

  const summaryCards = [
    { label: "Patients found", value: String(patients.length), note: "Current search result", icon: Users, tone: "cyan" as const },
    { label: "Queue active", value: String(queue.length), note: "Patients waiting now", icon: Clock3, tone: "amber" as const },
    { label: "Service ready", value: "Live", note: "Book to any department", icon: Stethoscope, tone: "emerald" as const },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PatientPageHeader
        title="Patient Search"
        icon={Search}
      >
        <Badge variant="outline" className="w-fit border-primary/20 bg-primary/5 text-primary">
          Live routing
        </Badge>
      </PatientPageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((metric) => (
          <PatientMetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <Card className="border-border shadow-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, ID, phone..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Button variant="secondary" disabled={loadingPatients} className="min-w-[120px]">
              {loadingPatients ? <Loader2 className="h-4 w-4 animate-spin" /> : `${patients.length} results`}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
            <Table className="min-w-[680px]">
              <TableHeader className="bg-muted/50 [&_tr]:border-border/70">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">ID</TableHead>
                  <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Name</TableHead>
                  <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Phone</TableHead>
                  <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Gender</TableHead>
                  <TableHead className="h-10 text-[11px] font-semibold uppercase text-muted-foreground">Scheme</TableHead>
                  <TableHead className="h-10 text-right text-[11px] font-semibold uppercase text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => (
                  <TableRow key={p._id} className="border-border/60 transition-colors hover:bg-cyan-500/[0.04]">
                    <TableCell><span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground">{p.patientId}</span></TableCell>
                    <TableCell className="font-medium text-foreground">
                      <span className="inline-flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-semibold text-cyan-700">
                          {`${p.firstName[0] || ""}${p.lastName[0] || ""}`.toUpperCase()}
                        </span>
                        {p.firstName} {p.lastName}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.phone || "Not recorded"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.gender || "Not recorded"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.insurance?.provider || "Cash"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(p);
                          setShowBookingDialog(true);
                        }}
                      >
                        Book Service
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!loadingPatients && patients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No patients found. Try a different name, ID, or phone number.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading flex items-center justify-between">
            <span>Active queue</span>
            <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
              <Clock3 className="h-3 w-3" />
              Live
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loadingQueue && <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />}
          {!loadingQueue && queue.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No patients in queue</p>}
          {queue.map((entry, i) => (
            <div key={entry._id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {i + 1}. {entry.patientName} ({entry.patientDisplayId})
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getDepartmentLabel(entry.department)} · {entry.waitTime}
                </p>
              </div>
              <Badge>{entry.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book service</DialogTitle>
            <DialogDescription>
              {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogDescription>
          </DialogHeader>

          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookService} disabled={!selectedService || addMutation.isPending}>
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Add to Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

