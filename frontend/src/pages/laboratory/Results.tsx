import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLabTemplates, useLabTests, useSaveLabResults } from "@/hooks/useLaboratory";
import type { LabParameter, LabTest } from "@/lib/laboratoryService";
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Save,
  Printer,
  Search,
  User,
  Clock,
  ShieldAlert,
  Loader2,
  ChevronRight,
} from "lucide-react";

function computeFlag(value: string | number | undefined, ref: string | undefined): "Normal" | "High" | "Low" | "Abnormal" | null {
  if (value === undefined || value === null || value === "") return null;
  const str = String(value).trim().toLowerCase();
  const refStr = String(ref || "").trim().toLowerCase();
  
  if (refStr.includes("negative")) {
    return str === "negative" || str === "neg" || str === "0" ? "Normal" : "Abnormal";
  }
  
  const rangeMatch = String(ref || "").match(/([\d.]+)\s*-\s*([\d.]+)/);
  const n = Number(value);
  if (rangeMatch && !isNaN(n)) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    if (n < low) return "Low";
    if (n > high) return "High";
    return "Normal";
  }
  
  const ltMatch = String(ref || "").match(/<\s*([\d.]+)/);
  if (ltMatch && !isNaN(n)) {
    const high = parseFloat(ltMatch[1]);
    return n <= high ? "Normal" : "High";
  }
  
  const gtMatch = String(ref || "").match(/>\s*([\d.]+)/);
  if (gtMatch && !isNaN(n)) {
    const low = parseFloat(gtMatch[1]);
    return n >= low ? "Normal" : "Low";
  }
  
  return null;
}

function parametersFor(
  order: LabTest | undefined,
  templates: { code: string; name: string; parameters: LabParameter[] }[]
): LabParameter[] {
  if (!order) return [];
  const existing = order.results?.parameters;
  if (Array.isArray(existing) && existing.length) {
    return existing.map((p) => ({
      ...p,
      value: p.value ?? "",
      flag: p.flag || computeFlag(p.value, p.ref),
    }));
  }
  const template =
    templates.find((t) => t.code === order.testCode) ||
    templates.find((t) => t.name === order.testName) ||
    templates.find((t) => order.testName?.toLowerCase().includes(t.name.toLowerCase().slice(0, 12)));

  return (template?.parameters || []).map((p) => {
    const val = String(order.results?.[p.key] ?? "");
    return {
      ...p,
      value: val,
      flag: computeFlag(val, p.ref),
    };
  });
}

function printLabReport(order: LabTest, parameters: LabParameter[], comments: string, tech: string) {
  const paramRows = parameters
    .map((p) => {
      const isAbnormal = p.flag === "High" || p.flag === "Low" || p.flag === "Abnormal";
      const flagColor = p.flag === "High" ? "#dc2626" : p.flag === "Low" ? "#2563eb" : "#16a34a";
      return `
        <tr style="${isAbnormal ? 'font-weight: 600; background: #fff5f5;' : ''}">
          <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb;">${p.label || p.key}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-family: monospace;">${p.value || '—'}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${p.ref || '—'}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e5e7eb; color: ${flagColor};">${p.flag || 'Normal'}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Lab Report - ${order.orderNumber}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.5; padding: 20px; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
          .logo { font-size: 24px; font-weight: 800; color: #0284c7; }
          .meta { font-size: 12px; color: #6b7280; text-align: right; }
          .patient-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 13px; margin-bottom: 24px; }
          .patient-box div strong { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
          th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-weight: 600; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
          .comments { background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px; margin-bottom: 30px; font-size: 13px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 12px; }
          .sign-line { width: 200px; border-top: 1px solid #94a3b8; margin-top: 30px; text-align: center; padding-top: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">iCARE HOSPITAL LABORATORY</div>
            <div style="font-size: 12px; color: #4b5563;">CAP & ISO 15189 Certified Diagnostic Center</div>
          </div>
          <div class="meta">
            <div><strong>Accession:</strong> ${order.orderNumber}</div>
            <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="patient-box">
          <div><strong>Patient Name</strong> ${order.patientName || 'Unknown'}</div>
          <div><strong>Patient MRN</strong> ${order.patientDisplayId || '—'}</div>
          <div><strong>Test Profile</strong> ${order.testName}</div>
          <div><strong>Specimen</strong> ${order.specimenType || 'Blood'}</div>
          <div><strong>Collection Time</strong> ${order.collectionTime ? new Date(order.collectionTime).toLocaleString() : '—'}</div>
          <div><strong>Status</strong> ${order.resultStatus || 'FINAL REPORT'}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Test Parameter</th>
              <th>Result</th>
              <th>Reference Interval</th>
              <th>Interpretation</th>
            </tr>
          </thead>
          <tbody>
            ${paramRows || '<tr><td colspan="4" style="text-align: center; padding: 20px;">No structured parameters entered</td></tr>'}
          </tbody>
        </table>

        ${comments ? `
          <div class="comments">
            <strong style="color: #0284c7; display: block; margin-bottom: 4px;">Pathologist / Technologist Clinical Note:</strong>
            ${comments}
          </div>
        ` : ''}

        <div class="signatures">
          <div>
            <div>Medical Laboratory Technologist:</div>
            <div class="sign-line">${tech}</div>
          </div>
          <div>
            <div>Verified By Consultant Pathologist:</div>
            <div class="sign-line">Dr. Alex Mutua, FRCPath</div>
          </div>
        </div>
      </body>
    </html>
  `;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

export default function LabResults() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const { data, isLoading } = useLabTests(1, 100);
  const { data: templates = [] } = useLabTemplates();
  const saveResults = useSaveLabResults();

  const orders = useMemo(() => {
    return (data?.data || []).filter((o) => o.status !== "Pending" && o.paymentStatus !== "Unpaid");
  }, [data]);

  const [selectedId, setSelectedId] = useState(params.get("order") || "");
  const [searchQuery, setSearchQuery] = useState("");

  const selected = useMemo(() => {
    if (selectedId) {
      return orders.find((o) => o._id === selectedId) || orders[0];
    }
    return orders[0];
  }, [orders, selectedId]);

  const [values, setValues] = useState<LabParameter[]>([]);
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (params.get("order")) {
      setSelectedId(params.get("order") || "");
    }
  }, [params]);

  useEffect(() => {
    if (!selected) return;
    setValues(parametersFor(selected, templates));
    setComments(String(selected.results?.comments || selected.notes || ""));
  }, [selected?._id, templates]);

  const technician = useMemo(() => {
    if (!user) return "Lab Technologist";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Lab Technologist";
  }, [user]);

  const abnormalCount = useMemo(() => {
    return values.filter((v) => v.flag === "High" || v.flag === "Low" || v.flag === "Abnormal").length;
  }, [values]);

  const handleValueChange = (index: number, val: string) => {
    const next = [...values];
    const target = next[index];
    const flag = computeFlag(val, target.ref);
    next[index] = { ...target, value: val, flag };
    setValues(next);
  };

  const submit = async (publish: boolean) => {
    if (!selected) return;
    try {
      await saveResults.mutateAsync({
        id: selected._id,
        payload: { parameters: values, comments, publish },
      });
      toast.success(publish ? "Results verified and officially published!" : "Draft results saved successfully");
    } catch (err: any) {
      toast.error(err?.message || "Could not save laboratory results");
    }
  };

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        (o.orderNumber || "").toLowerCase().includes(q) ||
        (o.patientName || "").toLowerCase().includes(q) ||
        (o.testName || "").toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            Laboratory Diagnostic Bench & Results Entry
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter test parameter measurements, trigger automated critical flag detection, and publish authorized reports
          </p>
        </div>
        {selected && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => printLabReport(selected, values, comments, technician)}
            >
              <Printer className="h-4 w-4 mr-1.5" />
              Print Diagnostic Report
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side Worklist Selector */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="shadow-card border-border">
            <CardHeader className="p-4 pb-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-sm font-heading font-bold">Accessioned Queue</CardTitle>
                <Badge variant="secondary" className="text-xs font-mono">
                  {orders.length} Ready
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter accessioned tests..."
                  className="pl-8 h-8 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-2 space-y-1.5 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary mb-2" />
                  Loading accessioned tests...
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No accessioned samples awaiting results.
                </div>
              ) : (
                filteredOrders.map((o) => {
                  const isCurrent = o._id === selected?._id;
                  const isDone = o.status === "Completed";
                  return (
                    <div
                      key={o._id}
                      onClick={() => {
                        setSelectedId(o._id);
                        setParams({ order: o._id });
                      }}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        isCurrent
                          ? "bg-primary/10 border-primary shadow-xs"
                          : "bg-card hover:bg-muted/50 border-border"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-primary">{o.orderNumber}</span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            isDone
                              ? "bg-success/10 text-success border-success/30"
                              : "bg-blue-500/10 text-blue-600 border-blue-500/30"
                          }`}
                        >
                          {isDone ? "Completed" : "In Progress"}
                        </Badge>
                      </div>
                      <div className="font-semibold text-xs text-foreground truncate">{o.patientName}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{o.testName}</div>
                      <div className="text-[10px] text-muted-foreground/80 mt-1 flex items-center justify-between">
                        <span>{o.specimenType || "Blood"}</span>
                        <span>{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : ""}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side Results Entry Workstation */}
        <div className="lg:col-span-8 space-y-6">
          {!selected ? (
            <Card className="p-12 text-center text-muted-foreground">
              <FlaskConical className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <h3 className="font-semibold text-foreground">No Test Selected</h3>
              <p className="text-xs mt-1">Select an accessioned sample from the queue on the left to begin entering test values.</p>
            </Card>
          ) : (
            <>
              {/* Selected Order Summary Card */}
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Patient Name & MRN</span>
                      <strong className="text-sm font-semibold text-foreground">{selected.patientName}</strong>
                      <div className="font-mono text-[11px] text-muted-foreground">{selected.patientDisplayId}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Test & Modality</span>
                      <strong className="text-sm font-semibold text-foreground">{selected.testName}</strong>
                      <div className="text-[11px] text-primary">{selected.specimenType || "Blood / Serum"}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Accession Number</span>
                      <strong className="text-sm font-mono text-foreground">{selected.orderNumber}</strong>
                      <div className="text-[11px] text-muted-foreground">
                        {selected.collectionTime ? `Collected ${new Date(selected.collectionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Accessioned"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Logged Technologist</span>
                      <strong className="text-sm font-semibold text-foreground">{technician}</strong>
                      <div className="text-[11px] text-success flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Ready for verification
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Automated Flag Status Banner */}
              {abnormalCount > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2.5 text-destructive text-xs">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-destructive" />
                  <span>
                    <strong>{abnormalCount} Abnormal parameter(s) detected:</strong> Values fall outside standard biological reference ranges. Please review carefully before release.
                  </span>
                </div>
              )}

              {/* Structured Parameter Table */}
              <Card className="shadow-card border-border">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-heading">Analyte Measurements</CardTitle>
                      <CardDescription className="text-xs">
                        Enter numerical or qualitative values. Reference ranges automatically evaluate flags.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {values.length} Analytes
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  {values.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-xs">
                      No parameters configured for this profile. Use the comments section below to write diagnostic narrative.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="text-xs font-semibold uppercase tracking-wide h-9">Analyte</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wide h-9">Reference Range</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wide h-9 w-48">Measured Value</TableHead>
                          <TableHead className="text-xs font-semibold uppercase tracking-wide h-9 w-28 text-center">Flag</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {values.map((param, index) => {
                          const isHigh = param.flag === "High";
                          const isLow = param.flag === "Low";
                          const isAbnormal = isHigh || isLow || param.flag === "Abnormal";

                          return (
                            <TableRow key={param.key} className={isAbnormal ? "bg-destructive/5" : ""}>
                              <TableCell className="py-2.5 font-medium text-xs text-foreground">
                                {param.label || param.key}
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-muted-foreground font-mono">
                                {param.ref || "—"}
                              </TableCell>
                              <TableCell className="py-2.5">
                                <Input
                                  placeholder={param.ref ? `Ref: ${param.ref}` : "Value"}
                                  value={String(param.value ?? "")}
                                  onChange={(e) => handleValueChange(index, e.target.value)}
                                  className={`h-8 text-xs font-mono ${
                                    isHigh
                                      ? "border-destructive text-destructive font-bold focus-visible:ring-destructive"
                                      : isLow
                                      ? "border-blue-500 text-blue-600 font-bold focus-visible:ring-blue-500"
                                      : ""
                                  }`}
                                />
                              </TableCell>
                              <TableCell className="py-2.5 text-center">
                                {param.flag ? (
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] px-2 py-0.5 font-bold ${
                                      param.flag === "High"
                                        ? "bg-destructive/15 text-destructive border-destructive/30"
                                        : param.flag === "Low"
                                        ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
                                        : "bg-success/15 text-success border-success/30"
                                    }`}
                                  >
                                    {param.flag === "High" ? "▲ HIGH" : param.flag === "Low" ? "▼ LOW" : "NORMAL"}
                                  </Badge>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}

                  {/* Pathologist Comments */}
                  <div className="p-4 border-t space-y-2 bg-muted/20">
                    <Label htmlFor="comments" className="text-xs font-semibold flex items-center justify-between">
                      <span>Clinical Remarks / Pathologist Impression</span>
                      <span className="text-[11px] font-normal text-muted-foreground">Will appear on official printed report</span>
                    </Label>
                    <Textarea
                      id="comments"
                      placeholder="e.g. Findings compatible with acute bacterial infection. Recommend clinical correlation."
                      className="text-xs min-h-[80px]"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="text-xs text-muted-foreground">
                  Order status: <strong className="text-foreground">{selected.status}</strong>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none text-xs h-9"
                    disabled={saveResults.isPending}
                    onClick={() => submit(false)}
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                    Save Draft
                  </Button>
                  <Button
                    className="flex-1 sm:flex-none text-xs h-9 bg-primary"
                    disabled={saveResults.isPending}
                    onClick={() => submit(true)}
                  >
                    {saveResults.isPending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Authorizing...
                      </>
                    ) : (
                      <>
                        <FileCheck className="h-3.5 w-3.5 mr-1.5" />
                        Authorize & Publish Report
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
