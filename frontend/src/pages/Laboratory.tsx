import { useMemo, useState } from "react";
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
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Printer,
  Loader2,
  Plus,
  TestTube,
  FileText,
  RefreshCw,
  Zap,
  AlertTriangle,
  ClipboardList,
} from "lucide-react";
import DepartmentWaitingPatients from "@/components/DepartmentWaitingPatients";
import { useLabTests, useLabTemplates, useCreateLabTest } from "@/hooks/useLaboratory";
import { usePatients } from "@/hooks/usePatients";
import type { LabOrderStatus, LabTest } from "@/lib/laboratoryService";
import { getPatientRecordId } from "@/lib/patientService";
import { PatientAutocompleteInput } from "@/components/PatientAutocompleteInput";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  Pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
  "Sample Received": "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
  Processing: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
  Completed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
};

const displayStatus = (status: LabOrderStatus) => {
  if (status === "Sample Received") return "Sample Collected";
  if (status === "Processing") return "On Analyzer";
  return status;
};

export default function Laboratory() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const { data, isLoading, refetch } = useLabTests(1, 100, search ? { search } : undefined);
  const { data: templates = [] } = useLabTemplates();
  const { data: patientsData, isLoading: patientsLoading, isError: patientsError } = usePatients(1, 100);
  const createTestMutation = useCreateLabTest();

  const orders = data?.data || [];
  const patients = patientsData?.data || [];

  // New Order Modal State
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [newOrderPatientId, setNewOrderPatientId] = useState("");
  const [newOrderTemplateCode, setNewOrderTemplateCode] = useState("");
  const [newOrderUrgency, setNewOrderUrgency] = useState("Routine");
  const [newOrderNotes, setNewOrderNotes] = useState("");

  const stats = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === "Pending").length,
      sampleCollected: orders.filter((o) => o.status === "Sample Received").length,
      inProgress: orders.filter((o) => o.status === "Processing").length,
      completed: orders.filter((o) => o.status === "Completed").length,
      unpaid: orders.filter((o) => o.paymentStatus === "Unpaid").length,
      abnormal: orders.filter((o) => o.results?.abnormal).length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (deptFilter === "All") return orders;
    return orders.filter((o) => {
      const name = `${o.testName} ${o.testCode || ""}`.toLowerCase();
      if (deptFilter === "Hematology") return name.includes("cbc") || name.includes("blood") || name.includes("esr");
      if (deptFilter === "Chemistry") return name.includes("lipid") || name.includes("glucose") || name.includes("lft") || name.includes("rft") || name.includes("sugar");
      if (deptFilter === "Microbiology") return name.includes("urine") || name.includes("stool") || name.includes("culture") || name.includes("malaria");
      if (deptFilter === "Serology") return name.includes("hiv") || name.includes("widal") || name.includes("hepatitis") || name.includes("vdrl");
      return true;
    });
  }, [orders, deptFilter]);

  const handleCreateOrder = async () => {
    if (!newOrderPatientId) {
      toast.error("Please select a patient");
      return;
    }
    const template = templates.find((t) => t.code === newOrderTemplateCode);
    if (!template) {
      toast.error("Please select a lab test profile");
      return;
    }

    try {
      await createTestMutation.mutateAsync({
        patientId: newOrderPatientId,
        testName: template.name,
        testCode: template.code,
        specimenType: template.specimenType,
        notes: newOrderNotes,
      });

      toast.success(`Lab order for ${template.name} created!`);
      setIsNewOrderOpen(false);
      setNewOrderNotes("");
      refetch();
    } catch (err: any) {
      toast.error("Failed to place lab order", { description: err.message });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Laboratory Information System (LIS)</h1>
            <p className="text-xs text-muted-foreground">Phlebotomy, clinical benchwork, analyzer verification & diagnostic release</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs h-9">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={() => navigate("/laboratory/samples")} className="gap-1.5 text-xs h-9">
            <TestTube className="h-3.5 w-3.5" /> Phlebotomy Counter
          </Button>

          <Button variant="outline" size="sm" onClick={() => navigate("/laboratory/results")} className="gap-1.5 text-xs h-9">
            <ClipboardList className="h-3.5 w-3.5" /> Enter Results
          </Button>

          <Button variant="outline" size="sm" onClick={() => navigate("/laboratory/reports")} className="gap-1.5 text-xs h-9">
            <FileText className="h-3.5 w-3.5" /> Reports
          </Button>

          <Button size="sm" onClick={() => setIsNewOrderOpen(true)} className="gap-1.5 text-xs h-9 bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-3.5 w-3.5" /> New Lab Order
          </Button>
        </div>
      </div>

      {/* LIS Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Awaiting Phlebotomy</p>
              <h3 className="text-2xl font-bold font-heading text-amber-600 mt-1">{stats.pending}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Samples to collect</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In Processing</p>
              <h3 className="text-2xl font-bold font-heading text-blue-600 mt-1">
                {stats.sampleCollected + stats.inProgress}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Benchwork & analyzers</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <FlaskConical className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verified & Released</p>
              <h3 className="text-2xl font-bold font-heading text-emerald-600 mt-1">{stats.completed}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Signed by pathologist</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Awaiting Payment</p>
              <h3 className="text-2xl font-bold font-heading text-rose-600 mt-1">{stats.unpaid}</h3>
              <p className="text-xs text-rose-600 mt-0.5 font-medium">Clear at cashier</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DepartmentWaitingPatients department="lab" />

      {/* Main LIS Requests Queue */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient, order number or test..."
                className="pl-9 text-xs h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Department Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["All", "Hematology", "Chemistry", "Microbiology", "Serology"].map((dept) => (
                <Button
                  key={dept}
                  variant={deptFilter === dept ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDeptFilter(dept)}
                  className="h-8 text-xs px-2.5"
                >
                  {dept}
                </Button>
              ))}
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
                  <th className="py-3 px-3 text-left">Test Name</th>
                  <th className="py-3 px-2 text-left">Specimen Container</th>
                  <th className="py-3 px-2 text-left">Payment</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" />
                      Loading laboratory orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No laboratory orders found for this department.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((r: LabTest) => (
                    <tr key={r._id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-foreground">
                        {r.orderNumber || r.testId}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-foreground">{r.patientName}</p>
                        <p className="text-[11px] text-muted-foreground">{r.patientDisplayId}</p>
                      </td>
                      <td className="py-3 px-3 font-medium text-foreground">
                        {r.testName}
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="text-[10px] text-purple-700 dark:text-purple-400 border-purple-200">
                          {r.specimenType || r.specimen || "Sample"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            r.paymentStatus === "Cleared"
                              ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
                              : "bg-rose-500/10 text-rose-700 border-rose-200"
                          )}
                        >
                          {r.paymentStatus || "Cleared"}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge variant="outline" className={`text-[10px] ${statusStyle[r.status]}`}>
                          {displayStatus(r.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {r.status === "Pending" && (
                            <Button
                              size="sm"
                              className="h-7 text-[11px] gap-1 px-2.5 bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => navigate(`/laboratory/samples?patient=${r.patientId || ""}`)}
                            >
                              <TestTube className="h-3 w-3" /> Collect Sample
                            </Button>
                          )}

                          {(r.status === "Sample Received" || r.status === "Processing") && (
                            <Button
                              size="sm"
                              className="h-7 text-[11px] gap-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => navigate(`/laboratory/results?order=${r._id}`)}
                            >
                              Enter Results
                            </Button>
                          )}

                          {r.status === "Completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] gap-1 px-2.5"
                              onClick={() => navigate("/laboratory/reports")}
                            >
                              <Printer className="h-3 w-3" /> Report
                            </Button>
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

      {/* ── MODAL: CREATE NEW LAB TEST REQUEST ───────────────────────────────── */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-600" /> New Laboratory Test Request
            </DialogTitle>
            <DialogDescription className="text-xs">
              Order diagnostic panel for outpatients, emergencies, or ward admissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs">Patient</Label>
              <Select value={newOrderPatientId} onValueChange={setNewOrderPatientId}>
                <SelectTrigger className="h-9 text-xs" disabled={patientsLoading || patients.length === 0}>
                  <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Select patient"} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => {
                    const patientRecordId = getPatientRecordId(p);
                    return patientRecordId ? (
                      <SelectItem key={patientRecordId} value={patientRecordId}>
                        {p.firstName} {p.lastName} ({p.patientId})
                      </SelectItem>
                    ) : null;
                  })}
                  {!patientsLoading && patients.length === 0 && <SelectItem value="no-patients" disabled>{patientsError ? "Unable to load patients" : "No registered patients"}</SelectItem>}
                </SelectContent>
              </Select>
              {patientsError && <p className="text-xs text-destructive">Unable to load registered patients.</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Laboratory Profile / Panel</Label>
              <Select value={newOrderTemplateCode} onValueChange={setNewOrderTemplateCode}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select diagnostic test..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.code} value={t.code}>
                      {t.name} ({t.specimenType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Urgency Priority</Label>
              <Select value={newOrderUrgency} onValueChange={setNewOrderUrgency}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Routine">Routine</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="STAT">STAT / Critical Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Clinical Indication / Notes</Label>
              <Input
                value={newOrderNotes}
                onChange={(e) => setNewOrderNotes(e.target.value)}
                placeholder="e.g. Fever of unknown origin, routine monitoring"
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={createTestMutation.isPending}
              className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4" /> Place Lab Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
