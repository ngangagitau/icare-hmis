import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRightLeft, RefreshCw, Loader2, PlusCircle, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { 
  fetchWardTransfers, 
  createWardTransfer, 
  fetchInpatientAdmissions, 
  WardTransfer, 
  InpatientAdmission 
} from "@/lib/inpatientService";

const WARD_OPTIONS = [
  "General Ward A",
  "General Ward B",
  "Maternity",
  "ICU",
  "Paediatric",
  "Surgical Ward",
];

const DOCTOR_OPTIONS = [
  "Dr. John Smith",
  "Dr. Kamau",
  "Dr. Ouma",
  "Dr. Ochieng",
  "Dr. Njeri",
  "Dr. Kipchoge",
];

const REASON_OPTIONS = [
  "Condition deteriorated - requires intensive monitoring",
  "Condition improved - step down from ICU",
  "Post-operative recovery placement",
  "Maternity & neonatal care placement",
  "Patient request / Bed upgrade",
  "Isolation required for infectious precaution",
];

export default function InpatientTransfers() {
  const [transfers, setTransfers] = useState<WardTransfer[]>([]);
  const [activeAdmissions, setActiveAdmissions] = useState<InpatientAdmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedAdmissionId, setSelectedAdmissionId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [fromWard, setFromWard] = useState("");
  const [toWard, setToWard] = useState("");
  const [newBed, setNewBed] = useState("");
  const [doctor, setDoctor] = useState(DOCTOR_OPTIONS[0]);
  const [reason, setReason] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [transfersData, admissionsData] = await Promise.all([
        fetchWardTransfers(),
        fetchInpatientAdmissions({ status: "Active" }),
      ]);
      setTransfers(transfersData);
      setActiveAdmissions(admissionsData);
    } catch (err) {
      console.error("Error loading transfer data:", err);
      toast.error("Failed to load transfers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePatientSelect = (admId: string) => {
    setSelectedAdmissionId(admId);
    const adm = activeAdmissions.find((a) => a.id === admId || a.admissionId === admId);
    if (adm) {
      setPatientName(adm.patient);
      setFromWard(adm.ward);
      if (adm.doctor) {
        setDoctor(adm.doctor);
      }
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      toast.error("Please select or enter a patient.");
      return;
    }
    if (!fromWard) {
      toast.error("Please specify the current ward.");
      return;
    }
    if (!toWard) {
      toast.error("Please select the target ward.");
      return;
    }
    if (fromWard === toWard) {
      toast.error("Target ward must be different from current ward.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason for the transfer.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createWardTransfer({
        patient: patientName,
        from: fromWard,
        to: toWard,
        reason,
        doctor,
        admissionId: selectedAdmissionId || undefined,
        newBed: newBed.trim() || undefined,
      });

      toast.success(`Patient ${patientName} transferred to ${toWard} successfully.`);
      setIsDialogOpen(false);
      resetForm();
      await loadData();
    } catch (err: any) {
      console.error("Failed to create transfer:", err);
      toast.error(err?.message || "Failed to complete transfer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedAdmissionId("");
    setPatientName("");
    setFromWard("");
    setToWard("");
    setNewBed("");
    setDoctor(DOCTOR_OPTIONS[0]);
    setReason("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Ward Transfers</h1>
          <p className="text-muted-foreground text-sm">Transfer in-patients between hospital wards</p>
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

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" /> New Transfer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  Initiate Ward Transfer
                </DialogTitle>
                <DialogDescription>
                  Select an active admitted patient and designate their destination ward.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateTransfer} className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Admitted Patient</Label>
                  {activeAdmissions.length > 0 ? (
                    <Select value={selectedAdmissionId} onValueChange={handlePatientSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient to transfer" />
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
                    <Input
                      placeholder="Patient name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Current Ward</Label>
                    <Select value={fromWard} onValueChange={setFromWard}>
                      <SelectTrigger>
                        <SelectValue placeholder="Origin ward" />
                      </SelectTrigger>
                      <SelectContent>
                        {WARD_OPTIONS.map((w) => (
                          <SelectItem key={w} value={w}>{w}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Destination Ward</Label>
                    <Select value={toWard} onValueChange={setToWard}>
                      <SelectTrigger>
                        <SelectValue placeholder="Target ward" />
                      </SelectTrigger>
                      <SelectContent>
                        {WARD_OPTIONS.map((w) => (
                          <SelectItem key={w} value={w}>{w}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>New Bed (Optional)</Label>
                    <Input
                      placeholder="e.g. ICU-02, B-05"
                      value={newBed}
                      onChange={(e) => setNewBed(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Authorizing Doctor</Label>
                    <Select value={doctor} onValueChange={setDoctor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCTOR_OPTIONS.map((doc) => (
                          <SelectItem key={doc} value={doc}>{doc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason for Transfer</Label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select clinical reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {REASON_OPTIONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or enter custom reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="mt-2 text-xs"
                  />
                </div>

                <DialogFooter className="pt-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" /> Confirm Transfer
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-xs font-semibold uppercase">Transfer ID</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Patient</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">From Ward</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Destination Ward</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Clinical Reason</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Attending Doctor</TableHead>
                  <TableHead className="text-xs font-semibold uppercase">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading transfers...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : transfers.length > 0 ? (
                  transfers.map((t) => (
                    <TableRow key={t.id} className="hover:bg-accent/40 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold">{t.id}</TableCell>
                      <TableCell className="font-medium text-sm text-foreground">{t.patient}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted/40 font-normal">
                          {t.from}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold">
                          {t.to}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate" title={t.reason}>
                        {t.reason}
                      </TableCell>
                      <TableCell className="text-xs text-foreground">{t.doctor}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === "Completed" ? "default" : "secondary"} className="text-[11px]">
                          {t.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No ward transfers found.
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
