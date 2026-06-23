import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const validations = [
  { id: "RAD-001", patient: "Samuel Kipchoge", exam: "Chest X-Ray PA", payment: "M-Pesa", amount: 2500, verified: true },
  { id: "RAD-003", patient: "James Kariuki", exam: "CT Head", payment: "Insurance (AAR)", amount: 15000, verified: true },
  { id: "RAD-004", patient: "Alice Muthoni", exam: "MRI Knee", payment: "Cash", amount: 25000, verified: false },
];

export default function RadiologyValidation() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Payment Validation</h1><p className="text-muted-foreground text-sm">Verify payment and insurance before radiology services</p></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Exam ID</TableHead><TableHead>Patient</TableHead><TableHead>Examination</TableHead><TableHead>Payment</TableHead><TableHead>Amount (KES)</TableHead><TableHead>Verified</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{validations.map(v => (
            <TableRow key={v.id}><TableCell className="font-mono">{v.id}</TableCell><TableCell className="font-medium">{v.patient}</TableCell><TableCell>{v.exam}</TableCell><TableCell>{v.payment}</TableCell><TableCell>{v.amount.toLocaleString()}</TableCell><TableCell><Badge variant={v.verified ? "default" : "destructive"}>{v.verified ? "Verified" : "Pending"}</Badge></TableCell><TableCell>{!v.verified && <Button size="sm">Verify</Button>}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
