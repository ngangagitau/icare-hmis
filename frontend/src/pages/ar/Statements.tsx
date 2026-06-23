import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statements = [
  { client: "AAR Insurance", invoices: 12, total: 850000, paid: 620000, balance: 230000, lastPayment: "2024-03-05" },
  { client: "Jubilee Insurance", invoices: 8, total: 520000, paid: 520000, balance: 0, lastPayment: "2024-03-08" },
  { client: "NHIF/SHA", invoices: 45, total: 1200000, paid: 950000, balance: 250000, lastPayment: "2024-02-28" },
  { client: "Safaricom Ltd (Corp)", invoices: 5, total: 180000, paid: 100000, balance: 80000, lastPayment: "2024-03-01" },
];

export default function ARStatements() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Statements</h1><p className="text-muted-foreground text-sm">Client account statements and balances</p></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Client</TableHead><TableHead>Invoices</TableHead><TableHead>Total (KES)</TableHead><TableHead>Paid (KES)</TableHead><TableHead>Balance (KES)</TableHead><TableHead>Last Payment</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>{statements.map(s => (
            <TableRow key={s.client}><TableCell className="font-medium">{s.client}</TableCell><TableCell>{s.invoices}</TableCell><TableCell>{s.total.toLocaleString()}</TableCell><TableCell>{s.paid.toLocaleString()}</TableCell><TableCell className={s.balance > 0 ? "font-bold text-destructive" : "text-success font-bold"}>{s.balance.toLocaleString()}</TableCell><TableCell>{s.lastPayment}</TableCell><TableCell><Button size="sm" variant="outline">View</Button></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
