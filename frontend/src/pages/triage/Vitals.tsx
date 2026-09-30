import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, HeartPulse, Activity, Thermometer, Droplets, Wind, Scale, Syringe, Search, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useQueueList } from "@/hooks/useQueue";
import { calcAge, type QueueEntry } from "@/lib/queueService";
import apiClient, { ApiResponse } from "@/lib/api";

/* ─── Priority styles ─── */
const priorityBadge: Record<string, string> = {
  Emergency: "bg-red-50 text-red-700 border-red-200",
  Urgent:    "bg-amber-50 text-amber-700 border-amber-200",
  Normal:    "bg-green-50 text-green-700 border-green-200",
};

/* ─── Vital field alert colors ─── */
function fieldStatus(key: string, val: number): string {
  if (!val) return "";
  const cfg: Record<string, (v: number) => boolean> = {
    sys:  (v) => v >= 160,
    dia:  (v) => v >= 100,
    hr:   (v) => v > 110 || v < 50,
    temp: (v) => v >= 38.5,
    spo2: (v) => v < 94,
    rr:   (v) => v > 22 || v < 10,
  };
  return cfg[key]?.(val) ? "border-red-400 focus-visible:ring-red-400" : "";
}

export default function Vitals() {
  const { toast } = useToast();
  const { data: queuePatients = [], isLoading: queueLoading } = useQueueList("triage", { refetchInterval: 10000 });

  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState<QueueEntry | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Vitals fields
  const [sys, setSys]       = useState("");
  const [dia, setDia]       = useState("");
  const [hr, setHr]         = useState("");
  const [temp, setTemp]     = useState("");
  const [spo2, setSpo2]     = useState("");
  const [rr, setRr]         = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [pain, setPain]     = useState("");

  // Auto-select first if no selection
  useEffect(() => {
    if (queuePatients.length > 0 && !selected) {
      setSelected(queuePatients[0]);
    }
  }, [queuePatients, selected]);

  const filteredPatients = queuePatients.filter((p) =>
    !search || p.patientName.toLowerCase().includes(search.toLowerCase()) || p.patientDisplayId?.toLowerCase().includes(search.toLowerCase())
  );

  const bmi = weight && height
    ? (Number(weight) / Math.pow(Number(height) / 100, 2)).toFixed(1)
    : "";

  const handleSave = async () => {
    if (!selected || typeof selected.patient !== "object") {
      toast({ title: "No patient selected", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.post<ApiResponse<unknown>>("/medical-records", {
        patient: selected.patient._id,
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
        assessment: "Vitals recorded by nurse",
      });
      toast({ title: "Vitals Saved", description: `Vital signs recorded for ${selected.patientName}` });
      setSys(""); setDia(""); setHr(""); setTemp(""); setSpo2(""); setRr("");
      setWeight(""); setHeight(""); setPain("");
    } catch {
      toast({ title: "Save Failed", description: "Could not save vitals to patient record.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setSys(""); setDia(""); setHr(""); setTemp(""); setSpo2(""); setRr("");
    setWeight(""); setHeight(""); setPain("");
  };

  const age = selected?.patient && typeof selected.patient === "object"
    ? calcAge(selected.patient.dateOfBirth) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
            <HeartPulse className="h-5 w-5 text-rose-600" />
          </div>
          Vitals Entry
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record and save patient vital signs from the triage queue
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient selector */}
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
                <p className="text-xs text-muted-foreground text-center py-8">
                  {search ? "No patients match your search." : "Queue is empty."}
                </p>
              )}
              {filteredPatients.map((p) => {
                const isSelected = selected?._id === p._id;
                const patAge = typeof p.patient === "object" ? calcAge(p.patient.dateOfBirth) : null;
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => {
                      setSelected(p);
                      handleClear();
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-100 ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/40 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground truncate">{p.patientName}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${priorityBadge[p.priority] || ""}`}>
                        {p.priority}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <span>{p.patientDisplayId}</span>
                      {patAge != null && <span>· {patAge}y</span>}
                      <span>· {p.waitTime}</span>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Vitals form */}
        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              {/* Patient chip */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                <div>
                  <p className="text-sm font-bold text-foreground">{selected.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.patientDisplayId}
                    {age != null && ` · ${age} yrs`}
                    {selected.complaint && ` · ${selected.complaint}`}
                  </p>
                </div>
                <Badge variant="outline" className={`text-xs ${priorityBadge[selected.priority] || ""}`}>
                  {selected.priority}
                </Badge>
              </div>

              <Card className="shadow-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Vital Signs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {/* BP */}
                    <div className="space-y-1.5 col-span-2 md:col-span-1">
                      <Label className="flex items-center gap-1.5 text-xs font-semibold">
                        <HeartPulse className="h-3.5 w-3.5 text-rose-500" /> Blood Pressure (mmHg)
                      </Label>
                      <div className="flex items-center gap-1.5">
                        <Input placeholder="Sys" value={sys} onChange={(e) => setSys(e.target.value)}
                          className={`text-center font-semibold h-9 ${fieldStatus("sys", Number(sys))}`} />
                        <span className="text-muted-foreground">/</span>
                        <Input placeholder="Dia" value={dia} onChange={(e) => setDia(e.target.value)}
                          className={`text-center font-semibold h-9 ${fieldStatus("dia", Number(dia))}`} />
                      </div>
                    </div>

                    {/* HR */}
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-semibold">
                        <Activity className="h-3.5 w-3.5 text-blue-500" /> Heart Rate (bpm)
                      </Label>
                      <Input placeholder="e.g. 72" value={hr} onChange={(e) => setHr(e.target.value)}
                        className={`font-semibold h-9 ${fieldStatus("hr", Number(hr))}`} />
                    </div>

                    {/* Temp */}
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-semibold">
                        <Thermometer className="h-3.5 w-3.5 text-amber-500" /> Temperature (°C)
                      </Label>
                      <Input placeholder="e.g. 36.5" value={temp} onChange={(e) => setTemp(e.target.value)}
                        className={`font-semibold h-9 ${fieldStatus("temp", Number(temp))}`} />
                    </div>

                    {/* SpO2 */}
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-semibold">
                        <Droplets className="h-3.5 w-3.5 text-cyan-500" /> SpO2 (%)
                      </Label>
                      <Input placeholder="e.g. 98" value={spo2} onChange={(e) => setSpo2(e.target.value)}
                        className={`font-semibold h-9 ${fieldStatus("spo2", Number(spo2))}`} />
                    </div>

                    {/* RR */}
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-semibold">
                        <Wind className="h-3.5 w-3.5 text-indigo-500" /> Resp. Rate (/min)
                      </Label>
                      <Input placeholder="e.g. 18" value={rr} onChange={(e) => setRr(e.target.value)}
                        className={`font-semibold h-9 ${fieldStatus("rr", Number(rr))}`} />
                    </div>

                    {/* Pain */}
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5 text-xs font-semibold">
                        <Syringe className="h-3.5 w-3.5 text-purple-500" /> Pain Score (0–10)
                      </Label>
                      <Input type="number" min={0} max={10} placeholder="0–10" value={pain}
                        onChange={(e) => setPain(e.target.value)} className="font-semibold h-9" />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Anthropometrics</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-xs font-semibold">
                          <Scale className="h-3.5 w-3.5 text-teal-500" /> Weight (kg)
                        </Label>
                        <Input placeholder="e.g. 70" value={weight} onChange={(e) => setWeight(e.target.value)}
                          className="font-semibold h-9" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Height (cm)</Label>
                        <Input placeholder="e.g. 170" value={height} onChange={(e) => setHeight(e.target.value)}
                          className="font-semibold h-9" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">BMI (auto-calc)</Label>
                        <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-sm font-semibold text-foreground">
                          {bmi || <span className="text-muted-foreground/50 text-xs font-normal">—</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleClear}>Clear</Button>
                <Button onClick={handleSave} disabled={isSaving} className="gap-1.5">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Save Vitals
                </Button>
              </div>
            </>
          ) : (
            <Card className="shadow-card border-border">
              <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center gap-3">
                <HeartPulse className="h-10 w-10 text-muted-foreground/30" />
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">No patient selected</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Select a patient from the queue to record vitals.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
