import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ScanLine,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Search,
  Plus,
  Play,
  FileText,
  Eye,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Zap,
  AlertCircle,
} from "lucide-react";
import DepartmentWaitingPatients from "@/components/DepartmentWaitingPatients";
import { useRadiologyOrders, useRadiologyStats, useStartRadiologyExam, useSubmitRadiologyReport, useCreateRadiologyOrder } from "@/hooks/useRadiology";
import { usePatients } from "@/hooks/usePatients";
import type { RadiologyOrder } from "@/lib/radiologyService";
import { getPatientRecordId } from "@/lib/patientService";
import { PatientAutocompleteInput } from "@/components/PatientAutocompleteInput";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  "In Progress": "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

const urgencyBadge: Record<string, string> = {
  STAT: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 animate-pulse font-bold",
  Emergency: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30 font-bold",
  Urgent: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 font-semibold",
  Routine: "bg-muted text-muted-foreground",
};

export default function Radiology() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const { data: ordersData, isLoading, refetch } = useRadiologyOrders(1, 100, {
    search: search || undefined,
    modality: modalityFilter !== "All" ? modalityFilter : undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
  });
  const { data: stats, refetch: refetchStats } = useRadiologyStats();
  const { data: patientsData, isLoading: patientsLoading, isError: patientsError } = usePatients(1, 100);

  const startExamMutation = useStartRadiologyExam();
  const submitReportMutation = useSubmitRadiologyReport();
  const createOrderMutation = useCreateRadiologyOrder();

  const orders = ordersData?.data || [];
  const patients = patientsData?.data || [];

  // Active Modals State
  const [selectedOrder, setSelectedOrder] = useState<RadiologyOrder | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Report Form State
  const [reportTechnique, setReportTechnique] = useState("");
  const [reportFindings, setReportFindings] = useState("");
  const [reportImpression, setReportImpression] = useState("");
  const [reportRecommendations, setReportRecommendations] = useState("");
  const [radiologistName, setRadiologistName] = useState("Dr. Sarah Wambui, MD (Radiologist)");

  // New Order Form State
  const [newOrderPatientId, setNewOrderPatientId] = useState("");
  const [newOrderModality, setNewOrderModality] = useState("X-Ray");
  const [newOrderBodyPart, setNewOrderBodyPart] = useState("");
  const [newOrderUrgency, setNewOrderUrgency] = useState<"Routine" | "Urgent" | "STAT">("Routine");
  const [newOrderIndication, setNewOrderIndication] = useState("");

  // Start Exam
  const handleStartExam = async (order: RadiologyOrder) => {
    if (!order.id) return;
    try {
      await startExamMutation.mutateAsync({
        id: order.id,
        technicianName: "Radiographer On Duty",
      });
      toast.success(`Exam started for ${order.patientName}! Order marked In Progress.`);
      refetch();
      refetchStats();
    } catch (err: any) {
      toast.error("Failed to start examination", { description: err.message });
    }
  };

  // Open Report Editor
  const handleOpenReport = (order: RadiologyOrder) => {
    setSelectedOrder(order);
    setReportTechnique(order.technique || `Standard protocol ${order.modality} examination of ${order.bodyPart}.`);
    setReportFindings(order.findings || "");
    setReportImpression(order.impression || "");
    setReportRecommendations(order.recommendations || "Clinical correlation advised.");
    setRadiologistName(order.radiologistName || "Dr. Sarah Wambui, MD (Consultant Radiologist)");
    setIsReportModalOpen(true);
  };

  // Save Report
  const handleSaveReport = async (publish: boolean) => {
    if (!selectedOrder?.id) return;
    if (publish && (!reportFindings || !reportImpression)) {
      toast.error("Findings and Impression are required to finalize report.");
      return;
    }

    try {
      await submitReportMutation.mutateAsync({
        id: selectedOrder.id,
        report: {
          technique: reportTechnique,
          findings: reportFindings,
          impression: reportImpression,
          recommendations: reportRecommendations,
          radiologistName,
          publish,
        },
      });

      toast.success(publish ? "Diagnostic report finalized and signed off!" : "Report draft saved.");
      setIsReportModalOpen(false);
      refetch();
      refetchStats();
    } catch (err: any) {
      toast.error("Failed to save report", { description: err.message });
    }
  };

  // Submit New Order
  const handleCreateOrder = async () => {
    if (!newOrderPatientId) {
      toast.error("Please select a patient");
      return;
    }
    if (!newOrderBodyPart) {
      toast.error("Please specify anatomical body part or exam name");
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        patientId: newOrderPatientId,
        modality: newOrderModality,
        bodyPart: newOrderBodyPart,
        imagingType: newOrderBodyPart,
        urgency: newOrderUrgency,
        clinicalIndication: newOrderIndication,
        notes: newOrderIndication,
      });

      toast.success("Radiology request placed successfully!");
      setIsNewOrderModalOpen(false);
      setNewOrderBodyPart("");
      setNewOrderIndication("");
      refetch();
      refetchStats();
    } catch (err: any) {
      toast.error("Failed to create order", { description: err.message });
    }
  };

  // Print Diagnostic Report
  const triggerPrintReport = () => {
    const el = document.getElementById("radiology-report-print-target");
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Radiology Report - ${selectedOrder?.orderNumber}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; line-height: 1.6; color: #111; margin: 30px; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
            .hospital-name { font-size: 20px; font-weight: bold; color: #1e3a8a; }
            .doc-title { font-size: 14px; font-weight: bold; text-transform: uppercase; color: #2563eb; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 12px; }
            .section { margin-bottom: 14px; }
            .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; margin-bottom: 6px; }
            .content { white-space: pre-line; }
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
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <ScanLine className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Radiology Information System (RIS & PACS)</h1>
            <p className="text-xs text-muted-foreground">Digital imaging worklist, modality management, DICOM review & diagnostic reporting</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              refetchStats();
              toast.success("Radiology queue refreshed");
            }}
            className="gap-1.5 text-xs h-9"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/radiology/imaging")}
            className="gap-1.5 text-xs h-9"
          >
            <Eye className="h-3.5 w-3.5" /> PACS Viewer
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/radiology/reports")}
            className="gap-1.5 text-xs h-9"
          >
            <FileText className="h-3.5 w-3.5" /> Reports Archive
          </Button>

          <Button
            size="sm"
            onClick={() => setIsNewOrderModalOpen(true)}
            className="gap-1.5 text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-3.5 w-3.5" /> New Radiology Order
          </Button>
        </div>
      </div>

      {/* RIS KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Examinations</p>
              <h3 className="text-2xl font-bold font-heading text-amber-600 mt-1">
                {stats?.pending ?? orders.filter((o) => o.status === "Pending").length}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Awaiting acquisition</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In Progress Scans</p>
              <h3 className="text-2xl font-bold font-heading text-blue-600 mt-1">
                {stats?.inProgress ?? orders.filter((o) => o.status === "In Progress").length}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Inside modality rooms</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <ScanLine className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed & Reported</p>
              <h3 className="text-2xl font-bold font-heading text-emerald-600 mt-1">
                {stats?.completed ?? orders.filter((o) => o.status === "Completed").length}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Sign-off released to EMR</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">STAT / Urgent Cases</p>
              <h3 className="text-2xl font-bold font-heading text-rose-600 mt-1">
                {orders.filter((o) => o.urgency === "STAT" || o.urgency === "Emergency").length}
              </h3>
              <p className="text-xs text-rose-600 mt-0.5 font-medium">Immediate radiologist review</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DepartmentWaitingPatients department="radiology" />

      {/* Main Radiology Worklist Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, order number, body part..."
                className="pl-9 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={modalityFilter} onValueChange={setModalityFilter}>
                <SelectTrigger className="w-36 h-9 text-xs">
                  <SelectValue placeholder="Modality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Modalities</SelectItem>
                  <SelectItem value="X-Ray">X-Ray (Digital)</SelectItem>
                  <SelectItem value="Ultrasound">Ultrasound (4D)</SelectItem>
                  <SelectItem value="CT Scan">CT Scan</SelectItem>
                  <SelectItem value="MRI">MRI Scan</SelectItem>
                  <SelectItem value="Mammography">Mammography</SelectItem>
                  <SelectItem value="Echocardiogram">Echocardiogram</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-9 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/60 border-b border-border text-muted-foreground font-medium">
                <tr>
                  <th className="py-3 px-3 text-left">Order No</th>
                  <th className="py-3 px-3 text-left">Patient Details</th>
                  <th className="py-3 px-2 text-left">Modality</th>
                  <th className="py-3 px-3 text-left">Examination / Body Part</th>
                  <th className="py-3 px-2 text-center">Urgency</th>
                  <th className="py-3 px-2 text-left">Payment</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      Loading imaging orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No radiology examinations found.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id || o._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-foreground">
                        {o.orderNumber || o.orderId}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-foreground">{o.patientName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {o.patientDisplayId} · {o.patientGender || "Adult"}
                        </p>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 border-blue-200">
                          {o.modality}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-foreground">{o.bodyPart || o.imagingType}</p>
                        {o.clinicalIndication && (
                          <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                            {o.clinicalIndication}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge variant="outline" className={`text-[10px] ${urgencyBadge[o.urgency || "Routine"]}`}>
                          {o.urgency || "Routine"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        {o.paymentStatus === "Awaiting Cashier Payment" ? (
                          <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Unpaid (Cashier)
                          </Badge>
                        ) : o.paymentStatus === "Awaiting Insurance Approval" ? (
                          <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Awaiting Auth
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" /> Cleared
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge variant="outline" className={`text-[10px] ${statusStyle[o.status || "Pending"]}`}>
                          {o.status || "Pending"}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {o.status === "Pending" && (
                            o.paymentStatus === "Awaiting Cashier Payment" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="h-7 text-[11px] gap-1 px-2.5 text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30 cursor-not-allowed opacity-90"
                                title="Patient must complete payment at Cashier Desk before examination begins"
                              >
                                <AlertCircle className="h-3 w-3" /> Pay at Cashier
                              </Button>
                            ) : o.paymentStatus === "Awaiting Insurance Approval" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="h-7 text-[11px] gap-1 px-2.5 text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/30 cursor-not-allowed opacity-90"
                                title="Cashier must approve insurance pre-authorization before examination begins"
                              >
                                <Clock className="h-3 w-3" /> Awaiting Auth
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="h-7 text-[11px] gap-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => handleStartExam(o)}
                                disabled={startExamMutation.isPending}
                              >
                                <Play className="h-3 w-3" /> Start Exam
                              </Button>
                            )
                          )}

                          {o.status === "In Progress" && (
                            <Button
                              size="sm"
                              className="h-7 text-[11px] gap-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleOpenReport(o)}
                            >
                              <FileText className="h-3 w-3" /> Write Report
                            </Button>
                          )}

                          {o.status === "Completed" && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] gap-1 px-2"
                                onClick={() => {
                                  setSelectedOrder(o);
                                  setIsPrintModalOpen(true);
                                }}
                              >
                                <Printer className="h-3 w-3" /> Report
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] gap-1 px-2"
                                onClick={() => {
                                  setSelectedOrder(o);
                                  setIsViewerModalOpen(true);
                                }}
                              >
                                <Eye className="h-3 w-3" /> Scan
                              </Button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── MODAL: DIAGNOSTIC REPORT WRITER ───────────────────────────────────── */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Radiology Diagnostic Report: {selectedOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Patient: <span className="font-semibold text-foreground">{selectedOrder?.patientName}</span> ({selectedOrder?.patientDisplayId}) · Examination: <span className="font-bold text-foreground">{selectedOrder?.modality} - {selectedOrder?.bodyPart}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs">Examination Technique / Protocol</Label>
              <Input
                value={reportTechnique}
                onChange={(e) => setReportTechnique(e.target.value)}
                placeholder="e.g. PA and Lateral chest radiographs obtained with high-kV technique."
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Radiological Findings</Label>
              <textarea
                rows={4}
                value={reportFindings}
                onChange={(e) => setReportFindings(e.target.value)}
                placeholder="Describe anatomy, lung fields, mediastinum, soft tissue, bones, abnormalities..."
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-foreground">Diagnostic Impression / Conclusion</Label>
              <textarea
                rows={2}
                value={reportImpression}
                onChange={(e) => setReportImpression(e.target.value)}
                placeholder="Final summary diagnosis (e.g. Normal chest radiograph, Right lower lobe consolidation...)"
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Clinical Recommendations</Label>
              <Input
                value={reportRecommendations}
                onChange={(e) => setReportRecommendations(e.target.value)}
                placeholder="e.g. Follow-up scan in 4 weeks, contrast enhanced CT recommended."
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Signing Radiologist</Label>
              <Input
                value={radiologistName}
                onChange={(e) => setRadiologistName(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleSaveReport(false)}
              disabled={submitReportMutation.isPending}
            >
              Save Draft
            </Button>
            <Button
              onClick={() => handleSaveReport(true)}
              disabled={submitReportMutation.isPending}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4" /> Finalize & Release Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: PACS DICOM PREVIEW VIEWER ─────────────────────────────────── */}
      <Dialog open={isViewerModalOpen} onOpenChange={setIsViewerModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <ScanLine className="h-5 w-5 text-blue-600" />
                DICOM Medical Image Viewer: {selectedOrder?.orderNumber}
              </span>
              <Badge variant="outline">{selectedOrder?.modality}</Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="bg-black text-white p-4 rounded-xl flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden">
            {/* DICOM Mock Scan */}
            <div className="relative max-h-[380px] w-full flex items-center justify-center">
              <img
                src={
                  selectedOrder?.images?.[0] ||
                  "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
                }
                alt="Medical Scan"
                className="max-h-[340px] rounded object-contain filter grayscale contrast-125"
              />
            </div>

            {/* DICOM Overlay HUD */}
            <div className="absolute top-3 left-3 text-[11px] font-mono text-emerald-400 space-y-0.5 bg-black/70 p-2 rounded">
              <p>PATIENT: {selectedOrder?.patientName}</p>
              <p>PID: {selectedOrder?.patientDisplayId}</p>
              <p>SERIES: {selectedOrder?.modality} {selectedOrder?.bodyPart}</p>
              <p>DATE: {selectedOrder?.orderDate || "TODAY"}</p>
            </div>

            <div className="absolute bottom-3 right-3 text-[11px] font-mono text-emerald-400 bg-black/70 p-2 rounded">
              <p>WL: 40 / WW: 400</p>
              <p>ZOOM: 100% | 1.5T / 120kV</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewerModalOpen(false)}>
              Close Viewer
            </Button>
            <Button onClick={() => navigate("/radiology/imaging")} className="gap-2">
              <Sliders className="h-4 w-4" /> Full PACS Studio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: CREATE RADIOLOGY ORDER ────────────────────────────────────── */}
      <Dialog open={isNewOrderModalOpen} onOpenChange={setIsNewOrderModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" /> New Radiology Examination Order
            </DialogTitle>
            <DialogDescription className="text-xs">
              Request an imaging study from doctor consultation, emergency or ward
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Patient</Label>
              <PatientAutocompleteInput
                value={newOrderPatientId}
                onChange={(id) => setNewOrderPatientId(id)}
                placeholder="Type patient name, OPD number or phone..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Imaging Modality</Label>
                <Select value={newOrderModality} onValueChange={setNewOrderModality}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="X-Ray">X-Ray (Digital)</SelectItem>
                    <SelectItem value="Ultrasound">Ultrasound (4D)</SelectItem>
                    <SelectItem value="CT Scan">CT Scan</SelectItem>
                    <SelectItem value="MRI">MRI</SelectItem>
                    <SelectItem value="Mammography">Mammography</SelectItem>
                    <SelectItem value="Echocardiogram">Echocardiogram</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Urgency</Label>
                <Select value={newOrderUrgency} onValueChange={(v: any) => setNewOrderUrgency(v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Routine">Routine</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="STAT">STAT / Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Anatomical Body Part / Scan Type</Label>
              <Input
                value={newOrderBodyPart}
                onChange={(e) => setNewOrderBodyPart(e.target.value)}
                placeholder="e.g. Chest PA & Lateral, Abdominal Pelvic, Brain Plain, Right Knee"
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Clinical Indication / History</Label>
              <textarea
                rows={3}
                value={newOrderIndication}
                onChange={(e) => setNewOrderIndication(e.target.value)}
                placeholder="Describe clinical symptoms, suspected pathology, rule out..."
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsNewOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrder} disabled={createOrderMutation.isPending} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Submit Imaging Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: OFFICIAL DIAGNOSTIC PRINTABLE REPORT ────────────────────────── */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center justify-between">
              <span>Official Diagnostic Imaging Report</span>
            </DialogTitle>
          </DialogHeader>

          <div id="radiology-report-print-target" className="p-6 bg-white text-black rounded-lg border space-y-4">
            <div className="border-b-2 border-blue-700 pb-3 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-blue-900">ICARE SPECIALIST HOSPITAL</h2>
                <p className="text-xs text-gray-600">Department of Radiology & Medical Imaging</p>
                <p className="text-xs text-gray-500">PO BOX 40100 - Nairobi | Tel: +254 700 000 000</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-xs font-bold border-blue-600 text-blue-700 uppercase">
                  DIAGNOSTIC REPORT
                </Badge>
                <p className="text-xs font-mono font-bold mt-1 text-gray-800">{selectedOrder?.orderNumber}</p>
              </div>
            </div>

            {/* Demographics Box */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 border border-gray-200 rounded text-xs">
              <div>
                <p><span className="font-semibold text-gray-600">Patient:</span> <span className="font-bold">{selectedOrder?.patientName}</span></p>
                <p><span className="font-semibold text-gray-600">Patient ID:</span> <span className="font-mono">{selectedOrder?.patientDisplayId}</span></p>
                <p><span className="font-semibold text-gray-600">Gender / Age:</span> {selectedOrder?.patientGender || "Adult"}</p>
              </div>
              <div>
                <p><span className="font-semibold text-gray-600">Examination:</span> <span className="font-bold">{selectedOrder?.modality} - {selectedOrder?.bodyPart}</span></p>
                <p><span className="font-semibold text-gray-600">Order Date:</span> {selectedOrder?.orderDate || "Today"}</p>
                <p><span className="font-semibold text-gray-600">Referring Physician:</span> {selectedOrder?.requestedBy || "Attending Doctor"}</p>
              </div>
            </div>

            {/* Report Content */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div>
                <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px] border-b pb-1 mb-1">
                  Technique
                </h4>
                <p className="text-gray-800">{selectedOrder?.technique || `Standard ${selectedOrder?.modality} study.`}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px] border-b pb-1 mb-1">
                  Clinical Indication
                </h4>
                <p className="text-gray-800">{selectedOrder?.clinicalIndication || "Routine clinical evaluation."}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px] border-b pb-1 mb-1">
                  Findings
                </h4>
                <p className="text-gray-800 whitespace-pre-line">{selectedOrder?.findings || "No focal abnormalities detected."}</p>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] border-b pb-1 mb-1">
                  Impression
                </h4>
                <p className="font-bold text-gray-900 whitespace-pre-line">{selectedOrder?.impression || "Normal study."}</p>
              </div>

              {selectedOrder?.recommendations && (
                <div>
                  <h4 className="font-bold text-gray-700 uppercase tracking-wider text-[11px] border-b pb-1 mb-1">
                    Recommendations
                  </h4>
                  <p className="text-gray-800">{selectedOrder.recommendations}</p>
                </div>
              )}
            </div>

            {/* Digital Sign-off Signature */}
            <div className="pt-6 border-t border-dashed border-gray-400 flex justify-between items-center text-xs">
              <span className="text-[10px] text-gray-500">Verified & Released electronically via ICare PACS</span>
              <div className="text-right">
                <p className="font-bold text-gray-900">{selectedOrder?.radiologistName || "Consultant Radiologist"}</p>
                <p className="text-[11px] text-gray-500">MBChB, MMed (Radiology), FRCR</p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
              Close
            </Button>
            <Button onClick={triggerPrintReport} className="gap-2">
              <Printer className="h-4 w-4" /> Print Diagnostic Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
