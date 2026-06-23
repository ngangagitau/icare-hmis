import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer } from "lucide-react";

const reports = [
  { id: "RR-001", patient: "Faith Wambui", exam: "Abdominal Ultrasound", radiologist: "Dr. Mutiso", date: "2024-03-10", status: "Final" },
  { id: "RR-002", patient: "Samuel Kipchoge", exam: "Chest X-Ray PA", radiologist: "Dr. Mutiso", date: "2024-03-10", status: "Draft" },
];

export default function RadiologyReports() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Radiology Reports</h1><p className="text-muted-foreground text-sm">Auto-generated radiology reports with audit trail</p></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Report ID</TableHead><TableHead>Patient</TableHead><TableHead>Examination</TableHead><TableHead>Radiologist</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{reports.map(r => (
            <TableRow key={r.id}><TableCell className="font-mono">{r.id}</TableCell><TableCell className="font-medium">{r.patient}</TableCell><TableCell>{r.exam}</TableCell><TableCell>{r.radiologist}</TableCell><TableCell>{r.date}</TableCell><TableCell><Badge variant={r.status === "Final" ? "default" : "secondary"}>{r.status}</Badge></TableCell><TableCell><Button size="sm" variant="outline"><Printer className="h-3 w-3 mr-1" />Print</Button></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
