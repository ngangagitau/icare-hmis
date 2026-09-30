import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, Activity, Search, HeartPulse, Thermometer, Droplets, Wind, TrendingUp, User, Calendar } from "lucide-react";
import { useQueueList } from "@/hooks/useQueue";
import { calcAge, type QueueEntry } from "@/lib/queueService";
import apiClient, { ApiResponse } from "@/lib/api";

interface VitalRecord {
  _id: string;
  visitDate: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    painScore?: number;
  };
  assessment?: string;
}

const CHART_COLORS = {
  heartRate:          "#3b82f6",
  temperature:        "#f59e0b",
  oxygenSaturation:   "#06b6d4",
  respiratoryRate:    "#6366f1",
};

export default function VitalsHistory() {
  const { data: queuePatients = [], isLoading: queueLoading } = useQueueList("triage", { refetchInterval: 15000 });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<QueueEntry | null>(null);
  const [records, setRecords] = useState<VitalRecord[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [activeChart, setActiveChart] = useState<"hr" | "temp" | "spo2" | "rr">("hr");

  useEffect(() => {
    if (queuePatients.length > 0 && !selected) setSelected(queuePatients[0]);
  }, [queuePatients, selected]);

  const loadRecords = useCallback(async (patientId: string) => {
    setRecLoading(true);
    try {
      const res = await apiClient.get<ApiResponse<VitalRecord[]>>(
        `/medical-records?patient=${patientId}&limit=50`
      );
      const data = res && typeof res === "object" && "data" in res
        ? (res as ApiResponse<VitalRecord[]>).data : undefined;
      const filtered = (Array.isArray(data) ? data : []).filter(
        (r) => r.vitalSigns && Object.keys(r.vitalSigns).length > 0
      );
      setRecords(filtered);
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

  const age = selected?.patient && typeof selected.patient === "object"
    ? calcAge(selected.patient.dateOfBirth) : null;

  // Sorted for chart (oldest first)
  const chartData = [...records]
    .filter((r) => r.vitalSigns)
    .reverse()
    .map((r) => ({
      date: new Date(r.visitDate).toLocaleDateString("en-KE", { day: "2-digit", month: "short" }),
      hr:   r.vitalSigns?.heartRate,
      temp: r.vitalSigns?.temperature,
      spo2: r.vitalSigns?.oxygenSaturation,
      rr:   r.vitalSigns?.respiratoryRate,
    }));

  const chartConfig = {
    hr:   { key: "hr",   label: "Heart Rate (bpm)",     color: CHART_COLORS.heartRate,        icon: HeartPulse  },
    temp: { key: "temp", label: "Temperature (°C)",     color: CHART_COLORS.temperature,      icon: Thermometer },
    spo2: { key: "spo2", label: "SpO2 (%)",             color: CHART_COLORS.oxygenSaturation, icon: Droplets    },
    rr:   { key: "rr",   label: "Resp. Rate (/min)",    color: CHART_COLORS.respiratoryRate,  icon: Wind        },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          Vitals History
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Historical vital signs and trend analysis for patient monitoring
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

        {/* History panel */}
        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              {/* Patient chip */}
              <div className="p-3 rounded-lg bg-muted/40 border border-border flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{selected.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.patientDisplayId}
                    {age != null && ` · ${age} yrs`}
                    {" · "}
                    <span className="font-medium">{records.length}</span> visit{records.length !== 1 ? "s" : ""} with vitals
                  </p>
                </div>
              </div>

              {recLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : records.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No vitals history found.</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Vital signs will appear here once recorded.</p>
                </div>
              ) : (
                <>
                  {/* Chart */}
                  {chartData.length >= 2 && (
                    <Card className="shadow-card border-border">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            Trend Chart
                          </CardTitle>
                          <div className="flex items-center gap-1">
                            {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map((k) => {
                              const c = chartConfig[k];
                              const Icon = c.icon;
                              return (
                                <button
                                  key={k}
                                  type="button"
                                  onClick={() => setActiveChart(k)}
                                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border transition-all ${
                                    activeChart === k
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "border-border text-muted-foreground hover:bg-muted"
                                  }`}
                                >
                                  <Icon className="h-3 w-3" />
                                  {k.toUpperCase()}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{
                                fontSize: 12,
                                border: "1px solid hsl(var(--border))",
                                borderRadius: 8,
                                background: "hsl(var(--popover))",
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey={chartConfig[activeChart].key}
                              stroke={chartConfig[activeChart].color}
                              strokeWidth={2}
                              dot={{ r: 3, strokeWidth: 2 }}
                              activeDot={{ r: 5 }}
                              connectNulls
                              name={chartConfig[activeChart].label}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Table */}
                  <Card className="shadow-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center justify-between">
                        Vitals Records
                        <Badge variant="secondary" className="text-xs">{records.length} entries</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-auto max-h-[320px] rounded-b-lg">
                        <Table>
                          <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                            <TableRow>
                              <TableHead className="text-xs font-semibold">Date</TableHead>
                              <TableHead className="text-xs font-semibold">BP (mmHg)</TableHead>
                              <TableHead className="text-xs font-semibold">HR (bpm)</TableHead>
                              <TableHead className="text-xs font-semibold">Temp (°C)</TableHead>
                              <TableHead className="text-xs font-semibold">SpO2 (%)</TableHead>
                              <TableHead className="text-xs font-semibold">RR (/min)</TableHead>
                              <TableHead className="text-xs font-semibold">Wt (kg)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {records.map((r) => {
                              const vs = r.vitalSigns;
                              return (
                                <TableRow key={r._id} className="hover:bg-muted/20">
                                  <TableCell className="text-xs py-2">
                                    {new Date(r.visitDate).toLocaleDateString("en-KE", {
                                      day: "2-digit", month: "short", year: "numeric",
                                    })}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 font-medium">
                                    {vs?.bloodPressure || "—"}
                                  </TableCell>
                                  <TableCell className={`text-xs py-2 font-medium ${
                                    vs?.heartRate && (vs.heartRate > 100 || vs.heartRate < 60) ? "text-amber-600" : ""
                                  }`}>
                                    {vs?.heartRate ?? "—"}
                                  </TableCell>
                                  <TableCell className={`text-xs py-2 font-medium ${
                                    vs?.temperature && vs.temperature >= 38.5 ? "text-red-600" : ""
                                  }`}>
                                    {vs?.temperature ?? "—"}
                                  </TableCell>
                                  <TableCell className={`text-xs py-2 font-medium ${
                                    vs?.oxygenSaturation && vs.oxygenSaturation < 94 ? "text-red-600" : ""
                                  }`}>
                                    {vs?.oxygenSaturation ?? "—"}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 font-medium">
                                    {vs?.respiratoryRate ?? "—"}
                                  </TableCell>
                                  <TableCell className="text-xs py-2 font-medium">
                                    {vs?.weight ?? "—"}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </>
          ) : (
            <Card className="shadow-card border-border">
              <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center gap-3">
                <TrendingUp className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-semibold text-muted-foreground">No patient selected</p>
                <p className="text-xs text-muted-foreground/70">Select a patient to view their vitals history.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
