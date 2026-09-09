import { useMemo, useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Filter, 
  Bed, 
  UserPlus, 
  Calendar, 
  Activity, 
  ArrowRightLeft, 
  FileText, 
  RefreshCw, 
  Loader2, 
  Trash2, 
  LogOut, 
  CheckCircle2, 
  ExternalLink 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  fetchInpatientAdmissions, 
  fetchWardSummaries, 
  deleteInpatientAdmission, 
  finalizePatientDischarge, 
  InpatientAdmission, 
  WardSummary 
} from "@/lib/inpatientService";

const defaultWards: WardSummary[] = [
  { name: "General Ward A", total: 20, occupied: 1, available: 19 },
  { name: "General Ward B", total: 15, occupied: 1, available: 14 },
  { name: "Maternity", total: 10, occupied: 0, available: 10 },
  { name: "ICU", total: 6, occupied: 0, available: 6 },
  { name: "Paediatric", total: 12, occupied: 0, available: 12 },
];

const defaultAdmissions: InpatientAdmission[] = [
  { id: "ADM-412", patient: "Alice Johnson", pid: "P001", ward: "General Ward A", bed: "A-12", days: 3, status: "Active", doctor: "Dr. John Smith", admissionDate: "2026-03-10" },
  { id: "ADM-411", patient: "Michael Brown", pid: "P002", ward: "General Ward B", bed: "B-04", days: 1, status: "Active", doctor: "Dr. John Smith", admissionDate: "2026-03-12" },
];

const statusStyle: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  "Pending Discharge": "bg-warning/10 text-warning border-warning/20",
  Discharged: "bg-muted text-muted-foreground border-border",
};

const InPatient = () => {
  const [search, setSearch] = useState("");
  const [wardFilter, setWardFilter] = useState("all");
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>(defaultAdmissions);
  const [wards, setWards] = useState<WardSummary[]>(defaultWards);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Action dialog states
  const [dischargeTarget, setDischargeTarget] = useState<InpatientAdmission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InpatientAdmission | null>(null);
  const [isDischarging, setIsDischarging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dischargeNotes, setDischargeNotes] = useState("");
  const [dischargeType, setDischargeType] = useState("Routine / Home");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [admissionsData, wardsData] = await Promise.all([
        fetchInpatientAdmissions(),
        fetchWardSummaries(),
      ]);

      if (admissionsData && admissionsData.length > 0) {
        setAdmissions(admissionsData);
      }
      if (wardsData && wardsData.length > 0) {
        setWards(wardsData);
      }
    } catch (err) {
      console.warn("Using fallback inpatient data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((admission) => {
      const matchesSearch =
        (admission.patient || "").toLowerCase().includes(search.toLowerCase()) ||
        (admission.pid || "").toLowerCase().includes(search.toLowerCase()) ||
        (admission.ward || "").toLowerCase().includes(search.toLowerCase()) ||
        (admission.bed || "").toLowerCase().includes(search.toLowerCase()) ||
        (admission.id || "").toLowerCase().includes(search.toLowerCase());

      const matchesWard = wardFilter === "all" || admission.ward === wardFilter;

      return matchesSearch && matchesWard;
    });
  }, [admissions, search, wardFilter]);

  const handleOpenDischarge = (adm: InpatientAdmission, e: React.MouseEvent) => {
    e.stopPropagation();
    setDischargeTarget(adm);
    setDischargeType("Routine / Home");
    setDischargeNotes("Discharge finalized. Patient in stable condition.");
  };

  const handleConfirmDischarge = async () => {
    if (!dischargeTarget) return;
    setIsDischarging(true);
    try {
      const success = await finalizePatientDischarge(dischargeTarget.id || dischargeTarget.admissionId || "", {
        dischargeNotes,
        dischargeType,
      });

      if (success) {
        toast.success(`Patient ${dischargeTarget.patient} discharged successfully.`);
        setDischargeTarget(null);
        await loadData();
      } else {
        toast.error("Failed to process discharge.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to process discharge.");
    } finally {
      setIsDischarging(false);
    }
  };

  const handleOpenDelete = (adm: InpatientAdmission, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(adm);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const success = await deleteInpatientAdmission(deleteTarget.id || deleteTarget.admissionId || "");
      if (success) {
        toast.success(`Admission record ${deleteTarget.id} removed.`);
        setDeleteTarget(null);
        await loadData();
      } else {
        toast.error("Failed to delete admission.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete admission.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">In-Patient Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Wards, beds & admissions</p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/inpatient/admissions")}>
          <UserPlus className="h-4 w-4" /> Admit Patient
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {wards.map((ward) => (
          <Card key={ward.name} className="shadow-card border-border">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-2">{ward.name}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xl font-heading font-bold">{ward.occupied}/{ward.total}</p>
                  <p className="text-xs text-muted-foreground">beds occupied</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[11px] ${
                    ward.available <= 1
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : ward.available <= 3
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-success/10 text-success border-success/20"
                  }`}
                >
                  {ward.available} free
                </Badge>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(ward.occupied / ward.total) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card border-border">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient, PID, ward or bed..."
                className="pl-9 h-9 bg-muted/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 h-9" onClick={loadData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
              </Button>

              <Select value={wardFilter} onValueChange={setWardFilter}>
                <SelectTrigger className="h-9 w-[160px] gap-1 text-xs">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="All Wards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {wards.map((w) => (
                    <SelectItem key={w.name} value={w.name}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase h-10">Bed</TableHead>
                  <TableHead className="text-xs font-semibold uppercase h-10">Patient Information</TableHead>
                  <TableHead className="text-xs font-semibold uppercase h-10">Admission Details</TableHead>
                  <TableHead className="text-xs font-semibold uppercase h-10">Attending Doctor</TableHead>
                  <TableHead className="text-xs font-semibold uppercase h-10">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase h-10 text-right pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmissions.length > 0 ? (
                  filteredAdmissions.map((admission) => (
                    <TableRow
                      key={admission.id}
                      className="group cursor-pointer hover:bg-accent/40 transition-colors"
                      onClick={() => navigate(`/doctor/inpatient/${admission.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          navigate(`/doctor/inpatient/${admission.id}`);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-primary/5 flex items-center justify-center border border-primary/10">
                            <Bed className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold block text-primary hover:underline">{admission.bed}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{admission.ward}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <p className="text-sm font-semibold text-primary hover:underline">{admission.patient}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {admission.pid} · Day {admission.days}
                        </p>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {admission.id}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Ward: {admission.ward}</p>
                      </TableCell>

                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                          {admission.doctor}
                        </div>
                      </TableCell>

                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase font-bold tracking-tight ${statusStyle[admission.status] || ""}`}
                        >
                          {admission.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 px-2 gap-1 text-xs"
                            title="Transfer Patient"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/inpatient/transfers");
                            }}
                          >
                            <ArrowRightLeft className="h-3 w-3" /> Transfer
                          </Button>

                          {admission.status !== "Discharged" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-7 px-2 gap-1 text-xs text-foreground"
                              title="Discharge Patient"
                              onClick={(e) => handleOpenDischarge(admission, e)}
                            >
                              <LogOut className="h-3 w-3 text-amber-600" /> Discharge
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Cancel / Delete Admission"
                            onClick={(e) => handleOpenDelete(admission, e)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No admissions found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Discharge Dialog */}
      <Dialog open={!!dischargeTarget} onOpenChange={(open) => !open && setDischargeTarget(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-primary" />
              Discharge Patient: {dischargeTarget?.patient}
            </DialogTitle>
            <DialogDescription>
              {dischargeTarget?.ward} · Bed {dischargeTarget?.bed} · PID: {dischargeTarget?.pid}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Discharge Classification</Label>
              <Select value={dischargeType} onValueChange={setDischargeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Routine / Home">Routine / Home</SelectItem>
                  <SelectItem value="Transfer to Tertiary Facility">Transfer to Tertiary Facility</SelectItem>
                  <SelectItem value="Against Medical Advice (DAMA)">Against Medical Advice (DAMA)</SelectItem>
                  <SelectItem value="Discharge on Request">Discharge on Request</SelectItem>
                  <SelectItem value="Referred to Specialty Clinic">Referred to Specialty Clinic</SelectItem>
                  <SelectItem value="Deceased">Deceased</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Discharge Notes & Summary</Label>
              <Textarea
                placeholder="Clinical observations, medications upon discharge..."
                value={dischargeNotes}
                onChange={(e) => setDischargeNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDischargeTarget(null)}
              disabled={isDischarging}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDischarge} 
              disabled={isDischarging}
              className="gap-2"
            >
              {isDischarging ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Discharging...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Confirm Discharge
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Cancel Admission Record?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the admission record for <span className="font-semibold text-foreground">{deleteTarget?.patient}</span> ({deleteTarget?.id})? 
              This will release bed <span className="font-mono font-semibold text-foreground">{deleteTarget?.bed}</span> back to available inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Keep Admission</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete Admission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InPatient;

