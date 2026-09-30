import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  HeartPulse,
  Thermometer,
  Activity,
  Droplets,
  Clock,
  Loader2,
  Brain,
  Stethoscope,
  AlertTriangle,
  Users,
  Send,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Scale,
  Wind,
  User,
  Phone,
  Calendar,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  Syringe,
} from "lucide-react";
import { useQueueList, useTransferQueue, useUpdateQueueStatus } from "@/hooks/useQueue";
import { calcAge, type QueueEntry } from "@/lib/queueService";
import { useToast } from "@/components/ui/use-toast";
import apiClient, { ApiResponse } from "@/lib/api";

/* ─── Priority badge config ─────────────────────────────────────────── */
const priorityConfig: Record<string, { label: string; bg: string; dot: string; text: string }> = {
  Emergency: { label: "Emergency", bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500", text: "text-red-700" },
  Urgent:    { label: "Urgent",    bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", text: "text-amber-700" },
  Normal:    { label: "Normal",    bg: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500", text: "text-green-700" },
};

/* ─── Vital Signs status helper ─────────────────────────────────────── */
function vitalStatus(field: string, value: number): "normal" | "warning" | "critical" {
  const ranges: Record<string, { warn: [number, number]; crit: [number, number] }> = {
    sys: { warn: [140, 180], crit: [180, 999] },
    dia: { warn: [90, 110], crit: [110, 999] },
    hr:  { warn: [50, 100], crit: [40, 120] },
    temp: { warn: [37.5, 38.5], crit: [38.5, 42] },
    spo2: { warn: [94, 97], crit: [0, 92] },
    rr:  { warn: [12, 20], crit: [8, 30] },
  };
  const r = ranges[field];
  if (!r || !value) return "normal";
  if (field === "spo2" || field === "hr") {
    if (value < r.crit[0] || value > r.crit[1]) return "critical";
    if (value < r.warn[0] || value > r.warn[1]) return "warning";
  } else {
    if (value >= r.crit[0]) return "critical";
    if (value >= r.warn[0]) return "warning";
  }
  return "normal";
}

const statusRing: Record<string, string> = {
  normal:   "border-border",
  warning:  "border-amber-400 bg-amber-50/50",
  critical: "border-red-400 bg-red-50/50 animate-pulse",
};

/* ─── Component ─────────────────────────────────────────────────────── */
export default function TriageNursing() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: queuePatients = [], isLoading } = useQueueList("triage", { refetchInterval: 10000 });
  const { data: allTriageToday = [] } = useQueueList("triage", { includeServed: true, refetchInterval: 30000 });

  const [selectedPatient, setSelectedPatient] = useState<QueueEntry | null>(null);
  const [activeTab, setActiveTab] = useState("vitals");

  // Vitals
  const [sys, setSys]       = useState("");
  const [dia, setDia]       = useState("");
  const [hr, setHr]         = useState("");
  const [temp, setTemp]     = useState("");
  const [spo2, setSpo2]     = useState("");
  const [rr, setRr]         = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [pain, setPain]     = useState("");
  const [notes, setNotes]   = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const statusMutation   = useUpdateQueueStatus();
  const transferMutation = useTransferQueue();

  useEffect(() => {
    if (queuePatients.length > 0 && !selectedPatient) {
      setSelectedPatient(queuePatients[0]);
    }
    if (selectedPatient && !queuePatients.find((p) => p._id === selectedPatient._id)) {
      setSelectedPatient(queuePatients[0] ?? null);
    }
  }, [queuePatients, selectedPatient]);

  const handleSelectPatient = async (p: QueueEntry) => {
    setSelectedPatient(p);
    // Reset vitals on patient change
    setSys(""); setDia(""); setHr(""); setTemp(""); setSpo2(""); setRr("");
    setWeight(""); setHeight(""); setPain(""); setNotes("");
    if (p.status === "Waiting") {
      await statusMutation.mutateAsync({ id: p._id, status: "In Progress" });
    }
  };

  const saveTriageRecord = async () => {
    if (!selectedPatient || typeof selectedPatient.patient !== "object") return;
    const bmi = weight && height ? (Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1) : undefined;
    await apiClient.post<ApiResponse<unknown>>("/medical-records", {
      patient: selectedPatient.patient._id,
      visitDate: new Date().toISOString(),
      vitalSigns: {
        bloodPressure: sys && dia ? `${sys}/${dia}` : undefined,
        heartRate: hr ? Number(hr) : undefined,
        temperature: temp ? Number(temp) : undefined,
        oxygenSaturation: spo2 ? Number(spo2) : undefined,
        respiratoryRate: rr ? Number(rr) : undefined,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        bmi: bmi ? Number(bmi) : undefined,
        painScore: pain ? Number(pain) : undefined,
      },
      assessment: notes || "Triage assessment recorded",
      progressNotes: notes ? [notes] : [],
    });
  };

  const handleSendToDoctor = async () => {
    if (!selectedPatient) return;
    setIsSaving(true);
    try {
      await saveTriageRecord();
      await transferMutation.mutateAsync({ id: selectedPatient._id, department: "doctor" });
      toast({ title: "✓ Transferred to Doctor", description: `${selectedPatient.patientName} moved to consultation queue.` });
      setSys(""); setDia(""); setHr(""); setTemp(""); setSpo2(""); setRr("");
      setWeight(""); setHeight(""); setPain(""); setNotes("");
    } catch {
      toast({ title: "Transfer Failed", description: "Could not transfer patient", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveTriageRecord();
      toast({ title: "Vitals Saved", description: "Triage record saved to patient chart." });
    } catch {
      toast({ title: "Save Failed", description: "Could not save vitals", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  /* ─── Computed stats ─── */
  const completedToday = allTriageToday.filter(
    (e) => e.servedAt && new Date(e.servedAt).toDateString() === new Date().toDateString()
  );
  const emergencyCount = queuePatients.filter((p) => p.priority === "Emergency").length;
  const urgentCount    = queuePatients.filter((p) => p.priority === "Urgent").length;

  const durations = completedToday
    .filter((e) => e.queuedAt && e.servedAt)
    .map((e) => (new Date(e.servedAt!).getTime() - new Date(e.queuedAt).getTime()) / 60000)
    .filter((m) => m >= 0);
  const avgTime = durations.length
    ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(0)
    : "—";

  /* ─── Derived vitals alerts ─── */
  const alerts: string[] = [];
  if (Number(sys) >= 180 || Number(dia) >= 110) alerts.push("Hypertensive crisis");
  else if (Number(sys) >= 140 || Number(dia) >= 90) alerts.push("Elevated BP");
  if (Number(spo2) > 0 && Number(spo2) < 92) alerts.push("Hypoxia (SpO2 < 92%)");
  if (Number(temp) >= 38.5) alerts.push("Febrile");
  if (Number(hr) > 120) alerts.push("Tachycardia");
  if (Number(hr) > 0 && Number(hr) < 50) alerts.push("Bradycardia");

  const age =
    selectedPatient?.patient && typeof selectedPatient.patient === "object"
      ? calcAge(selectedPatient.patient.dateOfBirth)
      : null;

  const patientInfo = selectedPatient?.patient && typeof selectedPatient.patient === "object"
    ? selectedPatient.patient : null;

  const bmi = weight && height
    ? (Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1)
    : null;

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <HeartPulse className="h-5 w-5 text-primary" />
            </div>
            Triage & Nursing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Patient assessment, vital signs capture, and clinical handover
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/patient-flow/live")}
            className="gap-1.5 text-xs"
          >
            <Clock className="h-3.5 w-3.5" />
            Queue Radar
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/clinical-intelligence")}
            className="gap-1.5 text-xs"
          >
            <Brain className="h-3.5 w-3.5" />
            Clinical Intelligence
          </Button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Triage Queue",
            value: queuePatients.length,
            sub: "Active patients",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-l-blue-500",
          },
          {
            label: "Emergency / Red",
            value: emergencyCount,
            sub: "Immediate care",
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-l-red-500",
          },
          {
            label: "Avg. Triage Time",
            value: avgTime === "—" ? avgTime : `${avgTime}m`,
            sub: "Door-to-assessment",
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-l-emerald-500",
          },
          {
            label: "Passed to Doctor",
            value: completedToday.length,
            sub: "Today's handovers",
            icon: Stethoscope,
            color: "text-violet-600",
            bg: "bg-violet-50",
            border: "border-l-violet-500",
          },
        ].map((s) => (
          <Card key={s.label} className={`shadow-card border-l-4 ${s.border}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-heading font-bold text-foreground mt-0.5">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
              <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Priority bar ── */}
      {(emergencyCount > 0 || urgentCount > 0) && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <span className="text-sm font-medium text-red-800">
            Priority alerts:&nbsp;
            {emergencyCount > 0 && <span className="font-bold">{emergencyCount} Emergency</span>}
            {emergencyCount > 0 && urgentCount > 0 && ", "}
            {urgentCount > 0 && <span>{urgentCount} Urgent</span>}
            &nbsp;— attend immediately.
          </span>
        </div>
      )}

      {/* ── Main Workbench ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Patient Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" />
              Waiting Patients
            </h2>
            <Badge variant="secondary" className="text-xs">
              {queuePatients.length} in queue
            </Badge>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            {!isLoading && queuePatients.length === 0 && (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Triage queue is clear.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Waiting for OPD check-ins.</p>
              </div>
            )}
            {queuePatients.map((p) => {
              const isSelected = selectedPatient?._id === p._id;
              const pConf = priorityConfig[p.priority] || priorityConfig.Normal;
              const patAge = typeof p.patient === "object" ? calcAge(p.patient.dateOfBirth) : null;
              return (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => handleSelectPatient(p)}
                  className={`w-full text-left rounded-lg border transition-all duration-150 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{p.patientName}</p>
                        <p className="text-xs text-muted-foreground">{p.patientDisplayId}{patAge != null && ` · ${patAge}y`}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${pConf.bg}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${pConf.dot}`} />
                        {pConf.label}
                      </span>
                    </div>
                    {p.complaint && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{p.complaint}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Wait: {p.waitTime}
                      </span>
                      {p.status === "In Progress" && (
                        <span className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
                          In Progress
                        </span>
                      )}
                      {isSelected && (
                        <ChevronRight className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Assessment Workbench */}
        <div className="lg:col-span-2">
          {!selectedPatient ? (
            <Card className="shadow-card border-border h-full">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                  <ClipboardList className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground">No Patient Selected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select a patient from the queue to begin triage assessment.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card border-border overflow-hidden">
              {/* Patient banner */}
              <div className="bg-muted/40 border-b border-border px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-bold text-foreground">{selectedPatient.patientName}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityConfig[selectedPatient.priority]?.bg || ""}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${priorityConfig[selectedPatient.priority]?.dot || ""}`} />
                          {selectedPatient.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">{selectedPatient.patientDisplayId}</span>
                        {age != null && <span className="text-xs text-muted-foreground">{age} yrs</span>}
                        {patientInfo?.gender && (
                          <span className="text-xs text-muted-foreground capitalize">{patientInfo.gender}</span>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          {selectedPatient.waitTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  {patientInfo?.phone && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {patientInfo.phone}
                    </span>
                  )}
                </div>
                {selectedPatient.complaint && (
                  <div className="mt-2 pt-2 border-t border-border/60">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Chief Complaint:</span> {selectedPatient.complaint}
                    </p>
                  </div>
                )}
              </div>

              <CardContent className="p-5">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-5 w-full sm:w-auto grid grid-cols-3 sm:flex">
                    <TabsTrigger value="vitals" className="text-xs gap-1.5">
                      <HeartPulse className="h-3.5 w-3.5" />
                      Vital Signs
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="text-xs gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5" />
                      Nursing Notes
                    </TabsTrigger>
                    <TabsTrigger value="history" className="text-xs gap-1.5">
                      <Activity className="h-3.5 w-3.5" />
                      Visit History
                    </TabsTrigger>
                  </TabsList>

                  {/* ── Vitals Tab ── */}
                  <TabsContent value="vitals" className="space-y-5 mt-0">
                    {alerts.length > 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-red-800 mb-1">Clinical Alerts Detected</p>
                          <div className="flex flex-wrap gap-1.5">
                            {alerts.map((a) => (
                              <span key={a} className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200 font-medium">{a}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {/* Blood Pressure */}
                      <div className={`rounded-lg border p-3 space-y-2 ${statusRing[vitalStatus("sys", Number(sys))]}`}>
                        <Label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
                          Blood Pressure
                          <span className="text-muted-foreground font-normal">(mmHg)</span>
                        </Label>
                        <div className="flex items-center gap-1.5">
                          <Input
                            placeholder="Sys"
                            value={sys}
                            onChange={(e) => setSys(e.target.value)}
                            className="text-center font-semibold text-sm h-8"
                          />
                          <span className="text-muted-foreground text-sm">/</span>
                          <Input
                            placeholder="Dia"
                            value={dia}
                            onChange={(e) => setDia(e.target.value)}
                            className="text-center font-semibold text-sm h-8"
                          />
                        </div>
                        {sys && dia && (
                          <p className="text-[11px] text-center font-bold text-foreground">{sys}/{dia} mmHg</p>
                        )}
                      </div>

                      {/* Heart Rate */}
                      <div className={`rounded-lg border p-3 space-y-2 ${statusRing[vitalStatus("hr", Number(hr))]}`}>
                        <Label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Activity className="h-3.5 w-3.5 text-blue-500" />
                          Heart Rate
                          <span className="text-muted-foreground font-normal">(bpm)</span>
                        </Label>
                        <Input
                          placeholder="e.g. 78"
                          value={hr}
                          onChange={(e) => setHr(e.target.value)}
                          className="font-semibold text-sm h-8"
                        />
                        {hr && <p className="text-[11px] text-center font-bold text-foreground">{hr} bpm</p>}
                      </div>

                      {/* Temperature */}
                      <div className={`rounded-lg border p-3 space-y-2 ${statusRing[vitalStatus("temp", Number(temp))]}`}>
                        <Label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Thermometer className="h-3.5 w-3.5 text-amber-500" />
                          Temperature
                          <span className="text-muted-foreground font-normal">(°C)</span>
                        </Label>
                        <Input
                          placeholder="e.g. 36.8"
                          value={temp}
                          onChange={(e) => setTemp(e.target.value)}
                          className="font-semibold text-sm h-8"
                        />
                        {temp && <p className="text-[11px] text-center font-bold text-foreground">{temp}°C</p>}
                      </div>

                      {/* SpO2 */}
                      <div className={`rounded-lg border p-3 space-y-2 ${statusRing[vitalStatus("spo2", Number(spo2))]}`}>
                        <Label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Droplets className="h-3.5 w-3.5 text-cyan-500" />
                          SpO2
                          <span className="text-muted-foreground font-normal">(%)</span>
                        </Label>
                        <Input
                          placeholder="e.g. 98"
                          value={spo2}
                          onChange={(e) => setSpo2(e.target.value)}
                          className="font-semibold text-sm h-8"
                        />
                        {spo2 && <p className="text-[11px] text-center font-bold text-foreground">{spo2}%</p>}
                      </div>

                      {/* Respiratory Rate */}
                      <div className={`rounded-lg border p-3 space-y-2 ${statusRing[vitalStatus("rr", Number(rr))]}`}>
                        <Label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Wind className="h-3.5 w-3.5 text-indigo-500" />
                          Resp. Rate
                          <span className="text-muted-foreground font-normal">(/min)</span>
                        </Label>
                        <Input
                          placeholder="e.g. 16"
                          value={rr}
                          onChange={(e) => setRr(e.target.value)}
                          className="font-semibold text-sm h-8"
                        />
                        {rr && <p className="text-[11px] text-center font-bold text-foreground">{rr}/min</p>}
                      </div>

                      {/* Pain Score */}
                      <div className="rounded-lg border p-3 space-y-2">
                        <Label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Syringe className="h-3.5 w-3.5 text-purple-500" />
                          Pain Score
                          <span className="text-muted-foreground font-normal">(0–10)</span>
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          placeholder="0–10"
                          value={pain}
                          onChange={(e) => setPain(e.target.value)}
                          className="font-semibold text-sm h-8"
                        />
                        {pain && <p className="text-[11px] text-center font-bold text-foreground">{pain}/10</p>}
                      </div>
                    </div>

                    {/* Anthropometrics */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Anthropometrics</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border p-3 space-y-2">
                          <Label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <Scale className="h-3.5 w-3.5 text-teal-500" />
                            Weight (kg){age != null && <span className="text-muted-foreground font-normal"> · {age}y</span>}
                          </Label>
                          <Input
                            placeholder="e.g. 72"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="font-semibold text-sm h-8"
                          />
                        </div>
                        <div className="rounded-lg border p-3 space-y-2">
                          <Label className="text-xs font-semibold text-foreground">Height (cm)</Label>
                          <Input
                            placeholder="e.g. 170"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="font-semibold text-sm h-8"
                          />
                        </div>
                        <div className="rounded-lg border p-3 space-y-2 bg-muted/30">
                          <Label className="text-xs font-semibold text-foreground">BMI (auto)</Label>
                          <div className="h-8 flex items-center px-3 rounded-md bg-background border text-sm font-semibold text-foreground">
                            {bmi ? bmi : <span className="text-muted-foreground/50 text-xs">—</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick note */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-foreground">Quick Triage Note</Label>
                      <Textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Chief complaint, allergies, immediate concerns..."
                        className="text-xs resize-none"
                      />
                    </div>

                    <Separator />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                        Save Draft
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/clinical-intelligence?patient=${selectedPatient.patientDisplayId || selectedPatient._id}`)}
                          className="gap-1.5 text-xs"
                        >
                          <Brain className="h-3.5 w-3.5" />
                          Risk Profile
                        </Button>
                        <Button
                          onClick={handleSendToDoctor}
                          disabled={isSaving}
                          size="sm"
                          className="gap-1.5"
                        >
                          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          Save & Transfer to Doctor
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* ── Notes Tab ── */}
                  <TabsContent value="notes" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-foreground">Nursing Observations & Care Notes</Label>
                      <p className="text-xs text-muted-foreground">Document clinical presentation, interventions, allergies, or patient concerns.</p>
                    </div>
                    <Textarea
                      rows={7}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Patient presents with... IV access established... Allergies noted... Patient is oriented to..."
                      className="text-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setNotes("")}>Clear</Button>
                      <Button
                        size="sm"
                        onClick={async () => {
                          await handleSaveDraft();
                          toast({ title: "Note Saved", description: "Nursing note appended to visit record." });
                        }}
                        disabled={isSaving || !notes.trim()}
                        className="gap-1.5"
                      >
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ClipboardList className="h-3.5 w-3.5" />}
                        Save Note
                      </Button>
                    </div>
                  </TabsContent>

                  {/* ── History Tab ── */}
                  <TabsContent value="history" className="mt-0">
                    <PatientVisitHistory patient={selectedPatient} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Patient Visit History (fetches from API) ──────────────────────── */
interface MedicalRecord {
  _id: string;
  visitDate: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
    weight?: number;
  };
  assessment?: string;
  progressNotes?: string[];
}

function PatientVisitHistory({ patient }: { patient: QueueEntry }) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const patientId = typeof patient.patient === "object" ? patient.patient._id : null;
    if (!patientId) return;
    setLoading(true);
    apiClient
      .get<ApiResponse<MedicalRecord[]>>(`/medical-records?patient=${patientId}&limit=10`)
      .then((res) => {
        const data = res && typeof res === "object" && "data" in res ? (res as ApiResponse<MedicalRecord[]>).data : undefined;
        setRecords(Array.isArray(data) ? data : []);
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [patient._id]);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No previous encounters found.</p>
        <p className="text-xs text-muted-foreground/70 mt-1">This may be a first-time visit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{records.length} previous visit{records.length !== 1 ? "s" : ""} found</p>
      {records.map((r) => (
        <div key={r._id} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">
              {new Date(r.visitDate).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
            <span className="text-xs text-muted-foreground">
              {new Date(r.visitDate).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          {r.vitalSigns && (
            <div className="flex flex-wrap gap-2">
              {r.vitalSigns.bloodPressure && (
                <span className="text-[11px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                  BP: {r.vitalSigns.bloodPressure}
                </span>
              )}
              {r.vitalSigns.heartRate && (
                <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                  HR: {r.vitalSigns.heartRate} bpm
                </span>
              )}
              {r.vitalSigns.temperature && (
                <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                  Temp: {r.vitalSigns.temperature}°C
                </span>
              )}
              {r.vitalSigns.oxygenSaturation && (
                <span className="text-[11px] bg-cyan-50 text-cyan-700 border border-cyan-200 px-2 py-0.5 rounded-full">
                  SpO2: {r.vitalSigns.oxygenSaturation}%
                </span>
              )}
              {r.vitalSigns.weight && (
                <span className="text-[11px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                  Wt: {r.vitalSigns.weight} kg
                </span>
              )}
            </div>
          )}
          {r.assessment && (
            <p className="text-xs text-muted-foreground line-clamp-2">{r.assessment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
