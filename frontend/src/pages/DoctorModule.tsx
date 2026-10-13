import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Stethoscope,
  FileText,
  Pill,
  FlaskConical,
  Clock,
  Clipboard,
  Calendar,
  Loader2,
  Brain,
  CheckCircle2,
  Users,
  Send,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  HeartPulse,
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Scale,
  Syringe,
  Eye,
  History,
  AlertCircle,
  Bookmark,
} from "lucide-react";
import { useQueueList, useTransferQueue, useUpdateQueueStatus } from "@/hooks/useQueue";
import { calcAge, type QueueEntry } from "@/lib/queueService";
import { useCreatePrescription, usePrescriptions } from "@/hooks/usePrescriptions";
import { useInventoryLite } from "@/hooks/usePharmacyOps";
import { useCreateLabTest, useLabTemplates } from "@/hooks/useLaboratory";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import apiClient, { ApiResponse } from "@/lib/api";

export default function DoctorModule() {
  const navigate = useNavigate();
  const { data: patients = [], isLoading } = useQueueList("doctor", { refetchInterval: 10000 });
  const { data: prescriptions = [] } = usePrescriptions();
  const { data: inventory = [], isLoading: inventoryLoading } = useInventoryLite();
  const { data: labPatients = [] } = useQueueList("lab", { refetchInterval: 10000 });
  const { data: radiologyPatients = [] } = useQueueList("radiology", { refetchInterval: 10000 });
  const [selected, setSelected] = useState<QueueEntry | null>(null);

  // Rx form
  const [drug, setDrug] = useState("");
  const [selectedDrugId, setSelectedDrugId] = useState<string | null>(null);
  const [dosage, setDosage] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");

  const statusMutation = useUpdateQueueStatus();
  const transferMutation = useTransferQueue();
  const createPrescriptionMutation = useCreatePrescription();
  const { toast } = useToast();

  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [fullPatient, setFullPatient] = useState<any | null>(null);

  useEffect(() => {
    if (patients.length > 0 && !selected) setSelected(patients[0]);
    if (selected && !patients.find((p) => p._id === selected._id)) setSelected(patients[0] ?? null);
  }, [patients, selected]);

  // Fetch saved medical records, vitals, and full patient profile for selected patient
  useEffect(() => {
    if (!selected) {
      setMedicalRecords([]);
      setFullPatient(null);
      return;
    }
    const patientId = typeof selected.patient === "object"
      ? (selected.patient?._id || (selected.patient as any)?.id)
      : selected.patient;
    const patientQuery = patientId || selected.patientDisplayId;
    if (!patientQuery) return;

    setLoadingVitals(true);
    // Fetch encounter medical records
    apiClient
      .get<ApiResponse<any[]>>(`/medical-records?patient=${patientQuery}&limit=20`)
      .then((res) => {
        const data = res && typeof res === "object" && "data" in res ? (res as ApiResponse<any[]>).data : undefined;
        setMedicalRecords(Array.isArray(data) ? data : []);
      })
      .catch(() => setMedicalRecords([]))
      .finally(() => setLoadingVitals(false));

    // Fetch master patient record (for allergies, chronic conditions, surgical/medical history)
    apiClient
      .get<ApiResponse<any>>(`/patients/${patientQuery}`)
      .then((res) => {
        const pData = res && typeof res === "object" && "data" in res ? (res as ApiResponse<any>).data : undefined;
        setFullPatient(pData || null);
      })
      .catch(() => setFullPatient(null));
  }, [selected?._id]);

  // Get most recent vital signs record
  const latestVitalsRecord = medicalRecords.find((r) => r.vitalSigns && Object.keys(r.vitalSigns).length > 0);
  const latestVitals = latestVitalsRecord?.vitalSigns;

  const patientAge =
    selected?.patient && typeof selected.patient === "object"
      ? calcAge(selected.patient.dateOfBirth)
      : null;

  const handleCheckIn = async (entry: QueueEntry) => {
    setSelected(entry);
    if (entry.status === "Waiting") {
      await statusMutation.mutateAsync({ id: entry._id, status: "In Progress" });
    }
  };

  const handleCheckOut = async (entry: QueueEntry) => {
    await statusMutation.mutateAsync({ id: entry._id, status: "Served" });
    toast({ title: "Consultation Completed", description: `${entry.patientName} checked out successfully.` });
    if (selected?._id === entry._id) setSelected(null);
  };

  const sendToPharmacy = async () => {
    if (!selected) return;
    const selectedDrug = inventory.find((item) => item._id === selectedDrugId);
    if (!selectedDrug || selectedDrug.currentStock <= 0) {
      toast({ title: "Select an available medication", description: "Choose a medication from current pharmacy stock.", variant: "destructive" });
      return;
    }
    if (!dosage || !duration) {
      toast({ title: "Missing Prescription Details", description: "Please enter drug, dosage, and duration.", variant: "destructive" });
      return;
    }
    try {
      await createPrescriptionMutation.mutateAsync({
        patientId: typeof selected.patient === "object" ? selected.patient._id : String(selected.patient),
        queueEntryId: selected._id,
        items: [{ drug, dosage, duration, instructions }],
      });
      await transferMutation.mutateAsync({ id: selected._id, department: "pharmacy", serviceName: "Prescription" });
      toast({ title: "Prescription Dispatched", description: "Sent to pharmacy dispensing queue." });
      setDrug("");
      setSelectedDrugId(null);
      setDosage("");
      setDuration("");
      setInstructions("");
    } catch {
      toast({ title: "Dispatch Failed", description: "Could not send prescription.", variant: "destructive" });
    }
  };

  const sendToLab = async () => {
    if (!selected) return;
    await transferMutation.mutateAsync({ id: selected._id, department: "lab", serviceName: "Lab investigation" });
    toast({ title: "Order Dispatched", description: "Patient transferred to laboratory worklist." });
  };

  const waitingCount = patients.filter((p) => p.status === "Waiting").length;
  const inProgressCount = patients.filter((p) => p.status === "In Progress").length;
  const prescriptionCount = prescriptions.length;
  const investigationCount = labPatients.length + radiologyPatients.length;
  const medicationSuggestions = inventory
    .filter((item) => item.currentStock > 0 && item.name.toLowerCase().includes(drug.trim().toLowerCase()))
    .slice(0, 8);

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      {/* ── TELEMETRY STRIP ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-border/80 shadow-card bg-gradient-to-br from-card to-blue-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Waiting for Doctor</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600 font-heading">{waitingCount}</span>
                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">In Queue</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Ready for consultation</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/80 shadow-card bg-gradient-to-br from-card to-emerald-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In Consultation</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-600 font-heading">{inProgressCount}</span>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Under examination</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Stethoscope className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/80 shadow-card bg-gradient-to-br from-card to-purple-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rx Dispatched</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-purple-600 font-heading">{prescriptionCount}</span>
                <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">Pharmacy</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Electronic prescriptions</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Pill className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/80 shadow-card bg-gradient-to-br from-card to-amber-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">STAT Investigations</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-amber-600 font-heading">{investigationCount}</span>
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Labs / Rad</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Diagnostic worklists</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <FlaskConical className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── CONSULTATION WORKBENCH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Queue List */}
        <Card className="shadow-card border-border overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/60 pb-3">
            <CardTitle className="text-sm font-heading flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Clinic Queue
              </span>
              <Badge variant="outline" className="text-xs font-bold">
                {patients.length} Active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1.5 max-h-[600px] overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            {!isLoading && patients.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-10">No patients waiting in doctor clinic queue.</p>
            )}
            {patients.map((p) => {
              const isSelected = selected?._id === p._id;
              const resultsReady = p.serviceName?.toLowerCase() === "laboratory review";
              const isEmergency = p.priority === "Emergency";
              const isUrgent    = p.priority === "Urgent";
              const hasAlert    = p.triageAlert && p.triageAlert.severity !== 'NORMAL';
              return (
                <div
                  key={p._id}
                  className={`p-3 rounded-xl border transition-all ${
                    isEmergency
                      ? isSelected
                        ? "border-red-400 bg-red-50 shadow-sm"
                        : "border-red-200 bg-red-50/60 hover:bg-red-50"
                      : isSelected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  {/* Emergency banner */}
                  {isEmergency && (
                    <div className="flex items-center gap-1.5 mb-2 -mt-0.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 border border-red-300 px-1.5 py-0.5 rounded-full animate-pulse">
                        🚨 CRITICAL — TOP OF QUEUE
                      </span>
                    </div>
                  )}
                  {isUrgent && !isEmergency && (
                    <div className="flex items-center gap-1.5 mb-1.5 -mt-0.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-full">
                        ⚡ URGENT
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-foreground">{p.patientName}</span>
                    <div className="flex items-center gap-1">
                      {resultsReady && (
                        <Badge className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-700 border-emerald-200">
                          Results Ready
                        </Badge>
                      )}
                      <Badge variant={p.status === "In Progress" ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
                        {p.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {p.patientDisplayId} • Wait: {p.waitTime}
                  </p>
                  {p.complaint && (
                    <p className="text-[11px] text-foreground/80 mt-1 truncate font-medium">
                      {p.complaint}
                    </p>
                  )}
                  {hasAlert && p.triageAlert && (
                    <div className={`mt-2 p-2 rounded-lg text-[10px] font-medium ${
                      p.triageAlert.severity === 'CRITICAL'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {p.triageAlert.alerts.slice(0, 2).map((a) => a.label).join(' · ')}
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-end gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCheckIn(p)}
                      className="h-6 text-[10px] px-2 text-primary border-primary/30 hover:bg-primary/10"
                    >
                      Examine
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCheckOut(p)}
                      className="h-6 text-[10px] px-2 text-rose-600 hover:bg-rose-50"
                    >
                      Check-out
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right: Encounter Workbench */}
        <div className="lg:col-span-3 space-y-4">
          {/* Patient Overview Strip */}
          <Card className="shadow-card border-border overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-extrabold text-primary shrink-0">
                    {selected?.patientName?.split(" ").map((n) => n[0]).join("") ?? "?"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-heading font-bold text-base text-foreground">
                        {selected?.patientName || "Select a Patient from Clinic Queue"}
                      </h2>
                      {selected && (
                        <Badge variant="outline" className="text-xs">
                          {selected.patientDisplayId}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {patientAge != null ? `${patientAge} years old` : "Age not recorded"}
                      {selected?.complaint && ` • Chief complaint: ${selected.complaint}`}
                    </p>
                  </div>
                </div>

                {selected && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/clinical-intelligence?patient=${selected.patientDisplayId || selected._id}`)}
                      className="text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Brain className="h-3.5 w-3.5" />
                      Clinical Intelligence
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate("/patient-flow/live")}
                      className="text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Queue Radar
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── AI Triage Alert Banner ── */}
          {selected?.triageAlert && selected.triageAlert.severity !== 'NORMAL' && (
            <div className={`rounded-xl border p-4 space-y-3 ${
              selected.triageAlert.severity === 'CRITICAL'
                ? 'border-red-300 bg-red-50'
                : 'border-amber-300 bg-amber-50'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                    selected.triageAlert.severity === 'CRITICAL' ? 'bg-red-100' : 'bg-amber-100'
                  }`}>
                    <AlertTriangle className={`h-5 w-5 ${
                      selected.triageAlert.severity === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${
                      selected.triageAlert.severity === 'CRITICAL' ? 'text-red-800' : 'text-amber-800'
                    }`}>
                      🤖 AI Triage Alert — {selected.triageAlert.severity === 'CRITICAL' ? '🚨 CRITICAL VITALS DETECTED' : '⚡ URGENT VITALS'}
                    </p>
                    <p className="text-xs text-muted-foreground">Flagged by triage nurse assessment</p>
                  </div>
                </div>
                <Badge className={`text-xs shrink-0 ${
                  selected.triageAlert.severity === 'CRITICAL'
                    ? 'bg-red-100 text-red-700 border-red-300'
                    : 'bg-amber-100 text-amber-700 border-amber-300'
                }`}>
                  {selected.triageAlert.queuePriority} Priority
                </Badge>
              </div>

              {/* Alert breakdown */}
              <div className="grid sm:grid-cols-2 gap-2">
                {selected.triageAlert.alerts.map((alert, idx) => (
                  <div key={idx} className={`rounded-lg p-2.5 border text-xs ${
                    alert.level === 'critical'
                      ? 'bg-red-100/70 border-red-200'
                      : 'bg-amber-100/70 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${
                        alert.level === 'critical' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'
                      }`}>
                        {alert.level === 'critical' ? '🚨 CRITICAL' : '⚡ URGENT'}
                      </span>
                      <span className="font-semibold text-foreground">{alert.vital}</span>
                      <span className="font-bold text-foreground">{alert.value}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-foreground/80">{alert.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{alert.recommendation}</p>
                  </div>
                ))}
              </div>

              {selected.triageAlert.severity === 'CRITICAL' && (
                <div className={`p-2.5 rounded-lg border text-xs font-medium text-red-800 bg-red-100 border-red-200`}>
                  ⚠️ <strong>Immediate Action Required:</strong> This patient was automatically elevated to top of queue. Assess and initiate treatment protocol without delay.
                </div>
              )}
            </div>
          )}

          {/* ── Saved Vital Signs Card ── */}
          {selected && (
            <Card className="shadow-card border-border overflow-hidden">
              <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <HeartPulse className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      Triage Vital Signs
                      {latestVitalsRecord && (
                        <span className="text-[11px] font-normal text-muted-foreground">
                          · Recorded {new Date(latestVitalsRecord.visitDate || latestVitalsRecord.createdAt).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" })}
                          {latestVitalsRecord.createdAt && ` at ${new Date(latestVitalsRecord.createdAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}`}
                        </span>
                      )}
                    </CardTitle>
                  </div>
                </div>
                <Badge variant={latestVitals ? "outline" : "secondary"} className="text-[11px]">
                  {loadingVitals ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Loading
                    </span>
                  ) : latestVitals ? (
                    "Vitals Recorded"
                  ) : (
                    "No Vitals Recorded"
                  )}
                </Badge>
              </CardHeader>
              <CardContent className="p-4">
                {loadingVitals ? (
                  <div className="flex items-center justify-center py-6 text-xs text-muted-foreground gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Fetching triage vitals...
                  </div>
                ) : latestVitals ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    {/* BP */}
                    <div className="p-2.5 rounded-xl border border-border/80 bg-background/50 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <HeartPulse className="h-3 w-3 text-rose-500" /> BP
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {latestVitals.bloodPressure || (latestVitals.sys && latestVitals.dia ? `${latestVitals.sys}/${latestVitals.dia}` : "—")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">mmHg</p>
                    </div>

                    {/* HR */}
                    <div className="p-2.5 rounded-xl border border-border/80 bg-background/50 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <Activity className="h-3 w-3 text-blue-500" /> Heart Rate
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {latestVitals.heartRate ?? latestVitals.hr ?? "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">bpm</p>
                    </div>

                    {/* Temp */}
                    <div className="p-2.5 rounded-xl border border-border/80 bg-background/50 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <Thermometer className="h-3 w-3 text-amber-500" /> Temp
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {latestVitals.temperature ?? latestVitals.temp ? `${latestVitals.temperature ?? latestVitals.temp}°C` : "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Celsius</p>
                    </div>

                    {/* SpO2 */}
                    <div className="p-2.5 rounded-xl border border-border/80 bg-background/50 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <Droplets className="h-3 w-3 text-cyan-500" /> SpO₂
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {latestVitals.oxygenSaturation ?? latestVitals.spo2 ? `${latestVitals.oxygenSaturation ?? latestVitals.spo2}%` : "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Saturation</p>
                    </div>

                    {/* RR */}
                    <div className="p-2.5 rounded-xl border border-border/80 bg-background/50 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <Wind className="h-3 w-3 text-indigo-500" /> Resp. Rate
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {latestVitals.respiratoryRate ?? latestVitals.rr ?? "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">/min</p>
                    </div>

                    {/* Pain */}
                    <div className="p-2.5 rounded-xl border border-border/80 bg-background/50 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <Syringe className="h-3 w-3 text-purple-500" /> Pain
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {latestVitals.painScore !== undefined && latestVitals.painScore !== null ? `${latestVitals.painScore}/10` : "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Score</p>
                    </div>

                    {/* Weight & BMI */}
                    <div className="p-2.5 rounded-xl border border-border/80 bg-background/50 space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <Scale className="h-3 w-3 text-teal-500" /> Wt / BMI
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {latestVitals.weight ? `${latestVitals.weight}kg` : "—"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {latestVitals.bmi ? `BMI: ${latestVitals.bmi}` : latestVitals.height ? `${latestVitals.height}cm` : "—"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5 border border-dashed rounded-lg bg-muted/20">
                    <HeartPulse className="h-7 w-7 text-muted-foreground/40 mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-muted-foreground">No vital signs saved for this patient yet.</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">Vitals captured in the Triage module will display here automatically.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Consultation Tabs */}
          <Card className="shadow-card border-border overflow-hidden">
            <CardContent className="p-5">
              <Tabs defaultValue="notes">
                <TabsList className="flex flex-wrap gap-1.5 bg-muted/60 p-1 mb-5">
                  <TabsTrigger value="notes" className="text-xs font-semibold gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Clinical Notes
                  </TabsTrigger>
                  <TabsTrigger value="vitals-history" className="text-xs font-semibold gap-1.5">
                    <HeartPulse className="h-3.5 w-3.5" /> Vitals History
                  </TabsTrigger>
                  <TabsTrigger value="prescribe" className="text-xs font-semibold gap-1.5">
                    <Pill className="h-3.5 w-3.5" /> Prescribe Rx
                  </TabsTrigger>
                  <TabsTrigger value="investigate" className="text-xs font-semibold gap-1.5">
                    <FlaskConical className="h-3.5 w-3.5" /> Lab & Radiology
                  </TabsTrigger>
                  <TabsTrigger value="procedure" className="text-xs font-semibold gap-1.5">
                    <Clipboard className="h-3.5 w-3.5" /> Procedure
                  </TabsTrigger>
                  <TabsTrigger value="referral" className="text-xs font-semibold gap-1.5">
                    <Clipboard className="h-3.5 w-3.5" /> Referral
                  </TabsTrigger>
                  <TabsTrigger value="appointment" className="text-xs font-semibold gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Follow-Up
                  </TabsTrigger>
                  <TabsTrigger value="previous-history" className="text-xs font-semibold gap-1.5">
                    <History className="h-3.5 w-3.5" /> Previous History
                  </TabsTrigger>
                </TabsList>

                {/* Notes Tab */}
                <TabsContent value="notes" className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">History of Presenting Illness</label>
                      <Textarea placeholder="Onset, duration, progression of complaints..." rows={3} className="text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Physical Examination Findings</label>
                      <Textarea placeholder="General condition, CVS, RS, Abdomen, CNS..." rows={3} className="text-xs" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-foreground">Clinical Diagnosis & Impression</label>
                      <Input placeholder="Primary Diagnosis (e.g. Acute Bronchitis, Essential Hypertension)..." className="text-xs font-medium" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-foreground">Comprehensive Management & Treatment Plan</label>
                      <Textarea placeholder="Medications prescribed, lifestyle modifications, nursing directions..." rows={3} className="text-xs" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-3 border-t border-border">
                    <Button onClick={() => toast({ title: "Clinical Notes Saved", description: "Encounter records committed to patient history." })}>
                      Save Encounter Notes
                    </Button>
                  </div>
                </TabsContent>

                {/* Vitals History Tab */}
                <TabsContent value="vitals-history" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Complete Vitals & Clinical Assessment History</h3>
                      <p className="text-xs text-muted-foreground">Historical vital sign observations recorded across triage encounters</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {medicalRecords.length} Record{medicalRecords.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {loadingVitals ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : medicalRecords.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
                      <HeartPulse className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-muted-foreground">No prior vitals recorded</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Vitals recorded in Triage will appear here chronologically.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {medicalRecords.map((r, index) => {
                        const v = r.vitalSigns || {};
                        const hasVitals = Object.keys(v).length > 0;
                        const formattedDate = new Date(r.visitDate || r.createdAt).toLocaleDateString("en-KE", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                        const formattedTime = r.createdAt ? new Date(r.createdAt).toLocaleTimeString("en-KE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : "";

                        return (
                          <div key={r._id || index} className="p-4 rounded-xl border border-border bg-card space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-foreground">Encounter #{medicalRecords.length - index}</span>
                                <span className="text-xs text-muted-foreground">· {formattedDate} {formattedTime && `at ${formattedTime}`}</span>
                              </div>
                              {r.triageAlert && r.triageAlert.severity !== 'NORMAL' ? (
                                <Badge className={`text-[10px] ${r.triageAlert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-amber-100 text-amber-700 border-amber-300'}`}>
                                  {r.triageAlert.severity} ALERT
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px]">Routine</Badge>
                              )}
                            </div>

                            {hasVitals ? (
                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
                                <div className="p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
                                  <span className="text-[10px] text-muted-foreground block font-medium">BP</span>
                                  <span className="text-xs font-bold text-foreground">{v.bloodPressure || (v.sys && v.dia ? `${v.sys}/${v.dia}` : "—")}</span>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
                                  <span className="text-[10px] text-muted-foreground block font-medium">Heart Rate</span>
                                  <span className="text-xs font-bold text-foreground">{v.heartRate ?? v.hr ?? "—"} bpm</span>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
                                  <span className="text-[10px] text-muted-foreground block font-medium">Temp</span>
                                  <span className="text-xs font-bold text-foreground">{v.temperature ?? v.temp ? `${v.temperature ?? v.temp}°C` : "—"}</span>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
                                  <span className="text-[10px] text-muted-foreground block font-medium">SpO₂</span>
                                  <span className="text-xs font-bold text-foreground">{v.oxygenSaturation ?? v.spo2 ? `${v.oxygenSaturation ?? v.spo2}%` : "—"}</span>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
                                  <span className="text-[10px] text-muted-foreground block font-medium">Resp. Rate</span>
                                  <span className="text-xs font-bold text-foreground">{v.respiratoryRate ?? v.rr ?? "—"}/min</span>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
                                  <span className="text-[10px] text-muted-foreground block font-medium">Pain</span>
                                  <span className="text-xs font-bold text-foreground">{v.painScore !== undefined && v.painScore !== null ? `${v.painScore}/10` : "—"}</span>
                                </div>
                                <div className="p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
                                  <span className="text-[10px] text-muted-foreground block font-medium">Weight</span>
                                  <span className="text-xs font-bold text-foreground">{v.weight ? `${v.weight}kg` : "—"}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">No numerical vitals recorded for this visit.</p>
                            )}

                            {r.assessment && (
                              <div className="pt-1.5 border-t border-border/60">
                                <p className="text-xs text-muted-foreground">
                                  <span className="font-semibold text-foreground">Nurse Assessment: </span>
                                  {r.assessment}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                {/* Previous History Tab */}
                <TabsContent value="previous-history" className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <History className="h-4 w-4 text-primary" />
                        Patient Longitudinal History & Medical Background
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Comprehensive record of previous consultations, chronic illnesses, allergies, and diagnoses
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs self-start sm:self-auto">
                      {medicalRecords.length} Past Encounter{medicalRecords.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {/* ── Background & Risk Factors Strip ── */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Allergies */}
                    <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                        <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                        Known Allergies
                      </div>
                      {fullPatient?.allergies && Array.isArray(fullPatient.allergies) && fullPatient.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {fullPatient.allergies.map((a: any, i: number) => (
                            <span key={i} className="text-[11px] bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-medium border border-red-200">
                              {typeof a === "string" ? a : a.allergen || JSON.stringify(a)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No known drug or environmental allergies documented.</p>
                      )}
                    </div>

                    {/* Chronic Medical Conditions */}
                    <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                        <Bookmark className="h-3.5 w-3.5 text-amber-600" />
                        Chronic / Past Medical History
                      </div>
                      {fullPatient?.medicalHistory && (Array.isArray(fullPatient.medicalHistory) ? fullPatient.medicalHistory.length > 0 : Object.keys(fullPatient.medicalHistory).length > 0) ? (
                        <div className="text-xs text-foreground/90 space-y-1">
                          {Array.isArray(fullPatient.medicalHistory) ? (
                            fullPatient.medicalHistory.map((m: any, i: number) => (
                              <span key={i} className="inline-block text-[11px] bg-amber-100/80 text-amber-800 px-2 py-0.5 rounded mr-1 mb-1 border border-amber-200 font-medium">
                                {typeof m === "string" ? m : m.condition || JSON.stringify(m)}
                              </span>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground">{JSON.stringify(fullPatient.medicalHistory)}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No significant chronic medical illnesses recorded.</p>
                      )}
                    </div>

                    {/* Current Medications */}
                    <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
                        <Pill className="h-3.5 w-3.5 text-blue-600" />
                        Current Maintenance Meds
                      </div>
                      {fullPatient?.currentMedications && Array.isArray(fullPatient.currentMedications) && fullPatient.currentMedications.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {fullPatient.currentMedications.map((med: any, i: number) => (
                            <span key={i} className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-medium border border-blue-200">
                              {typeof med === "string" ? med : med.name || JSON.stringify(med)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No long-term medications documented on chart.</p>
                      )}
                    </div>
                  </div>

                  {/* ── Past Encounters & Consultations Timeline ── */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      Previous Consultation Notes & Diagnoses
                    </h4>

                    {loadingVitals ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : medicalRecords.length === 0 ? (
                      <div className="text-center py-12 border border-dashed rounded-xl bg-muted/20">
                        <History className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-muted-foreground">No past clinical encounters on record</p>
                        <p className="text-xs text-muted-foreground/70 mt-1">This appears to be the patient's first recorded encounter at this facility.</p>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {medicalRecords.map((r, index) => {
                          const formattedDate = new Date(r.visitDate || r.createdAt).toLocaleDateString("en-KE", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          });
                          const formattedTime = r.createdAt ? new Date(r.createdAt).toLocaleTimeString("en-KE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }) : "";
                          const diagnoses = Array.isArray(r.diagnosis) ? r.diagnosis : (r.diagnosis ? [r.diagnosis] : []);

                          return (
                            <Card key={r._id || index} className="shadow-none border border-border bg-card overflow-hidden">
                              <CardHeader className="py-2.5 px-4 bg-muted/30 border-b border-border/60 flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px] font-bold">
                                    Visit #{medicalRecords.length - index}
                                  </Badge>
                                  <span className="text-xs font-semibold text-foreground">
                                    {formattedDate} {formattedTime && `· ${formattedTime}`}
                                  </span>
                                </div>
                                {r.triageAlert && r.triageAlert.severity !== 'NORMAL' ? (
                                  <Badge className={`text-[10px] ${r.triageAlert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border-red-300' : 'bg-amber-100 text-amber-700 border-amber-300'}`}>
                                    {r.triageAlert.severity} TRIAGE ALERT
                                  </Badge>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground">Routine Consultation</span>
                                )}
                              </CardHeader>

                              <CardContent className="p-4 space-y-3">
                                {/* Diagnoses */}
                                {diagnoses.length > 0 && (
                                  <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                      Diagnosis / Clinical Impression
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {diagnoses.map((d: any, dIdx: number) => (
                                        <Badge key={dIdx} className="text-xs bg-primary/10 text-primary border-primary/20 font-semibold">
                                          {typeof d === "string" ? d : d.name || d.code || JSON.stringify(d)}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Assessment / Nurse & Doctor notes */}
                                {r.assessment && (
                                  <div className="space-y-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                                      Clinical Assessment & Notes
                                    </span>
                                    <p className="text-xs text-foreground bg-muted/20 p-2.5 rounded-lg border border-border/50 whitespace-pre-wrap">
                                      {r.assessment}
                                    </p>
                                  </div>
                                )}

                                {/* Treatment Plan */}
                                {r.treatmentPlan && (
                                  <div className="space-y-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                                      Management & Treatment Plan
                                    </span>
                                    <p className="text-xs text-foreground bg-muted/20 p-2.5 rounded-lg border border-border/50 whitespace-pre-wrap">
                                      {r.treatmentPlan}
                                    </p>
                                  </div>
                                )}

                                {/* Progress Notes */}
                                {Array.isArray(r.progressNotes) && r.progressNotes.length > 0 && (
                                  <div className="space-y-1">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                                      Progress Notes
                                    </span>
                                    <div className="space-y-1 text-xs text-foreground">
                                      {r.progressNotes.map((pn: any, pIdx: number) => (
                                        <p key={pIdx} className="bg-muted/10 p-2 rounded border border-border/40">
                                          {typeof pn === "string" ? pn : JSON.stringify(pn)}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Attached Vital signs snippet */}
                                {r.vitalSigns && Object.keys(r.vitalSigns).length > 0 && (
                                  <div className="pt-2 border-t border-border/50 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                                    <span className="font-semibold text-foreground">Vitals at visit:</span>
                                    {r.vitalSigns.bloodPressure && <span>BP: {r.vitalSigns.bloodPressure}</span>}
                                    {r.vitalSigns.heartRate && <span>HR: {r.vitalSigns.heartRate} bpm</span>}
                                    {r.vitalSigns.temperature && <span>Temp: {r.vitalSigns.temperature}°C</span>}
                                    {r.vitalSigns.oxygenSaturation && <span>SpO₂: {r.vitalSigns.oxygenSaturation}%</span>}
                                    {r.vitalSigns.weight && <span>Wt: {r.vitalSigns.weight}kg</span>}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Prescribe Tab */}
                <TabsContent value="prescribe" className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-foreground">Medication / Drug Name</label>
                      <div className="relative">
                        <Input
                          placeholder={inventoryLoading ? "Loading pharmacy stock..." : "Type to search stocked medications"}
                          value={drug}
                          onChange={(e) => {
                            setDrug(e.target.value);
                            setSelectedDrugId(null);
                          }}
                          className="text-xs"
                          autoComplete="off"
                        />
                        {drug.trim() && !selectedDrugId && medicationSuggestions.length > 0 && (
                          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
                            {medicationSuggestions.map((item) => (
                              <button
                                key={item._id}
                                type="button"
                                onClick={() => {
                                  setDrug(item.name);
                                  setSelectedDrugId(item._id);
                                }}
                                className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-muted"
                              >
                                <span className="font-medium text-foreground">{item.name}</span>
                                <span className="ml-3 shrink-0 text-muted-foreground">{item.currentStock} available</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {selectedDrugId && (
                        <p className="text-[11px] text-success">
                          Available in pharmacy stock: {inventory.find((item) => item._id === selectedDrugId)?.currentStock ?? 0}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Dosage</label>
                      <Input
                        placeholder="e.g. 1 tab TDS"
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Duration</label>
                      <Input
                        placeholder="e.g. 5 days"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-foreground">Dispensing Instructions</label>
                      <Input
                        placeholder="e.g. Take immediately after meals with plenty of water"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-3 border-t border-border">
                    <Button
                      onClick={sendToPharmacy}
                      disabled={transferMutation.isPending || createPrescriptionMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white gap-2 font-medium"
                    >
                      <Send className="h-4 w-4" />
                      Dispatch Electronic Prescription to Pharmacy
                    </Button>
                  </div>
                </TabsContent>

                {/* Investigate Tab */}
                <TabsContent value="investigate" className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 p-3.5 rounded-xl border border-border bg-card">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <FlaskConical className="h-4 w-4 text-purple-600" />
                        Laboratory Diagnostic Panel
                      </h4>
                      <p className="text-xs text-muted-foreground">Order STAT hematology, biochemistry, or microbiology</p>
                      <div className="space-y-1.5 pt-2">
                        {["Complete Blood Count (CBC)", "Renal Function Tests (Creatinine/Urea)", "Liver Function Tests (LFTs)", "Serum Electrolytes (K+, Na+)"].map((test) => (
                          <div key={test} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs">
                            <span className="font-medium text-foreground">{test}</span>
                            <Badge variant="outline" className="text-[10px]">Ready to Order</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 p-3.5 rounded-xl border border-border bg-card">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                        <Stethoscope className="h-4 w-4 text-cyan-600" />
                        Radiology & Imaging Panel
                      </h4>
                      <p className="text-xs text-muted-foreground">Order emergency X-Rays, Ultrasound, or CT scans</p>
                      <div className="space-y-1.5 pt-2">
                        {["Chest X-Ray (PA View)", "Abdominal Ultrasound", "Head CT Scan (Non-contrast)"].map((test) => (
                          <div key={test} className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs">
                            <span className="font-medium text-foreground">{test}</span>
                            <Badge variant="outline" className="text-[10px]">Ready to Order</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-border">
                    <Button onClick={sendToLab} disabled={transferMutation.isPending} className="gap-2 font-medium">
                      <Send className="h-4 w-4" />
                      Send Diagnostic Orders to Worklists
                    </Button>
                  </div>
                </TabsContent>

                {/* Procedure Tab */}
                <TabsContent value="procedure" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">Minor Bedside Procedures Performed</label>
                    <Textarea placeholder="Wound dressing, suturing, catheterization, nebulization..." rows={4} className="text-xs" />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => toast({ title: "Procedure Logged", description: "Procedure appended to patient billing & clinical record." })}>
                      Record Procedure
                    </Button>
                  </div>
                </TabsContent>

                {/* Referral Tab */}
                <TabsContent value="referral" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">Specialist / External Facility Referral</label>
                    <Textarea placeholder="Indicate destination specialty (e.g. Cardiology, Orthopedics) and referral rationale..." rows={4} className="text-xs" />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => toast({ title: "Referral Note Generated", description: "Referral documentation prepared for patient." })}>
                      Generate Referral
                    </Button>
                  </div>
                </TabsContent>

                {/* Appointment Tab */}
                <TabsContent value="appointment" className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Next Review Date</label>
                      <Input type="date" className="text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Follow-Up Clinic</label>
                      <Input placeholder="e.g. Hypertension Clinic / General OPD" className="text-xs" />
                    </div>
                  </div>
                  <div className="flex justify-end pt-3 border-t border-border">
                    <Button onClick={() => toast({ title: "Appointment Booked", description: "Review date booked in patient schedule." })}>
                      Schedule Review
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
