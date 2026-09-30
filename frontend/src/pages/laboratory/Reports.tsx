import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Printer, Loader2, Search, FileText, CheckCircle2, Eye, ShieldAlert, Award } from "lucide-react";
import { useLabTests } from "@/hooks/useLaboratory";
import type { LabParameter, LabTest } from "@/lib/laboratoryService";

function printFormalReport(order: LabTest) {
  const parameters = (order.results?.parameters || []) as LabParameter[];
  const paramRows = parameters
    .map((p) => {
      const isAbnormal = p.flag === "High" || p.flag === "Low" || p.flag === "Abnormal";
      const flagColor = p.flag === "High" ? "#dc2626" : p.flag === "Low" ? "#2563eb" : "#16a34a";
      return `
        <tr style="${isAbnormal ? 'font-weight: 600; background: #fff5f5;' : ''}">
          <td style="padding: 9px 12px; border-bottom: 1px solid #e5e7eb;">${p.label || p.key}</td>
          <td style="padding: 9px 12px; border-bottom: 1px solid #e5e7eb; font-family: monospace; font-size: 13px;">${p.value ?? '—'}</td>
          <td style="padding: 9px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${p.ref || '—'}</td>
          <td style="padding: 9px 12px; border-bottom: 1px solid #e5e7eb; color: ${flagColor}; font-weight: bold;">${p.flag || 'Normal'}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Diagnostic Report - ${order.orderNumber}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 20px; line-height: 1.5; }
          .header { border-bottom: 3px double #0284c7; padding-bottom: 14px; margin-bottom: 20px; display: flex; justify-content: space-between; }
          .title { font-size: 24px; font-weight: 900; color: #0284c7; letter-spacing: -0.5px; }
          .subtitle { font-size: 12px; color: #64748b; font-weight: 500; }
          .patient-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 12px; margin-bottom: 24px; }
          .patient-card strong { display: block; font-size: 10px; text-transform: uppercase; color: #64748b; margin-bottom: 2px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #f1f5f9; text-align: left; padding: 9px 12px; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; font-weight: 700; color: #475569; }
          .notes { background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; margin-bottom: 30px; font-size: 12px; border-radius: 0 6px 6px 0; }
          .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 12px; }
          .sign-box { width: 220px; text-align: center; }
          .line { border-top: 1px solid #94a3b8; margin-top: 36px; padding-top: 6px; font-weight: 600; }
          .stamp { border: 2px dashed #0284c7; color: #0284c7; padding: 6px 12px; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 11px; text-transform: uppercase; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">iCARE CLINICAL DIAGNOSTIC LABORATORY</div>
            <div class="subtitle">ISO 15189:2012 Certified · Complete Diagnostic Pathology Services</div>
          </div>
          <div style="text-align: right; font-size: 12px;">
            <div><strong>Accession:</strong> ${order.orderNumber}</div>
            <div><strong>Report Date:</strong> ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div class="patient-card">
          <div><strong>Patient Name</strong> ${order.patientName || 'Unknown'}</div>
          <div><strong>Patient MRN</strong> ${order.patientDisplayId || '—'}</div>
          <div><strong>Order Modality</strong> ${order.testName}</div>
          <div><strong>Specimen Matrix</strong> ${order.specimenType || 'Whole Blood / Serum'}</div>
          <div><strong>Sample Received</strong> ${order.collectionTime ? new Date(order.collectionTime).toLocaleString() : 'Registered'}</div>
          <div><strong>Result Classification</strong> ${order.resultStatus || 'FINAL AUTHORIZED'}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Analyte / Parameter</th>
              <th>Observed Value</th>
              <th>Biological Reference</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            ${paramRows || '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #64748b;">No discrete test parameters available</td></tr>'}
          </tbody>
        </table>

        ${order.results?.comments || order.notes ? `
          <div class="notes">
            <strong style="color: #0284c7; font-size: 12px;">Pathologist Diagnostic Comments:</strong>
            <p style="margin: 4px 0 0 0;">${order.results?.comments || order.notes}</p>
          </div>
        ` : ''}

        <div class="signatures">
          <div class="sign-box">
            <div>Testing Technologist:</div>
            <div class="line">${order.analyzedBy || 'Medical Lab Technologist'}</div>
            <div style="font-size: 10px; color: #64748b;">Clinical Chemistry / Hematology Bench</div>
          </div>
          <div class="sign-box">
            <div class="stamp">OFFICIAL VERIFIED</div>
            <div class="line">Dr. Alex Mutua, FRCPath</div>
            <div style="font-size: 10px; color: #64748b;">Chief Clinical Pathologist</div>
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

export default function LabReports() {
  const { data, isLoading } = useLabTests(1, 100, { status: "Completed" });
  const reports = data?.data || [];
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<LabTest | null>(null);

  const filteredReports = useMemo(() => {
    if (!search) return reports;
    const lower = search.toLowerCase();
    return reports.filter(
      (r) =>
        (r.orderNumber || "").toLowerCase().includes(lower) ||
        (r.patientName || "").toLowerCase().includes(lower) ||
        (r.patientDisplayId || "").toLowerCase().includes(lower) ||
        (r.testName || "").toLowerCase().includes(lower)
    );
  }, [reports, search]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Official Laboratory Diagnostic Reports Archive
          </h1>
          <p className="text-muted-foreground text-sm">
            Search, preview, and print CAP/ISO-compliant validated laboratory diagnostic certificates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 bg-success/10 text-success border-success/30 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            {reports.length} Reports Finalized
          </Badge>
        </div>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="text-base font-heading">Released Reports Register</CardTitle>
              <CardDescription className="text-xs">
                All tests signed off and authorized by pathology staff
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search report, MRN, patient..."
                className="pl-9 h-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs">Loading authorized lab reports...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Accession #</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Patient</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Test Profile</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Analytes Evaluated</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Technologist</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Release Date</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide h-10 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                        No finalized reports found. Complete and publish results from the Diagnostic Bench.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((r) => {
                      const paramsList = (r.results?.parameters || []) as LabParameter[];
                      const abnormalCount = paramsList.filter((p) => p.flag && p.flag !== "Normal" && p.flag !== "N").length;

                      return (
                        <TableRow key={r._id} className="hover:bg-accent/40 transition-colors">
                          <TableCell className="font-mono text-xs font-bold text-primary py-3">
                            {r.orderNumber}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="font-semibold text-sm text-foreground">{r.patientName}</div>
                            <div className="text-xs text-muted-foreground font-mono">{r.patientDisplayId}</div>
                          </TableCell>
                          <TableCell className="text-sm font-medium py-3 text-foreground">
                            {r.testName}
                          </TableCell>
                          <TableCell className="py-3 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span>{paramsList.length} parameter(s)</span>
                              {abnormalCount > 0 && (
                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                  {abnormalCount} Abnormal
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-3">
                            {r.analyzedBy || "Medical Technologist"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-3">
                            {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge variant="outline" className="text-[11px] font-semibold bg-success/10 text-success border-success/30">
                              {r.resultStatus || "Final Report"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs px-2.5"
                                title="Quick Preview"
                                onClick={() => setSelectedReport(r)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 text-xs bg-primary"
                                onClick={() => printFormalReport(r)}
                              >
                                <Printer className="h-3.5 w-3.5 mr-1" />
                                Print
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Modal Preview */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5 text-primary" />
              Laboratory Diagnostic Certificate Preview
            </DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-lg border bg-muted/30 grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Patient</span>
                  <div className="font-semibold text-foreground text-sm">{selectedReport.patientName}</div>
                  <div className="font-mono text-muted-foreground">{selectedReport.patientDisplayId}</div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Test Profile</span>
                  <div className="font-semibold text-foreground">{selectedReport.testName}</div>
                  <div className="text-primary font-mono">{selectedReport.orderNumber}</div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Validation</span>
                  <div className="text-success font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {selectedReport.resultStatus || "FINAL"}
                  </div>
                  <div className="text-muted-foreground">{selectedReport.analyzedBy || "Senior Technologist"}</div>
                </div>
              </div>

              {/* Parameters list */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/60">
                    <TableRow>
                      <TableHead className="text-[11px] h-8 font-semibold">Analyte</TableHead>
                      <TableHead className="text-[11px] h-8 font-semibold">Value</TableHead>
                      <TableHead className="text-[11px] h-8 font-semibold">Ref Interval</TableHead>
                      <TableHead className="text-[11px] h-8 font-semibold text-right">Flag</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {((selectedReport.results?.parameters || []) as LabParameter[]).map((p) => (
                      <TableRow key={p.key}>
                        <TableCell className="py-2 font-medium">{p.label || p.key}</TableCell>
                        <TableCell className="py-2 font-mono font-bold">{p.value ?? "—"}</TableCell>
                        <TableCell className="py-2 text-muted-foreground font-mono">{p.ref || "—"}</TableCell>
                        <TableCell className="py-2 text-right">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold ${
                              p.flag === "High"
                                ? "bg-destructive/15 text-destructive border-destructive/30"
                                : p.flag === "Low"
                                ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
                                : "bg-success/15 text-success border-success/30"
                            }`}
                          >
                            {p.flag || "Normal"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selectedReport.results?.comments && (
                <div className="p-3 rounded-lg border bg-primary/5 border-primary/20 text-xs">
                  <span className="font-bold text-primary block mb-1">Pathologist Interpretation:</span>
                  <p className="text-foreground">{selectedReport.results.comments}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
              Close
            </Button>
            <Button
              size="sm"
              className="bg-primary"
              onClick={() => {
                if (selectedReport) printFormalReport(selectedReport);
              }}
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print Official A4
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
