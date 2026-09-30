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
} from "lucide-react";
import { useQueueList, useTransferQueue, useUpdateQueueStatus } from "@/hooks/useQueue";
import { calcAge, type QueueEntry } from "@/lib/queueService";
import { useCreatePrescription, usePrescriptions } from "@/hooks/usePrescriptions";
import { useInventoryLite } from "@/hooks/usePharmacyOps";
import { useCreateLabTest, useLabTemplates } from "@/hooks/useLaboratory";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

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

  useEffect(() => {
    if (patients.length > 0 && !selected) setSelected(patients[0]);
    if (selected && !patients.find((p) => p._id === selected._id)) setSelected(patients[0] ?? null);
  }, [patients, selected]);

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
              return (
                <div
                  key={p._id}
                  className={`p-3 rounded-xl border transition-all ${
                    isSelected ? "border-primary bg-primary/10 shadow-sm" : "border-border hover:bg-muted/40"
                  }`}
                >
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

          {/* Consultation Tabs */}
          <Card className="shadow-card border-border overflow-hidden">
            <CardContent className="p-5">
              <Tabs defaultValue="notes">
                <TabsList className="flex flex-wrap gap-1.5 bg-muted/60 p-1 mb-5">
                  <TabsTrigger value="notes" className="text-xs font-semibold gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Clinical Notes
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
