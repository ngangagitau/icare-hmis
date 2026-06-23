import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Bed, Stethoscope, Calendar, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const admittedPatients = [
  { 
    id: "A-1001", 
    pid: "P-10234",
    name: "John Doe", 
    age: 45, 
    gender: "Male",
    ward: "General Ward A", 
    bed: "A-12",
    admissionDate: "2026-03-10", 
    doctor: "Dr. Ochieng",
    diagnosis: "Hypertension / Diabetes",
    status: "Stable"
  },
  { 
    id: "A-1002", 
    pid: "P-10232",
    name: "Jane Smith", 
    age: 32, 
    gender: "Female",
    ward: "Surgical Ward", 
    bed: "S-05",
    admissionDate: "2026-03-11", 
    doctor: "Dr. Njeri",
    diagnosis: "Post-appendectomy",
    status: "Recovering"
  },
  { 
    id: "A-1003", 
    pid: "P-10229",
    name: "Samuel Kim", 
    age: 29, 
    gender: "Male",
    ward: "ICU", 
    bed: "ICU-03",
    admissionDate: "2026-03-12", 
    doctor: "Dr. Kipchoge",
    diagnosis: "Respiratory Distress",
    status: "Critical"
  },
];

const statusStyle: Record<string, string> = {
  Stable: "bg-success/10 text-success border-success/20",
  Recovering: "bg-info/10 text-info border-info/20",
  Critical: "bg-destructive/10 text-destructive border-destructive/20 animate-pulse",
};

export default function IPD() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return admittedPatients.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.pid.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">In-Patient Department (IPD)</h1>
        <p className="text-muted-foreground text-sm">Clinical monitoring and ward round management</p>
      </div>

      <Card className="shadow-card border-border">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, PID, or Bed ID..."
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
                  <TableHead className="text-xs font-semibold uppercase h-10">Primary Diagnosis</TableHead>
                  <TableHead className="text-xs font-semibold uppercase h-10">Clinical Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((patient) => (
                    <TableRow 
                      key={patient.id} 
                      className="group hover:bg-accent/40 transition-colors"
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-primary/5 flex items-center justify-center border border-primary/10">
                            <Bed className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold block">{patient.bed}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{patient.ward}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div 
                          className="cursor-pointer"
                          onClick={() => navigate(`/doctor/inpatient/${patient.id}`)}
                        >
                          <p className="text-sm font-semibold text-primary hover:underline transition-all">
                            {patient.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {patient.pid} · {patient.age}y · {patient.gender}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {patient.admissionDate}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Adm ID: {patient.id}</p>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                          {patient.doctor}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <p className="text-xs truncate max-w-[150px] font-medium" title={patient.diagnosis}>
                          {patient.diagnosis}
                        </p>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] uppercase font-bold tracking-tight ${statusStyle[patient.status] || ""}`}
                        >
                          <Activity className="h-2.5 w-2.5 mr-1" />
                          {patient.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No admitted patients found matching your search.
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
