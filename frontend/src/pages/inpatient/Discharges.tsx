import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, RefreshCw, Loader2, LogOut, PlusCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { 
  fetchDischargeRecords, 
  finalizePatientDischarge, 
  fetchInpatientAdmissions, 
  DischargeRecord, 
  InpatientAdmission 
} from "@/lib/inpatientService";

const DISCHARGE_TYPES = [
  "Routine / Home",
  "Transfer to Tertiary Facility",
  "Against Medical Advice (DAMA)",
  "Discharge on Request",
  "Referred to Specialty Clinic",
  "Deceased",
];

export default function Discharges() {
  const [discharges, setDischarges] = useState<DischargeRecord[]>([]);
  const [activeAdmissions, setActiveAdmissions] = useState<InpatientAdmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [isDischargeDialogOpen, setIsDischargeDialogOpen] = useState(false);
  const [isNewDischargeDialogOpen, setIsNewDischargeDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DischargeRecord | null>(null);

  // Form fields
  const [dischargeType, setDischargeType] = useState("Routine / Home");
  const [dischargeNotes, setDischargeNotes] = useState("");
  const [selectedAdmissionId, setSelectedAdmissionId] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dischargesData, admissionsData] = await Promise.all([
        fetchDischargeRecords(),
        fetchInpatientAdmissions({ status: "Active" }),
      ]);
      setDischarges(dischargesData);
      setActiveAdmissions(admissionsData);
    } catch (err) {
      console.error("Error loading discharges:", err);
      toast.error("Failed to load discharge records.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDischarge = (record: DischargeRecord) => {
    setSelectedRecord(record);
    setDischargeType("Routine / Home");
    setDischargeNotes(`Discharged in stable condition. Instructions provided to patient.`);
    setIsDischargeDialogOpen(true);
  };

  const handleConfirmDischarge = async () => {
    if (!selectedRecord) return;

    setIsSubmitting(true);
    try {
      const targetId = selectedRecord.admissionId || selectedRecord.id;
      const success = await finalizePatientDischarge(targetId, {
        dischargeNotes,
        dischargeType,
      });

      if (success) {
        toast.success(`Patient ${selectedRecord.patient} discharged successfully.`);
        setIsDischargeDialogOpen(false);
        setSelectedRecord(null);
        await loadData();
      } else {
        toast.error("Failed to finalize discharge. Please try again.");
      }
    } catch (err: any) {
      console.error("Discharge error:", err);
      toast.error(err?.message || "Failed to finalize discharge.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewDischargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmissionId) {
      toast.error("Please select a patient to discharge.");
      return;
    }

    const adm = activeAdmissions.find((a) => a.id === selectedAdmissionId || a.admissionId === selectedAdmissionId);
    const patientName = adm ? adm.patient : "Patient";

    setIsSubmitting(true);
    try {
      const success = await finalizePatientDischarge(selectedAdmissionId, {
        dischargeNotes,
        dischargeType,
      });

      if (success) {
        toast.success(`Patient ${patientName} discharged successfully.`);
        setIsNewDischargeDialogOpen(false);
        setSelectedAdmissionId("");
        setDischargeNotes("");
        await loadData();
      } else {
        toast.error("Failed to finalize discharge.");
      }
    } catch (err: any) {
      console.error("Discharge error:", err);
      toast.error(err?.message || "Failed to process discharge.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Discharges</h1>
          <p className="text-muted-foreground text-sm">Patient discharge workflow, clearance and bill finalization</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadData} 
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Dialog open={isNewDischargeDialogOpen} onOpenChange={setIsNewDischargeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" /> Process Discharge
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <LogOut className="h-5 w-5 text-primary" />
                  Discharge Active Patient
                </DialogTitle>
                <DialogDescription>
                  Select an active in-patient to finalize clinical discharge and release bed.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleNewDischargeSubmit} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Admitted In-Patient</Label>
                  {activeAdmissions.length > 0 ? (
                    <Select value={selectedAdmissionId} onValueChange={setSelectedAdmissionId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient to discharge" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeAdmissions.map((adm) => (
                          <SelectItem key={adm.id} value={adm.id}>
                            {adm.patient} ({adm.pid}) - {adm.ward} [{adm.bed}]
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-xs text-muted-foreground p-3 border rounded-md bg-muted/20">
                      No active admissions found.
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Discharge Type</Label>
                  <Select value={dischargeType} onValueChange={setDischargeType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISCHARGE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Discharge Summary / Clinical Notes</Label>
                  <Textarea
                    placeholder="Enter discharge instructions, medication review, and follow-up plan..."
                    value={dischargeNotes}
                    onChange={(e) => setDischargeNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <DialogFooter className="pt-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsNewDischargeDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !selectedAdmissionId}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Confirm Discharge
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Row Discharge Dialog */}
      <Dialog open={isDischargeDialogOpen} onOpenChange={setIsDischargeDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-primary" />
              Finalize Discharge: {selectedRecord?.patient}
            </DialogTitle>
            <DialogDescription>
              {selectedRecord?.ward} · Admitted {selectedRecord?.admitted} · Bill: KES {selectedRecord?.billTotal.toLocaleString()}
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
                  {DISCHARGE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Discharge Summary & Patient Instructions</Label>
              <Textarea
                placeholder="Follow-up advice, take-home prescriptions..."
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
              onClick={() => setIsDischargeDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDischarge} 
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Finalizing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Complete Discharge
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="shadow-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase">Admission No</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Patient</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Ward</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Admitted Date</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Attending Doctor</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Bill (KES)</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Bill Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading discharge records...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : discharges.length > 0 ? (
                  discharges.map((d) => (
                    <TableRow key={d.id} className="hover:bg-accent/40 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold">{d.id}</TableCell>
                      <TableCell className="font-medium text-sm text-foreground">
                        {d.patient}
                        <span className="block text-[11px] text-muted-foreground">{d.pid}</span>
                      </TableCell>
                      <TableCell className="text-xs">{d.ward}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{d.admitted}</TableCell>
                      <TableCell className="text-xs text-foreground">{d.doctor}</TableCell>
                      <TableCell className="font-mono text-xs font-bold">
                        {d.billTotal ? d.billTotal.toLocaleString() : "0"}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={d.billStatus === "Cleared" ? "default" : "secondary"}
                          className={d.billStatus === "Cleared" ? "bg-success/15 text-success border-success/30" : ""}
                        >
                          {d.billStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={d.status === "Discharged" ? "outline" : "default"}
                          className={d.status === "Discharged" ? "bg-muted text-muted-foreground" : ""}
                        >
                          {d.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {d.status === "Discharged" ? (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Completed
                          </span>
                        ) : (
                          <Button 
                            size="sm" 
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => handleOpenDischarge(d)}
                          >
                            <LogOut className="h-3.5 w-3.5" /> Discharge
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                      No discharge records available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
