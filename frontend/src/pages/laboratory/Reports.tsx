import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer } from "lucide-react";

const reports = [
  { id: "LR-001", patient: "John Mwangi", test: "Complete Blood Count", technician: "Tech Otieno", date: "2024-03-10 11:30", status: "Final" },
  { id: "LR-002", patient: "Grace Njeri", test: "Liver Function Tests", technician: "Tech Njoki", date: "2024-03-09 16:45", status: "Final" },
  { id: "LR-003", patient: "Peter Odhiambo", test: "Urinalysis", technician: "Tech Otieno", date: "2024-03-10 12:00", status: "Preliminary" },
];

export default function LabReports() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Lab Reports</h1><p className="text-muted-foreground text-sm">View and print finalized lab reports</p></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Report ID</TableHead><TableHead>Patient</TableHead><TableHead>Test</TableHead><TableHead>Technician</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{reports.map(r => (
            <TableRow key={r.id}><TableCell className="font-mono">{r.id}</TableCell><TableCell className="font-medium">{r.patient}</TableCell><TableCell>{r.test}</TableCell><TableCell>{r.technician}</TableCell><TableCell>{r.date}</TableCell><TableCell><Badge variant={r.status === "Final" ? "default" : "secondary"}>{r.status}</Badge></TableCell><TableCell><Button size="sm" variant="outline"><Printer className="h-3 w-3 mr-1" />Print</Button></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
