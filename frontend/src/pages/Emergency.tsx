import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEmergencyCases } from "@/hooks/useEmergency";
import type { EmergencyCase } from "@/lib/emergencyService";
import {
  Zap,
  HeartPulse,
  Clock,
  Ambulance,
  ShieldAlert,
  Search,
  ArrowRight,
  UserPlus,
  Activity,
  Stethoscope,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

const priorityColor: Record<string, { badge: string; border: string; bg: string }> = {
  Red: { badge: "bg-red-600 text-white animate-pulse", border: "border-red-500/40", bg: "bg-red-50/50" },
  Orange: { badge: "bg-orange-500 text-white", border: "border-orange-500/40", bg: "bg-orange-50/50" },
  Yellow: { badge: "bg-yellow-400 text-black font-semibold", border: "border-yellow-400/40", bg: "bg-yellow-50/40" },
  Green: { badge: "bg-emerald-500 text-white", border: "border-emerald-500/40", bg: "bg-emerald-50/40" },
  Black: { badge: "bg-slate-900 text-white", border: "border-slate-700/40", bg: "bg-slate-100/60" },
};

const getAge = (dateOfBirth?: string) => {
  if (!dateOfBirth) return "-";
  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) return "-";
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  if (today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())) age -= 1;
  return `${Math.max(age, 0)}y`;
};

const getArrivalLabel = (arrival?: string) => {
  if (!arrival) return "Not recorded";
  const timestamp = new Date(arrival).getTime();
  if (Number.isNaN(timestamp)) return "Not recorded";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const formatVitals = (vitals?: EmergencyCase["vitalSigns"]) => {
  if (!vitals) return "Not recorded";
  const parts = [
    vitals.bloodPressure && `BP ${vitals.bloodPressure}`,
    vitals.heartRate != null && `HR ${vitals.heartRate}`,
    vitals.temperature != null && `Temp ${vitals.temperature}°C`,
    vitals.oxygenSaturation != null && `SpO2 ${vitals.oxygenSaturation}%`,
    vitals.respiratoryRate != null && `RR ${vitals.respiratoryRate}`,
    vitals.gcsScore != null && `GCS ${vitals.gcsScore}`,
    vitals.painScale != null && `Pain ${vitals.painScale}/10`,
    vitals.bloodSugar != null && `Glucose ${vitals.bloodSugar}`,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Not recorded";
};

export default function Emergency() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch } = useEmergencyCases(page, 25, {
    triageLevel: filter === "All" ? undefined : filter,
    search: search.trim() || undefined,
  });
  const cases = data?.data ?? [];
  const summary = data?.summary;
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-rose-950 to-red-950 p-6 md:p-8 text-white shadow-xl border border-rose-800/40">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300 border border-rose-500/40 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
                <span className="h-2 w-2 rounded-full bg-rose-400 -ml-3.5" />
                {isError ? "Emergency data unavailable" : isLoading ? "Loading emergency records" : "Live database feed"}
              </span>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="h-7 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-white font-heading flex items-center gap-3">
              <Ambulance className="h-8 w-8 text-rose-400" />
              Emergency & Trauma Center
            </h1>
            <p className="text-sm text-rose-200/90 max-w-2xl leading-relaxed">
              Emergency cases, linked patient records, and recorded triage observations from the hospital database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate("/emergency/triage")}
              className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/30 border-0 gap-2 font-medium"
            >
              <UserPlus className="h-4 w-4" />
              Intake New Case
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/clinical-intelligence/alerts")}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-md gap-2"
            >
              <ShieldAlert className="h-4 w-4" />
              Clinical Alerts
            </Button>
          </div>
        </div>
      </div>

      {/* ── STANDOUT TELEMETRY STRIP ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden border-border/80 shadow-card bg-gradient-to-br from-card to-rose-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-rose-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Code Red (Immediate)</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-red-600 font-heading">{summary?.redCases ?? "-"}</span>
                <span className="text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">Critical</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Cases recorded at red acuity</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center">
              <Zap className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/80 shadow-card bg-gradient-to-br from-card to-orange-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Code Orange (Urgent)</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-orange-600 font-heading">{summary?.orangeCases ?? "-"}</span>
                <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">High Priority</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Cases recorded at orange acuity</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
              <HeartPulse className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/80 shadow-card bg-gradient-to-br from-card to-blue-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today's Arrivals</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground font-heading">{summary?.arrivalsToday ?? "-"}</span>
                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Database total</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Cases with arrival date today</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-border/80 shadow-card bg-gradient-to-br from-card to-indigo-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Cases</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground font-heading">{summary?.activeCases ?? "-"}</span>
                <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Current</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Active, incoming, triage, or treatment</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Activity className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── ACUTE CASES COCKPIT ── */}
      <Card className="border-border shadow-card overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/60 pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Activity className="h-4 w-4 text-rose-600" />
                Emergency & Trauma Cases ({pagination?.totalCases ?? 0})
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Cases and linked records currently stored in the emergency database
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search patient, complaint, ID..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-8 pl-8 text-xs w-48 lg:w-60"
                />
              </div>

              <div className="flex items-center p-0.5 rounded-lg bg-muted border border-border text-xs">
                {["All", "Red", "Orange", "Yellow", "Green", "Black"].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setFilter(p);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                      filter === p ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                <tr className="text-left font-semibold">
                  <th className="py-3 px-4">Case / Patient</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-4">Chief Complaint & Acute Presentation</th>
                  <th className="py-3 px-3">Vital Signs Snapshot</th>
                  <th className="py-3 px-3">Arrival</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Clinician</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cases.map((c) => {
                  const pStyle = priorityColor[c.triageLevel] || { badge: "bg-muted text-muted-foreground", border: "", bg: "" };
                  const patientName = c.patientName || "Patient record unavailable";
                  const caseId = c.caseId || c._id || "Unnumbered case";
                  return (
                    <tr key={caseId} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs">
                            {patientName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-xs">{patientName}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {caseId} · {c.patientNumber || "No patient ID"} · {getAge(c.dateOfBirth)} · {c.gender || "Gender not recorded"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <Badge className={`text-[10px] uppercase font-bold px-2 py-0.5 ${pStyle.badge}`}>
                          {c.triageLevel || "Unclassified"}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-medium text-foreground truncate">{c.presentingComplaint || "No complaint recorded"}</p>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-mono text-[11px] bg-muted/60 px-2 py-1 rounded border border-border">
                          {formatVitals(c.vitalSigns)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-muted-foreground whitespace-nowrap font-medium">
                        {getArrivalLabel(c.createdAt)}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-[11px]">
                          <span className={`h-1.5 w-1.5 rounded-full ${c.triageLevel === "Red" ? "bg-red-500" : "bg-primary"}`} />
                          {c.status || "Status not recorded"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-medium text-foreground">
                        {c.doctorAssigned ? `Dr. ${c.doctorAssigned}` : "Unassigned"}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/clinical-intelligence?patient=${c.patientId}`)}
                            disabled={!c.patientId}
                            className="h-7 text-xs px-2 gap-1 border-border hover:border-primary/40"
                          >
                            <Stethoscope className="h-3 w-3 text-primary" />
                            Clinical
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => navigate("/doctor")}
                            className="h-7 text-xs px-2 bg-primary/10 text-primary hover:bg-primary/20 border-0"
                          >
                            Treat <ArrowRight className="h-3 w-3 ml-0.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                      Loading emergency cases from the database...
                    </td>
                  </tr>
                )}
                {isError && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-destructive">
                      Unable to load emergency cases. Check your connection and try again.
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && cases.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      No emergency cases match the current search or triage filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
              <span>Page {pagination.currentPage} of {pagination.totalPages} · {pagination.totalCases} cases</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!pagination.hasPrev || isFetching} onClick={() => setPage((current) => current - 1)}>
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Button>
                <Button variant="outline" size="sm" disabled={!pagination.hasNext || isFetching} onClick={() => setPage((current) => current + 1)}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
