import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const discharges = [
  { id: "D-001", patient: "Rose Chebet", ward: "Ward A", admitted: "2024-03-05", doctor: "Dr. Kamau", billTotal: 45000, billStatus: "Cleared", status: "Ready" },
  { id: "D-002", patient: "David Mutua", ward: "Ward A", admitted: "2024-03-07", doctor: "Dr. Ouma", billTotal: 28000, billStatus: "Pending", status: "Awaiting Payment" },
];

export default function Discharges() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Discharges</h1><p className="text-muted-foreground text-sm">Patient discharge workflow and bill finalization</p></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Patient</TableHead><TableHead>Ward</TableHead><TableHead>Admitted</TableHead><TableHead>Doctor</TableHead><TableHead>Bill (KES)</TableHead><TableHead>Bill Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{discharges.map(d => (
            <TableRow key={d.id}><TableCell className="font-mono">{d.id}</TableCell><TableCell className="font-medium">{d.patient}</TableCell><TableCell>{d.ward}</TableCell><TableCell>{d.admitted}</TableCell><TableCell>{d.doctor}</TableCell><TableCell>{d.billTotal.toLocaleString()}</TableCell><TableCell><Badge variant={d.billStatus === "Cleared" ? "default" : "destructive"}>{d.billStatus}</Badge></TableCell><TableCell><Button size="sm" disabled={d.billStatus !== "Cleared"}>Discharge</Button></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
