import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const payables = [
  { id: "AP-001", supplier: "MediSupply Ltd", invoice: "MS-INV-2024-089", amount: 125000, due: "2024-04-08", status: "Unpaid" },
  { id: "AP-002", supplier: "PharmaCo East", invoice: "PC-INV-2024-045", amount: 85000, due: "2024-04-24", status: "Unpaid" },
  { id: "AP-003", supplier: "SurgicalTools Ltd", invoice: "ST-INV-2024-012", amount: 38000, due: "2024-03-15", status: "Overdue" },
  { id: "AP-004", supplier: "LabEquip Kenya", invoice: "LE-INV-2024-007", amount: 450000, due: "2024-04-10", status: "Partial" },
];

const statusColor: Record<string, string> = { Unpaid: "bg-warning/10 text-warning", Overdue: "bg-destructive/10 text-destructive", Partial: "bg-primary/10 text-primary", Paid: "bg-success/10 text-success" };

export default function Payables() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">Accounts Payable</h1><p className="text-muted-foreground text-sm">Track supplier invoices and payment obligations</p></div><Button>Record Payment</Button></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Supplier</TableHead><TableHead>Invoice</TableHead><TableHead>Amount (KES)</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{payables.map(p => (
            <TableRow key={p.id}><TableCell className="font-mono">{p.id}</TableCell><TableCell className="font-medium">{p.supplier}</TableCell><TableCell>{p.invoice}</TableCell><TableCell>{p.amount.toLocaleString()}</TableCell><TableCell>{p.due}</TableCell><TableCell><Badge className={statusColor[p.status]}>{p.status}</Badge></TableCell><TableCell><Button size="sm" variant="outline">Pay</Button></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
