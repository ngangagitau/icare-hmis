import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const payments = [
  { id: "PAY-001", patient: "John Mwangi", invoice: "INV-0891", amount: 2720, method: "M-Pesa", ref: "QKR3F7H2", date: "2024-03-10", status: "Completed" },
  { id: "PAY-002", patient: "Mary Achieng", invoice: "INV-0892", amount: 15000, method: "Insurance", ref: "AAR-2024-456", date: "2024-03-10", status: "Pending" },
  { id: "PAY-003", patient: "Peter Odhiambo", invoice: "INV-0893", amount: 5200, method: "Cash", ref: "RCP-0893", date: "2024-03-10", status: "Completed" },
  { id: "PAY-004", patient: "Grace Njeri", invoice: "INV-0894", amount: 3500, method: "Visa", ref: "VIS-8834", date: "2024-03-09", status: "Completed" },
  { id: "PAY-005", patient: "Samuel Kipchoge", invoice: "INV-0895", amount: 8000, method: "M-Pesa", ref: "QKR3G9J1", date: "2024-03-09", status: "Partial" },
];

const statusColor: Record<string, string> = { Completed: "bg-success/10 text-success", Pending: "bg-warning/10 text-warning", Partial: "bg-primary/10 text-primary" };

export default function Payments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">Payments</h1><p className="text-muted-foreground text-sm">Process and track all payment transactions</p></div><Button>Record Payment</Button></div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-foreground">KES 34,420</p><p className="text-sm text-muted-foreground">Today's Collections</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-warning">KES 15,000</p><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-2xl font-bold text-success">5</p><p className="text-sm text-muted-foreground">Transactions</p></CardContent></Card>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Payment ID</TableHead><TableHead>Patient</TableHead><TableHead>Invoice</TableHead><TableHead>Amount (KES)</TableHead><TableHead>Method</TableHead><TableHead>Reference</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{payments.map(p => (
              <TableRow key={p.id}><TableCell className="font-mono">{p.id}</TableCell><TableCell className="font-medium">{p.patient}</TableCell><TableCell>{p.invoice}</TableCell><TableCell>{p.amount.toLocaleString()}</TableCell><TableCell>{p.method}</TableCell><TableCell className="font-mono text-xs">{p.ref}</TableCell><TableCell><Badge className={statusColor[p.status]}>{p.status}</Badge></TableCell></TableRow>
            ))}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
