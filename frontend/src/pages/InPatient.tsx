import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Bed, UserPlus, Calendar, Activity, ArrowRightLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const wards = [
  { name: "General Ward A", total: 20, occupied: 16, available: 4 },
  { name: "General Ward B", total: 15, occupied: 12, available: 3 },
  { name: "Maternity", total: 10, occupied: 8, available: 2 },
  { name: "ICU", total: 6, occupied: 5, available: 1 },
  { name: "Paediatric", total: 12, occupied: 7, available: 5 },
];

const admissions = [
  { id: "ADM-412", patient: "Peter Odhiambo", pid: "P-10233", ward: "General Ward A", bed: "A-12", days: 3, status: "Active", doctor: "Dr. Ochieng" },
  { id: "ADM-411", patient: "Mary Achieng", pid: "P-10232", ward: "Maternity", bed: "M-5", days: 1, status: "Active", doctor: "Dr. Njeri" },
  { id: "ADM-410", patient: "David Kipchoge", pid: "P-10229", ward: "ICU", bed: "ICU-3", days: 5, status: "Pending Discharge", doctor: "Dr. Kipchoge" },
];

const statusStyle: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  "Pending Discharge": "bg-warning/10 text-warning border-warning/20",
};

const InPatient = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredAdmissions = useMemo(() => {
    return admissions.filter((admission) =>
      admission.patient.toLowerCase().includes(search.toLowerCase()) ||
      admission.pid.toLowerCase().includes(search.toLowerCase()) ||
      admission.ward.toLowerCase().includes(search.toLowerCase()) ||
      admission.bed.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">In-Patient Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Wards, beds & admissions</p>
        </div>
        <Button className="gap-2">
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
            <Button variant="outline" size="sm" className="gap-2 h-9">
              <Filter className="h-4 w-4" /> Filter Wards
            </Button>
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
                  <TableHead className="text-xs font-semibold uppercase h-10">Actions</TableHead>
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

                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
                            <ArrowRightLeft className="h-3 w-3" /> Transfer
                          </Button>
                          {admission.status === "Pending Discharge" && (
                            <Button size="sm" className="h-7 gap-1 text-xs">
                              <FileText className="h-3 w-3" /> Discharge
                            </Button>
                          )}
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
    </div>
  );
};

export default InPatient;
