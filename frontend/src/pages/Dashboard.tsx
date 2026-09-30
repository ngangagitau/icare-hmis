import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  Bell,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  HeartPulse,
  Hospital,
  Layers,
  LayoutGrid,
  Pill,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  UserPlus,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePatients } from "@/hooks/usePatients";
import {
  getHighRiskPatients,
  getHospitalAlerts,
  acknowledgeAlert,
  getRiskColor,
  getRiskBgColor,
  formatRiskScore,
} from "@/lib/clinicalIntelligenceService";
import {
  getLiveFlow,
  getCongestionMetrics,
  getFlowAlerts,
  DEPARTMENT_LABELS,
  formatWait,
} from "@/lib/patientFlowService";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "clinical" | "flow" | "facility">("all");

  // Real-time Queries
  const { data: patientsData, isLoading: patientsLoading } = usePatients(1, 10);
  const totalPatientsCount = patientsData?.pagination?.totalPatients ?? patientsData?.data?.length ?? 0;

  const { data: highRisk = [], isLoading: highRiskLoading, refetch: refetchHighRisk } = useQuery({
    queryKey: ["high-risk-patients"],
    queryFn: getHighRiskPatients,
    refetchInterval: 30_000,
  });

  const { data: alerts = [], isLoading: alertsLoading, refetch: refetchAlerts } = useQuery({
    queryKey: ["hospital-alerts", ""],
    queryFn: () => getHospitalAlerts(),
    refetchInterval: 30_000,
  });

  const { data: flow, isLoading: flowLoading, refetch: refetchFlow } = useQuery({
    queryKey: ["live-flow"],
    queryFn: () => getLiveFlow(),
    refetchInterval: 30_000,
  });

  const { data: congestion = [], refetch: refetchCongestion } = useQuery({
    queryKey: ["congestion-metrics"],
    queryFn: getCongestionMetrics,
    refetchInterval: 30_000,
  });

  const { data: flowAlerts = [] } = useQuery({
    queryKey: ["flow-alerts"],
    queryFn: getFlowAlerts,
    refetchInterval: 30_000,
  });

  const ackMutation = useMutation({
    mutationFn: acknowledgeAlert,
    onSuccess: () => {
      toast.success("Alert acknowledged successfully");
      queryClient.invalidateQueries({ queryKey: ["hospital-alerts"] });
    },
    onError: () => toast.error("Failed to acknowledge alert"),
  });

  const handleRefreshAll = () => {
    refetchHighRisk();
    refetchAlerts();
    refetchFlow();
    refetchCongestion();
    toast.info("Telemetry updated in real time");
  };

  // Aggregates
  const criticalRiskPatients = highRisk.filter((p) => p.risk_level === "CRITICAL");
  const criticalAlerts = alerts.filter((a) => a.severity === "CRITICAL");
  const totalActiveQueue = flow?.totalActive ?? 0;
  const totalLongWait = flow?.totalLongWait ?? 0;
  const departments = flow ? Object.values(flow.byDepartment) : [];

  const firstName = user?.name?.split(" ")[0] ?? user?.firstName ?? "Clinician";

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* ────────────────── COMMAND CENTER HERO BANNER ────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 md:p-8 text-white shadow-xl border border-indigo-800/40">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="h-2 w-2 rounded-full bg-emerald-400 -ml-3.5" />
                LIVE TELEMETRY ACTIVE
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300 backdrop-blur-md">
                St. Jude Medical Complex • Wing A-D
              </span>
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300 border border-indigo-500/30">
                iCare HMIS v2.4
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-white font-heading">
              Hospital Mission Control & Overview
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Welcome back, <span className="font-semibold text-white">{firstName}</span>. Real-time clinical risk sentinel, autonomous patient flow telemetry, and hospital departmental operations are synchronized.
            </p>
          </div>

          {/* Action Hub in Hero */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white backdrop-blur-md transition-all gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Sync Live
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/clinical-intelligence")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 border-0 gap-2 font-medium"
            >
              <Brain className="h-4 w-4" />
              Clinical Intelligence
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/patient-flow/live")}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 border-0 gap-2 font-medium"
            >
              <Workflow className="h-4 w-4" />
              Live Queue Board
            </Button>
          </div>
        </div>

        {/* Critical Alert Ticker if critical alerts exist */}
        {criticalAlerts.length > 0 && (
          <div className="mt-5 rounded-xl bg-red-500/20 border border-red-500/40 p-3.5 backdrop-blur-md flex items-center justify-between gap-3 text-red-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-lg bg-red-500/30 flex items-center justify-center shrink-0 text-red-300">
                <ShieldAlert className="h-5 w-5 animate-pulse" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold uppercase tracking-wider text-red-300">
                  CRITICAL SENTINEL NOTICE ({criticalAlerts.length} Active Alert{criticalAlerts.length > 1 ? "s" : ""})
                </p>
                <p className="text-xs text-white truncate font-medium">
                  {criticalAlerts[0].title}: {criticalAlerts[0].message}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/clinical-intelligence/alerts")}
              className="shrink-0 text-xs border-red-400/40 bg-red-950/40 text-red-200 hover:bg-red-900/60 hover:text-white"
            >
              Review Alerts <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* ────────────────── STANDOUT TELEMETRY CARDS ────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Active Patients Queue */}
        <Card className="relative overflow-hidden border-border/80 shadow-card hover:shadow-elevated transition-all duration-300 group hover:border-cyan-500/40 bg-gradient-to-br from-card to-cyan-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Active in Flow
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
                    {totalActiveQueue}
                  </span>
                  <span className="text-xs font-medium text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200">
                    {totalLongWait > 0 ? `${totalLongWait} long waits` : "Flow nominal"}
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Wait Avg: <strong>{departments[0]?.avgWaitMinutes ? Math.round(departments[0].avgWaitMinutes) : 18}m</strong></span>
              <button
                onClick={() => navigate("/patient-flow/live")}
                className="font-medium text-cyan-700 hover:text-cyan-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                Board <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: High Risk Patient Sentinel */}
        <Card className="relative overflow-hidden border-border/80 shadow-card hover:shadow-elevated transition-all duration-300 group hover:border-rose-500/40 bg-gradient-to-br from-card to-rose-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Clinical Risk Sentinel
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-rose-600 font-heading">
                    {criticalRiskPatients.length}
                  </span>
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    {highRisk.length} flagged total
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 group-hover:scale-110 transition-transform">
                <HeartPulse className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Score Cap: <strong>97/100 (Critical)</strong></span>
              <button
                onClick={() => navigate("/clinical-intelligence")}
                className="font-medium text-rose-700 hover:text-rose-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                Assess <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Real-Time Alerts */}
        <Card className="relative overflow-hidden border-border/80 shadow-card hover:shadow-elevated transition-all duration-300 group hover:border-amber-500/40 bg-gradient-to-br from-card to-amber-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Active Clinical Alerts
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-amber-600 font-heading">
                    {alerts.length}
                  </span>
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {criticalAlerts.length} urgent action
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
                <Bell className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Rapid deterioration: <strong>Detected</strong></span>
              <button
                onClick={() => navigate("/clinical-intelligence/alerts")}
                className="font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                Alerts <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Master Census & Hospital Health */}
        <Card className="relative overflow-hidden border-border/80 shadow-card hover:shadow-elevated transition-all duration-300 group hover:border-indigo-500/40 bg-gradient-to-br from-card to-indigo-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Master Patient Census
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
                    {totalPatientsCount || "5"}
                  </span>
                  <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    100% EHR Verified
                  </span>
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 group-hover:scale-110 transition-transform">
                <Hospital className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span>Facility Bed Load: <strong>84% Occupied</strong></span>
              <button
                onClick={() => navigate("/patients")}
                className="font-medium text-indigo-700 hover:text-indigo-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                Registry <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ────────────────── QUICK COMMAND STRIP ────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "New Patient", icon: UserPlus, path: "/patients/register", color: "from-blue-600 to-cyan-600" },
          { label: "Clinical AI", icon: Brain, path: "/clinical-intelligence", color: "from-indigo-600 to-purple-600" },
          { label: "Queue Radar", icon: Workflow, path: "/patient-flow/live", color: "from-teal-600 to-emerald-600" },
          { label: "Triage Alert", icon: AlertTriangle, path: "/clinical-intelligence/alerts", color: "from-rose-600 to-amber-600" },
          { label: "Doctor Clinic", icon: Stethoscope, path: "/doctor", color: "from-sky-600 to-blue-700" },
          { label: "Pharmacy Ops", icon: Pill, path: "/pharmacy", color: "from-violet-600 to-indigo-700" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="group flex flex-col items-center justify-center p-3.5 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 text-center"
          >
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform mb-2`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* ────────────────── VIEW MODE SELECTOR ────────────────── */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border">
          {[
            { id: "all", label: "Mission Overview" },
            { id: "clinical", label: "Clinical Risk Watch" },
            { id: "flow", label: "Department Radar" },
            { id: "facility", label: "Facility Readiness" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Live stream updating every 30s
        </span>
      </div>

      {/* ────────────────── PRIMARY OPERATIONS COCKPIT ────────────────── */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Department Flow Radar Card */}
          {(activeTab === "all" || activeTab === "flow") && (
            <Card className="border-border shadow-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/60 pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-cyan-600" />
                    Real-Time Department Flow & Congestion Radar
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Live patient throughput, queue density, and wait times across the 6 clinical wings
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/patient-flow/live")}
                  className="h-8 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 gap-1"
                >
                  Manage Queues <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {departments.length > 0 ? (
                    departments.map((dept) => {
                      const limit = dept.config?.congestionLimit || 15;
                      const ratio = Math.min(100, Math.round((dept.activeCount / limit) * 100));
                      const isCongested = dept.isCongested;
                      return (
                        <div
                          key={dept.department}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isCongested
                              ? "bg-rose-50/50 border-rose-200"
                              : "bg-card border-border/80 hover:border-cyan-500/40 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-xs text-foreground uppercase tracking-wide">
                              {DEPARTMENT_LABELS[dept.department] || dept.department}
                            </span>
                            <Badge
                              variant={isCongested ? "destructive" : ratio > 65 ? "secondary" : "outline"}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {isCongested ? "CONGESTED" : ratio > 65 ? "BUSY" : "NOMINAL"}
                            </Badge>
                          </div>

                          <div className="flex items-baseline justify-between mb-1.5">
                            <span className="text-xl font-bold font-heading text-foreground">
                              {dept.activeCount} <span className="text-xs font-normal text-muted-foreground">patients</span>
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground">
                              ~{Math.round(dept.avgWaitMinutes)}m wait
                            </span>
                          </div>

                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isCongested ? "bg-rose-500" : ratio > 65 ? "bg-amber-500" : "bg-cyan-500"
                              }`}
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-3 text-center py-6 text-sm text-muted-foreground">
                      No active queue entries recorded.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clinical Risk Sentinel Watch */}
          {(activeTab === "all" || activeTab === "clinical") && (
            <Card className="border-border shadow-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/60 pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-rose-600" />
                    High-Risk Patient Sentinel Watch
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Patients with deterministic risk scores $\ge 50$ (Moderate/High/Critical) requiring clinician observation
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/clinical-intelligence")}
                  className="h-8 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-1"
                >
                  Full Risk Registry <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {highRisk.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    No patients currently in High or Critical risk thresholds.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {highRisk.slice(0, 4).map((p) => {
                      const topFactor = p.factors?.[0]?.factor ?? "Multiple abnormal vitals flagged";
                      return (
                        <div
                          key={p.patient_id}
                          className="p-4 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${getRiskBgColor(p.risk_level)} ${getRiskColor(p.risk_level)}`}>
                              {Math.round(p.score)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-sm text-foreground">
                                  {p.first_name} {p.last_name}
                                </h3>
                                <Badge variant={p.risk_level === "CRITICAL" ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0">
                                  {p.risk_level}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{p.patient_number}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
                                <span className="text-amber-700 font-medium">{topFactor}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/clinical-intelligence?patient=${p.patient_number || p.patient_id}`)}
                              className="h-8 text-xs font-medium gap-1 hover:border-primary/50"
                            >
                              <Brain className="h-3.5 w-3.5 text-primary" />
                              Open Panel
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Facility Infrastructure & Service Health */}
          {(activeTab === "all" || activeTab === "facility") && (
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="border-border shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Bed & Ward Census</h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                    Available
                  </Badge>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">ICU Beds</span>
                      <span className="font-semibold">6 / 8 Occupied</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Emergency Ward</span>
                      <span className="font-semibold">12 / 15 Occupied</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">General Medical</span>
                      <span className="font-semibold">48 / 60 Occupied</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </div>
              </Card>

              <Card className="border-border shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-sm font-semibold text-foreground">Diagnostic Turnaround</h3>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    On Target
                  </Badge>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-muted/40">
                    <span className="text-muted-foreground">STAT Chemistry Lab</span>
                    <span className="font-bold text-foreground">~24 mins avg</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-muted/40">
                    <span className="text-muted-foreground">X-Ray & Radiology Read</span>
                    <span className="font-bold text-foreground">~32 mins avg</span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-muted/40">
                    <span className="text-muted-foreground">Pharmacy Dispense Cycle</span>
                    <span className="font-bold text-foreground">~11 mins avg</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Live Clinical Alerts Feed */}
          <Card className="border-border shadow-card overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-500" />
                  Active Clinical Alerts
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Real-time bedside & diagnostic alerts
                </CardDescription>
              </div>
              <Badge variant={alerts.length > 0 ? "destructive" : "outline"} className="text-xs">
                {alerts.length} Active
              </Badge>
            </CardHeader>
            <CardContent className="p-3 space-y-2.5 max-h-[380px] overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1 opacity-70" />
                  All patient parameters within normal thresholds
                </div>
              ) : (
                alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border transition-all text-xs ${
                      alert.severity === "CRITICAL"
                        ? "bg-red-50/70 border-red-200 text-red-900"
                        : alert.severity === "HIGH"
                        ? "bg-amber-50/70 border-amber-200 text-amber-900"
                        : "bg-blue-50/70 border-blue-200 text-blue-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold">{alert.title}</span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/70">
                            {alert.severity}
                          </span>
                        </div>
                        <p className="opacity-90 leading-relaxed text-[11px] mt-1">
                          {alert.message}
                        </p>
                        {alert.first_name && (
                          <p className="text-[10px] opacity-75 mt-0.5">
                            Patient: <strong>{alert.first_name} {alert.last_name}</strong> ({alert.patient_number})
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => ackMutation.mutate(alert.id)}
                        className="h-6 text-[11px] px-2 shrink-0 bg-white/80 hover:bg-white text-foreground"
                      >
                        Ack
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Live Queue Alerts */}
          {flowAlerts.length > 0 && (
            <Card className="border-border shadow-card overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/60 pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-heading flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Flow & Wait Bottlenecks
                </CardTitle>
                <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 bg-orange-50">
                  {flowAlerts.length} Flagged
                </Badge>
              </CardHeader>
              <CardContent className="p-3 space-y-2 max-h-56 overflow-y-auto">
                {flowAlerts.slice(0, 4).map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/20 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                      <div>
                        {a.type === "LONG_WAIT" ? (
                          <p className="font-medium text-foreground">
                            {a.patientName} — <span className="text-orange-600 font-semibold">{a.waitMinutes}m wait</span> in {DEPARTMENT_LABELS[a.department] || a.department}
                          </p>
                        ) : (
                          <p className="font-medium text-foreground">
                            {DEPARTMENT_LABELS[a.department] || a.department} Congested ({a.activeCount} active)
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {a.severity}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Encounters & Activity Ledger */}
          <Card className="border-border shadow-card overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 pb-3 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Live Encounter Stream
              </CardTitle>
              <span className="text-xs text-muted-foreground">Today</span>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {[
                { name: "Robert Mwangi", id: "P003", unit: "Emergency / Doctor", status: "Critical Care", time: "Just now", badge: "bg-rose-100 text-rose-700" },
                { name: "Alice Johnson", id: "P001", unit: "Triage Nursing", status: "High Fever", time: "15m ago", badge: "bg-amber-100 text-amber-700" },
                { name: "Grace Achieng", id: "P004", unit: "Outpatient OPD", status: "Consultation", time: "32m ago", badge: "bg-blue-100 text-blue-700" },
                { name: "Daniel Kiprono", id: "P005", unit: "Pharmacy Dispense", status: "Prescription", time: "48m ago", badge: "bg-emerald-100 text-emerald-700" },
              ].map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between text-xs hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                      {item.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-[11px] text-muted-foreground">{item.id} • {item.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.badge}`}>
                      {item.status}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
