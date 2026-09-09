import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Bed, UserPlus, ArrowRightLeft, LogOut, FileText, RefreshCw, Loader2, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { 
  fetchInpatientAdmissions, 
  fetchWardSummaries, 
  InpatientAdmission, 
  WardSummary 
} from "@/lib/inpatientService";

interface BedInfo {
  id: string;
  wardName: string;
  status: "Occupied" | "Available" | "Maintenance";
  patient?: string;
  pid?: string;
  admissionId?: string;
  doctor?: string;
  admissionDate?: string;
  days?: number;
}

const DEFAULT_WARD_BED_LAYOUT: Record<string, { prefix: string; count: number }> = {
  "General Ward A": { prefix: "A", count: 12 },
  "General Ward B": { prefix: "B", count: 10 },
  "Maternity": { prefix: "M", count: 8 },
  "ICU": { prefix: "ICU", count: 6 },
  "Paediatric": { prefix: "P", count: 8 },
  "Surgical Ward": { prefix: "S", count: 8 },
};

const bedColor: Record<string, string> = {
  Occupied: "bg-destructive/10 border-destructive/40 text-destructive hover:bg-destructive/15 cursor-pointer shadow-sm",
  Available: "bg-success/10 border-success/40 text-success hover:bg-success/15 cursor-pointer shadow-sm",
  Maintenance: "bg-muted border-muted-foreground/30 text-muted-foreground hover:bg-muted/70 cursor-pointer shadow-sm",
};

export default function BedManagement() {
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>([]);
  const [wardSummaries, setWardSummaries] = useState<WardSummary[]>([]);
  const [maintenanceBeds, setMaintenanceBeds] = useState<Set<string>>(new Set(["A-04", "S-03"]));
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBed, setSelectedBed] = useState<BedInfo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [admissionsData, wardsData] = await Promise.all([
        fetchInpatientAdmissions({ status: "Active" }),
        fetchWardSummaries(),
      ]);
      setAdmissions(admissionsData);
      setWardSummaries(wardsData);
    } catch (err) {
      console.error("Error loading beds data:", err);
      toast.error("Failed to load live bed allocations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Construct dynamic beds for each ward
  const wardsData = useMemo(() => {
    const wardsList = wardSummaries.length > 0
      ? wardSummaries.map((w) => w.name)
      : Object.keys(DEFAULT_WARD_BED_LAYOUT);

    return wardsList.map((wardName) => {
      const config = DEFAULT_WARD_BED_LAYOUT[wardName] || {
        prefix: wardName.slice(0, 2).toUpperCase(),
        count: 8,
      };

      const beds: BedInfo[] = [];

      for (let i = 1; i <= config.count; i++) {
        const bedId = `${config.prefix}-${i < 10 ? `0${i}` : i}`;
        
        // Find if an active admission occupies this bed or ward
        const admission = admissions.find((a) => {
          const matchBed = (a.bed || "").toLowerCase() === bedId.toLowerCase();
          const matchWard = (a.ward || "").toLowerCase() === wardName.toLowerCase();
          return matchBed || (matchWard && a.bed?.includes(String(i)));
        });

        if (admission) {
          beds.push({
            id: bedId,
            wardName,
            status: "Occupied",
            patient: admission.patient,
            pid: admission.pid,
            admissionId: admission.id || admission.admissionId,
            doctor: admission.doctor,
            admissionDate: admission.admissionDate,
            days: admission.days,
          });
        } else if (maintenanceBeds.has(bedId)) {
          beds.push({
            id: bedId,
            wardName,
            status: "Maintenance",
          });
        } else {
          beds.push({
            id: bedId,
            wardName,
            status: "Available",
          });
        }
      }

      return {
        name: wardName,
        beds,
      };
    });
  }, [admissions, wardSummaries, maintenanceBeds]);

  // Overall statistics
  const totalBeds = wardsData.reduce((acc, w) => acc + w.beds.length, 0);
  const totalOccupied = wardsData.reduce(
    (acc, w) => acc + w.beds.filter((b) => b.status === "Occupied").length,
    0
  );
  const totalAvailable = wardsData.reduce(
    (acc, w) => acc + w.beds.filter((b) => b.status === "Available").length,
    0
  );
  const occupancyRate = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;

  const handleBedClick = (bed: BedInfo) => {
    setSelectedBed(bed);
    setIsDialogOpen(true);
  };

  const toggleMaintenance = (bedId: string) => {
    setMaintenanceBeds((prev) => {
      const next = new Set(prev);
      if (next.has(bedId)) {
        next.delete(bedId);
        toast.success(`Bed ${bedId} set to Available.`);
      } else {
        next.add(bedId);
        toast.info(`Bed ${bedId} marked for Maintenance.`);
      }
      return next;
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Bed Management</h1>
          <p className="text-muted-foreground text-sm">Visual ward occupancy and interactive bed allocation</p>
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

          <Button 
            size="sm" 
            onClick={() => navigate("/inpatient/admissions")}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" /> Admit Patient
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase">Total Bed Capacity</p>
            <p className="text-2xl font-heading font-bold mt-1 text-foreground">{totalBeds}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Across all wards</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase">Occupied Beds</p>
            <p className="text-2xl font-heading font-bold mt-1 text-destructive">{totalOccupied}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{occupancyRate}% overall occupancy</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase">Available Beds</p>
            <p className="text-2xl font-heading font-bold mt-1 text-success">{totalAvailable}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Ready for admission</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase">Under Maintenance</p>
            <p className="text-2xl font-heading font-bold mt-1 text-muted-foreground">{maintenanceBeds.size}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Temporarily offline</p>
          </CardContent>
        </Card>
      </div>

      {/* Ward Cards */}
      <div className="space-y-4">
        {wardsData.map((w) => {
          const occupiedCount = w.beds.filter((b) => b.status === "Occupied").length;
          const availableCount = w.beds.filter((b) => b.status === "Available").length;

          return (
            <Card key={w.name} className="shadow-card border-border">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base font-bold">{w.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                      {occupiedCount} Occupied
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                      {availableCount} Available
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {w.beds.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => handleBedClick(b)}
                      className={`rounded-lg border-2 p-3 text-center transition-all focus:outline-none focus:ring-2 focus:ring-primary ${bedColor[b.status]}`}
                      title={`Bed ${b.id}: ${b.status}${b.patient ? ` (${b.patient})` : ""}`}
                    >
                      <p className="font-mono text-xs font-bold">{b.id}</p>
                      <p className="text-[11px] mt-1 font-medium truncate">
                        {b.patient || b.status}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bed Details Action Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-primary" />
              Bed Details: {selectedBed?.id} ({selectedBed?.wardName})
            </DialogTitle>
            <DialogDescription>
              Current status: <span className="font-semibold">{selectedBed?.status}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedBed?.status === "Occupied" ? (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border p-3 bg-muted/20 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-semibold text-foreground">{selectedBed.patient}</span>
                </div>
                {selectedBed.pid && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient ID (PID):</span>
                    <span className="font-mono">{selectedBed.pid}</span>
                  </div>
                )}
                {selectedBed.doctor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Attending Doctor:</span>
                    <span>{selectedBed.doctor}</span>
                  </div>
                )}
                {selectedBed.admissionDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admission Date:</span>
                    <span>{selectedBed.admissionDate}</span>
                  </div>
                )}
                {selectedBed.days && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Length of Stay:</span>
                    <span className="font-semibold">{selectedBed.days} day(s)</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1.5 text-xs"
                  onClick={() => {
                    setIsDialogOpen(false);
                    if (selectedBed.admissionId) {
                      navigate(`/doctor/inpatient/${selectedBed.admissionId}`);
                    } else {
                      navigate(`/inpatient`);
                    }
                  }}
                >
                  <FileText className="h-3.5 w-3.5" /> Clinical File
                </Button>

                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1.5 text-xs"
                  onClick={() => {
                    setIsDialogOpen(false);
                    navigate("/inpatient/transfers");
                  }}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" /> Transfer
                </Button>

                <Button 
                  size="sm" 
                  className="gap-1.5 text-xs"
                  onClick={() => {
                    setIsDialogOpen(false);
                    navigate("/inpatient/discharges");
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" /> Discharge
                </Button>
              </div>
            </div>
          ) : selectedBed?.status === "Available" ? (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                This bed in <span className="font-semibold text-foreground">{selectedBed.wardName}</span> is vacant and sanitized for immediate patient admission.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button 
                  className="flex-1 gap-2"
                  onClick={() => {
                    setIsDialogOpen(false);
                    navigate(
                      `/inpatient/admissions?ward=${encodeURIComponent(selectedBed.wardName)}&bed=${encodeURIComponent(selectedBed.id)}`
                    );
                  }}
                >
                  <UserPlus className="h-4 w-4" /> Admit Patient to Bed
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => toggleMaintenance(selectedBed.id)}
                >
                  Mark Maintenance
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                This bed is currently offline for maintenance / sanitation.
              </p>

              <Button 
                className="w-full gap-2"
                onClick={() => selectedBed && toggleMaintenance(selectedBed.id)}
              >
                <CheckCircle2 className="h-4 w-4" /> Set Bed to Available
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
