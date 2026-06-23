import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BedDouble, UserPlus, FileText, ArrowRightLeft } from "lucide-react";

const wards = [
  { name: "General Ward A", total: 20, occupied: 16, available: 4 },
  { name: "General Ward B", total: 15, occupied: 12, available: 3 },
  { name: "Maternity", total: 10, occupied: 8, available: 2 },
  { name: "ICU", total: 6, occupied: 5, available: 1 },
  { name: "Paediatric", total: 12, occupied: 7, available: 5 },
];

const admissions = [
  { id: "ADM-412", patient: "Peter Odhiambo", pid: "P-10233", ward: "General Ward A", bed: "A-12", days: 3, status: "Active" },
  { id: "ADM-411", patient: "Mary Achieng", pid: "P-10232", ward: "Maternity", bed: "M-5", days: 1, status: "Active" },
  { id: "ADM-410", patient: "David Kipchoge", pid: "P-10229", ward: "ICU", bed: "ICU-3", days: 5, status: "Pending Discharge" },
];

const InPatient = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-heading font-bold">In-Patient Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Wards, beds & admissions</p>
      </div>
      <Button className="gap-2"><UserPlus className="h-4 w-4" /> Admit Patient</Button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {wards.map(w => (
        <Card key={w.name} className="shadow-card border-border">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">{w.name}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xl font-heading font-bold">{w.occupied}/{w.total}</p>
                <p className="text-xs text-muted-foreground">beds occupied</p>
              </div>
              <Badge variant="outline" className={`text-[11px] ${w.available <= 1 ? "bg-destructive/10 text-destructive border-destructive/20" : w.available <= 3 ? "bg-warning/10 text-warning border-warning/20" : "bg-success/10 text-success border-success/20"}`}>
                {w.available} free
              </Badge>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(w.occupied / w.total) * 100}%` }} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card className="shadow-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading">Current Admissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {admissions.map(a => (
          <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                <BedDouble className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{a.patient} <span className="text-muted-foreground">({a.pid})</span></p>
                <p className="text-xs text-muted-foreground">{a.id} · {a.ward} · Bed {a.bed} · Day {a.days}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-12 sm:ml-0">
              <Badge variant="outline" className={`text-[11px] ${a.status === "Active" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}`}>{a.status}</Badge>
              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs"><ArrowRightLeft className="h-3 w-3" /> Transfer</Button>
              {a.status === "Pending Discharge" && <Button size="sm" className="h-7 gap-1 text-xs"><FileText className="h-3 w-3" /> Discharge</Button>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export default InPatient;
