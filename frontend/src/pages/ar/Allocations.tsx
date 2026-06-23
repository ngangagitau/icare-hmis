import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const allocations = [
  { id: "ALL-001", client: "AAR Insurance", payment: 200000, invoice: "INV-2024-045", allocated: 200000, date: "2024-03-05" },
  { id: "ALL-002", client: "NHIF/SHA", payment: 350000, invoice: "INV-2024-038", allocated: 350000, date: "2024-02-28" },
  { id: "ALL-003", client: "Safaricom Ltd", payment: 100000, invoice: "INV-2024-052", allocated: 80000, date: "2024-03-01" },
];

export default function ARAllocations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">Invoice Allocations</h1><p className="text-muted-foreground text-sm">Allocate payments to invoices</p></div><Button>New Allocation</Button></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Client</TableHead><TableHead>Payment (KES)</TableHead><TableHead>Invoice</TableHead><TableHead>Allocated (KES)</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
          <TableBody>{allocations.map(a => (
            <TableRow key={a.id}><TableCell className="font-mono">{a.id}</TableCell><TableCell className="font-medium">{a.client}</TableCell><TableCell>{a.payment.toLocaleString()}</TableCell><TableCell>{a.invoice}</TableCell><TableCell>{a.allocated.toLocaleString()}</TableCell><TableCell>{a.date}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
