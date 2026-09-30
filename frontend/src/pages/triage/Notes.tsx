import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, ClipboardList, Search, Clock, User, CheckCircle2, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQueueList } from "@/hooks/useQueue";
import { calcAge, type QueueEntry } from "@/lib/queueService";
import apiClient, { ApiResponse } from "@/lib/api";

interface MedicalRecord {
  _id: string;
  visitDate: string;
  assessment?: string;
  progressNotes?: string[];
}

export default function CareNotes() {
  const { toast } = useToast();
  const { data: queuePatients = [], isLoading: queueLoading } = useQueueList("triage", { refetchInterval: 15000 });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<QueueEntry | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    if (queuePatients.length > 0 && !selected) {
      setSelected(queuePatients[0]);
    }
  }, [queuePatients, selected]);

  const loadRecords = useCallback(async (patientId: string) => {
    setRecLoading(true);
    try {
      const res = await apiClient.get<ApiResponse<MedicalRecord[]>>(
        `/medical-records?patient=${patientId}&limit=20`
      );
      const data = res && typeof res === "object" && "data" in res
        ? (res as ApiResponse<MedicalRecord[]>).data : undefined;
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setRecords([]);
    } finally {
      setRecLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selected && typeof selected.patient === "object" && selected.patient._id) {
      loadRecords(selected.patient._id);
    }
  }, [selected, loadRecords]);

  const filteredPatients = queuePatients.filter((p) =>
    !search || p.patientName.toLowerCase().includes(search.toLowerCase()) ||
    p.patientDisplayId?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!selected || typeof selected.patient !== "object" || !noteText.trim()) {
      toast({ title: "Cannot save", description: "Select a patient and enter a note.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.post<ApiResponse<unknown>>("/medical-records", {
        patient: selected.patient._id,
        visitDate: new Date().toISOString(),
        assessment: noteText.trim(),
        progressNotes: [noteText.trim()],
      });
      toast({ title: "Note Saved", description: `Care note appended to ${selected.patientName}'s record.` });
      setNoteText("");
      // Reload records
      if (selected.patient._id) loadRecords(selected.patient._id);
    } catch {
      toast({ title: "Save Failed", description: "Could not save care note.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const age = selected?.patient && typeof selected.patient === "object"
    ? calcAge(selected.patient.dateOfBirth) : null;

  // Flatten notes from records
  const allNotes = records
    .filter((r) => (r.progressNotes?.length ?? 0) > 0 || r.assessment)
    .flatMap((r) => {
      const notes = r.progressNotes?.filter(Boolean) ?? [];
      if (r.assessment && !notes.includes(r.assessment)) notes.unshift(r.assessment);
      return notes.map((n) => ({ note: n, date: r.visitDate }));
    })
    .slice(0, 15);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
            <ClipboardList className="h-5 w-5 text-indigo-600" />
          </div>
          Nursing Care Notes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Document nursing observations, interventions, and care given
        </p>
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
            <CardContent className="p-2 max-h-[500px] overflow-y-auto space-y-1.5">
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
                    onClick={() => { setSelected(p); setNoteText(""); setRecords([]); }}
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

        {/* Notes panel */}
        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              {/* Patient chip */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-indigo-600" />
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

              {/* New note */}
              <Card className="shadow-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    New Care Note
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Document observations, interventions, patient concerns, and clinical findings
                    </Label>
                    <Textarea
                      rows={6}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Patient presents with... IV access established at left forearm... Allergies noted: ... Patient is alert and oriented to..."
                      className="text-sm resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setNoteText("")}>Clear</Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving || !noteText.trim()}
                      className="gap-1.5"
                    >
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      Save Note
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Previous notes */}
              <Card className="shadow-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center justify-between">
                    Previous Notes
                    <Badge variant="secondary" className="text-xs">{allNotes.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : allNotes.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">No previous notes found for this patient.</p>
                  ) : (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                      {allNotes.map((n, i) => (
                        <div key={i} className="p-3 rounded-lg border border-border bg-muted/20">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-semibold text-foreground">
                              {new Date(n.date).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(n.date).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{n.note}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="shadow-card border-border">
              <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center gap-3">
                <ClipboardList className="h-10 w-10 text-muted-foreground/30" />
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">No patient selected</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Select a patient from the queue to write care notes.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
