import { useNavigate } from "react-router-dom";
import { useEmergencyCases } from "@/hooks/useEmergency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Loader2, RefreshCw, Stethoscope } from "lucide-react";

const formatVitals = (vitals?: {
  bloodPressure?: string;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  temperature?: number;
  gcsScore?: number;
  painScale?: number;
  bloodSugar?: number;
}) => {
  if (!vitals) return "No triage vitals recorded";
  const values = [
    vitals.bloodPressure && `BP ${vitals.bloodPressure}`,
    vitals.heartRate != null && `HR ${vitals.heartRate}`,
    vitals.respiratoryRate != null && `RR ${vitals.respiratoryRate}`,
    vitals.oxygenSaturation != null && `SpO2 ${vitals.oxygenSaturation}%`,
    vitals.temperature != null && `Temp ${vitals.temperature}°C`,
    vitals.gcsScore != null && `GCS ${vitals.gcsScore}`,
    vitals.painScale != null && `Pain ${vitals.painScale}/10`,
    vitals.bloodSugar != null && `Glucose ${vitals.bloodSugar}`,
  ].filter(Boolean);
  return values.length ? values.join(" · ") : "No triage vitals recorded";
};

const formatArrival = (arrival?: string) => {
  if (!arrival) return "Arrival time not recorded";
  const timestamp = new Date(arrival);
  return Number.isNaN(timestamp.getTime())
    ? "Arrival time not recorded"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(timestamp);
};

const Resuscitation = () => {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError, refetch } = useEmergencyCases(1, 100, { triageLevel: "Red" });
  const cases = (data?.data ?? []).filter((item) => !["discharge", "admitted", "deceased"].includes(item.status.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-red-600">Emergency critical care</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">Resuscitation Cases</h1>
          <p className="mt-1 text-sm text-muted-foreground">Active red-acuity cases and recorded triage details.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">{cases.length} active</Badge>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh resuscitation cases">
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
      {isError && <Card><CardContent className="py-12 text-center text-sm text-destructive">Unable to load resuscitation cases from the database.</CardContent></Card>}
      {!isLoading && !isError && cases.length === 0 && (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">There are no active red-acuity cases in the database.</CardContent></Card>
      )}

      {!isLoading && !isError && cases.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-2">
          {cases.map((item) => (
            <Card key={item._id || item.caseId} className="overflow-hidden border-red-200/80">
              <div className="h-1 bg-red-600" />
              <CardHeader className="pb-3">
                <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                  <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-red-600" />{item.patientName || "Patient record unavailable"}</span>
                  <Badge className="bg-red-600 text-white">{item.status || "Status not recorded"}</Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">{item.caseId || "Unnumbered case"} · {item.patientNumber || "No patient ID"}</p>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Presenting complaint</p>
                  <p className="mt-1 text-foreground">{item.presentingComplaint || "No complaint recorded"}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Latest recorded triage vitals</p>
                  <p className="mt-1 font-mono text-xs text-foreground">{formatVitals(item.vitalSigns)}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-xs">
                  <span className="text-muted-foreground">Arrived {formatArrival(item.createdAt)}</span>
                  <span className="text-foreground">{item.doctorAssigned ? `Dr. ${item.doctorAssigned}` : "No clinician assigned"}</span>
                </div>
                <Button size="sm" variant="outline" disabled={!item.patientId} onClick={() => navigate(`/clinical-intelligence?patient=${item.patientId}`)}>
                  <Stethoscope className="mr-2 h-4 w-4" /> Patient clinical record
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resuscitation;
