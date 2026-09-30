import { useState } from "react";
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
import { Printer, Search, FileText, RefreshCw, Eye, CheckCircle2 } from "lucide-react";
import { useRadiologyOrders } from "@/hooks/useRadiology";
import type { RadiologyOrder } from "@/lib/radiologyService";

export default function RadiologyReports() {
  const [search, setSearch] = useState("");
  const { data: ordersData, isLoading, refetch } = useRadiologyOrders(1, 100, { status: "Completed" });

  const reports = ordersData?.data || [];
  const [selectedReport, setSelectedReport] = useState<RadiologyOrder | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const filtered = reports.filter(
    (r) =>
      `${r.patientName} ${r.orderNumber} ${r.modality} ${r.bodyPart} ${r.radiologistName || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const handlePrint = (report: RadiologyOrder) => {
    setSelectedReport(report);
    setIsPrintModalOpen(true);
  };

  const triggerBrowserPrint = () => {
    const el = document.getElementById("radiology-report-print-target");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Radiology Report - ${selectedReport?.orderNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; line-height: 1.6; color: #111; margin: 30px; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
            .hospital-name { font-size: 20px; font-weight: bold; color: #1e3a8a; }
            .doc-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #2563eb; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 12px; }
            .section { margin-bottom: 14px; }
            .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 6px; }
            .signature { margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 12px; text-align: right; }
          </style>
        </head>
        <body>
          ${el.innerHTML}
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Radiology Diagnostic Reports</h1>
          <p className="text-xs text-muted-foreground">
            Sign-off archive, finalized clinical reports & patient diagnostic delivery
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs h-9">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports by patient, study #, modality, radiologist..."
                className="pl-9 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Total {filtered.length} signed reports
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="border border-border rounded-xl overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-semibold">Report / Order ID</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Patient</TableHead>
                  <TableHead className="text-xs font-semibold">Examination</TableHead>
                  <TableHead className="text-xs font-semibold">Modality</TableHead>
                  <TableHead className="text-xs font-semibold">Reporting Radiologist</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Loading radiology diagnostic reports...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No signed radiology reports found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id || r._id}>
                      <TableCell className="font-mono font-bold text-foreground">
                        {r.orderNumber || r.orderId}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.orderDate || (r.createdAt ? r.createdAt.slice(0, 10) : "—")}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {r.patientName} <span className="text-muted-foreground">({r.patientDisplayId})</span>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{r.bodyPart || r.imagingType}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] text-blue-700 dark:text-blue-400 border-blue-200">
                          {r.modality}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {r.radiologistName || "Staff Radiologist"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 border-emerald-200">
                          Finalized
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1 px-2.5"
                          onClick={() => handlePrint(r)}
                        >
                          <Printer className="h-3 w-3" /> View & Print
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostic Report Print Modal */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center justify-between">
              <span>Diagnostic Imaging Report Preview</span>
            </DialogTitle>
          </DialogHeader>

          <div id="radiology-report-print-target" className="p-6 bg-white text-black rounded-lg border space-y-4 text-xs">
            <div className="border-b-2 border-blue-700 pb-3 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-blue-900">ICARE SPECIALIST HOSPITAL</h2>
                <p className="text-[11px] text-gray-600">Department of Radiology & Medical Imaging</p>
                <p className="text-[11px] text-gray-500">PO BOX 40100 - Nairobi | Tel: +254 700 000 000</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs font-bold border-blue-600 text-blue-700 uppercase">
                  DIAGNOSTIC REPORT
                </Badge>
                <p className="text-xs font-mono font-bold mt-1 text-gray-800">{selectedReport?.orderNumber}</p>
              </div>
            </div>

            {/* Demographics Box */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 border border-gray-200 rounded">
              <div>
                <p><span className="font-semibold text-gray-600">Patient:</span> <span className="font-bold">{selectedReport?.patientName}</span></p>
                <p><span className="font-semibold text-gray-600">Patient ID:</span> <span className="font-mono">{selectedReport?.patientDisplayId}</span></p>
                <p><span className="font-semibold text-gray-600">Gender:</span> {selectedReport?.patientGender || "Adult"}</p>
              </div>
              <div>
                <p><span className="font-semibold text-gray-600">Examination:</span> <span className="font-bold">{selectedReport?.modality} - {selectedReport?.bodyPart}</span></p>
                <p><span className="font-semibold text-gray-600">Order Date:</span> {selectedReport?.orderDate || "Today"}</p>
                <p><span className="font-semibold text-gray-600">Referring Doctor:</span> {selectedReport?.requestedBy || "Attending Physician"}</p>
              </div>
            </div>

            {/* Findings & Impression */}
            <div className="space-y-3 leading-relaxed">
              <div>
                <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px] border-b pb-1 mb-1">
                  Examination Technique
                </h4>
                <p className="text-gray-800">{selectedReport?.technique || `Standard ${selectedReport?.modality} protocol.`}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px] border-b pb-1 mb-1">
                  Clinical Indication
                </h4>
                <p className="text-gray-800">{selectedReport?.clinicalIndication || "Diagnostic evaluation."}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px] border-b pb-1 mb-1">
                  Radiological Findings
                </h4>
                <p className="text-gray-800 whitespace-pre-line">{selectedReport?.findings || "No acute abnormalities demonstrated."}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b pb-1 mb-1">
                  Impression
                </h4>
                <p className="font-bold text-gray-900 whitespace-pre-line">{selectedReport?.impression || "Normal examination."}</p>
              </div>

              {selectedReport?.recommendations && (
                <div>
                  <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px] border-b pb-1 mb-1">
                    Recommendations
                  </h4>
                  <p className="text-gray-800">{selectedReport.recommendations}</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-dashed border-gray-400 flex justify-between items-center">
              <span className="text-[10px] text-gray-500">Electronically validated in ICare LIS/RIS</span>
              <div className="text-right">
                <p className="font-bold text-gray-900">{selectedReport?.radiologistName || "Staff Radiologist"}</p>
                <p className="text-[11px] text-gray-500">Consultant Radiologist</p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
              Close
            </Button>
            <Button onClick={triggerBrowserPrint} className="gap-2">
              <Printer className="h-4 w-4" /> Print Diagnostic Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
