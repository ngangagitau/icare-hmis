import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Syringe, Search, Plus, CheckCircle2, Clock, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQueueList } from "@/hooks/useQueue";
import { calcAge, type QueueEntry } from "@/lib/queueService";
import apiClient, { ApiResponse } from "@/lib/api";

const PROCEDURE_LIST = [
  "Wound Dressing",
  "IV Cannulation",
  "Nebulization",
  "Blood Glucose Test",
  "Urinary Catheterization",
  "Nasogastric Tube Insertion",
  "Suturing",
  "Oxygen Therapy",
  "ECG Recording",
  "Blood Transfusion Setup",
];

interface ProcedureRecord {
  _id: string;
  visitDate: string;
  assessment?: string;
  progressNotes?: string[];
}

export default function NursingProcedures() {
  const { toast } = useToast();
  const { data: queuePatients = [], isLoading: queueLoading } = useQueueList("triage", { refetchInterval: 15000 });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<QueueEntry | null>(null);
  const [records, setRecords] = useState<ProcedureRecord[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  // Dialog
  const [open, setOpen] = useState(false);
  const [procedure, setProcedure] = useState("");
  const [procNote, setProcNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (queuePatients.length > 0 && !selected) setSelected(queuePatients[0]);
  }, [queuePatients, selected]);

  const loadRecords = async (patientId: string) => {
    setRecLoading(true);
    try {
      const res = await apiClient.get<ApiResponse<ProcedureRecord[]>>(
        `/medical-records?patient=${patientId}&limit=20`
      );
      const data = res && typeof res === "object" && "data" in res
        ? (res as ApiResponse<ProcedureRecord[]>).data : undefined;
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setRecords([]);
    } finally {
      setRecLoading(false);
    }
  };

  useEffect(() => {
    if (selected && typeof selected.patient === "object" && selected.patient._id) {
      loadRecords(selected.patient._id);
    }
  }, [selected]);

  const filteredPatients = queuePatients.filter((p) =>
    !search || p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.patientDisplayId?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRecord = async () => {
    if (!selected || typeof selected.patient !== "object" || !procedure) {
      toast({ title: "Missing info", description: "Select a patient and procedure.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const noteText = `Procedure: ${procedure}${procNote ? ` — ${procNote}` : ""}`;
      await apiClient.post<ApiResponse<unknown>>("/medical-records", {
        patient: selected.patient._id,
        visitDate: new Date().toISOString(),
        assessment: noteText,
        progressNotes: [noteText],
      });
      toast({ title: "Procedure Recorded", description: `${procedure} saved for ${selected.patientName}.` });
      setProcedure("");
      setProcNote("");
      setOpen(false);
      if (selected.patient._id) loadRecords(selected.patient._id);
    } catch {
      toast({ title: "Save Failed", description: "Could not record procedure.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const age = selected?.patient && typeof selected.patient === "object"
    ? calcAge(selected.patient.dateOfBirth) : null;

  // Extract procedure entries from records
  const procedureEntries = records
    .filter((r) => (r.progressNotes?.some((n) => n.startsWith("Procedure:"))) || r.assessment?.startsWith("Procedure:"))
    .flatMap((r) => {
      const notes = r.progressNotes?.filter((n) => n.startsWith("Procedure:")) ?? [];
      if (r.assessment?.startsWith("Procedure:") && !notes.includes(r.assessment)) notes.unshift(r.assessment);
      return notes.map((n) => ({ note: n.replace("Procedure: ", ""), date: r.visitDate }));
    })
    .slice(0, 20);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Syringe className="h-5 w-5 text-purple-600" />
            </div>
            Nursing Procedures
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Record nursing procedures and interventions
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          disabled={!selected}
          className="gap-1.5"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Record Procedure
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient list */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <Card className="shadow-card border-border overflow-hidden">
            <CardHeader className="py-3 px-4 bg-muted/40 border-b border-border">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Triage Queue
                <Badge variant="secondary" className="text-xs">{queuePatients.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-[480px] overflow-y-auto space-y-1.5">
              {queueLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              {!queueLoading && filteredPatients.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">Queue is empty.</p>
              )}
              {filteredPatients.map((p) => {
                const isSelected = selected?._id === p._id;
                const patAge = typeof p.patient === "object" ? calcAge(p.patient.dateOfBirth) : null;
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => { setSelected(p); setRecords([]); }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/40 hover:border-primary/30"
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground truncate">{p.patientName}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {p.patientDisplayId}{patAge != null && ` · ${patAge}y`} · {p.waitTime}
                    </p>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Procedures panel */}
        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              {/* Patient chip */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{selected.patientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {selected.patientDisplayId}
                      {age != null && ` · ${age} yrs`}
                      {selected.complaint && ` · ${selected.complaint}`}
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>

              <Card className="shadow-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    Recorded Procedures
                    <Badge variant="secondary" className="text-xs">{procedureEntries.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : procedureEntries.length === 0 ? (
                    <div className="text-center py-10 border border-dashed rounded-lg">
                      <Syringe className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No procedures recorded yet.</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Click "Record Procedure" to add one.</p>
                    </div>
                  ) : (
                    <div className="overflow-auto rounded-lg border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40">
                            <TableHead className="text-xs font-semibold">Procedure / Note</TableHead>
                            <TableHead className="text-xs font-semibold">Date</TableHead>
                            <TableHead className="text-xs font-semibold">Time</TableHead>
                            <TableHead className="text-xs font-semibold text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {procedureEntries.map((e, i) => (
                            <TableRow key={i} className="hover:bg-muted/20">
                              <TableCell className="text-sm font-medium py-3">
                                {e.note.split(" — ")[0]}
                                {e.note.includes(" — ") && (
                                  <p className="text-xs text-muted-foreground font-normal mt-0.5">
                                    {e.note.split(" — ")[1]}
                                  </p>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(e.date).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(e.date).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Done
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="shadow-card border-border">
              <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center gap-3">
                <Syringe className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-semibold text-muted-foreground">No patient selected</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Record Procedure Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Syringe className="h-4 w-4 text-purple-600" />
              Record Nursing Procedure
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="p-3 rounded-lg bg-muted/40 border border-border">
              <p className="text-sm font-semibold text-foreground">{selected?.patientName}</p>
              <p className="text-xs text-muted-foreground">{selected?.patientDisplayId}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Procedure</Label>
              <Select value={procedure} onValueChange={setProcedure}>
                <SelectTrigger>
                  <SelectValue placeholder="Select procedure..." />
                </SelectTrigger>
                <SelectContent>
                  {PROCEDURE_LIST.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Additional Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                rows={3}
                value={procNote}
                onChange={(e) => setProcNote(e.target.value)}
                placeholder="Site, gauge, outcome, patient response..."
                className="text-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleRecord} disabled={isSaving || !procedure} className="gap-1.5">
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Save Procedure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
