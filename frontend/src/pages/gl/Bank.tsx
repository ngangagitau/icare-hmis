import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const transactions = [
  { date: "2024-03-10", ref: "DEP-001", description: "M-Pesa collections", bank: 34420, statement: 34420, matched: true },
  { date: "2024-03-09", ref: "CHQ-045", description: "Supplier payment - MediSupply", bank: -125000, statement: -125000, matched: true },
  { date: "2024-03-08", ref: "DEP-002", description: "Insurance payment - AAR", bank: 200000, statement: 200000, matched: true },
  { date: "2024-03-07", ref: "CHQ-046", description: "Salary payment", bank: -850000, statement: -850000, matched: true },
  { date: "2024-03-06", ref: "", description: "Bank charges", bank: 0, statement: -1500, matched: false },
];

export default function BankReconciliation() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Bank Reconciliation</h1><p className="text-muted-foreground text-sm">Reconcile bank statements with ledger entries</p></div>
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center"><p className="text-xl font-bold">KES 2,500,000</p><p className="text-sm text-muted-foreground">Book Balance</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-xl font-bold">KES 2,498,500</p><p className="text-sm text-muted-foreground">Bank Statement</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><p className="text-xl font-bold text-destructive">KES 1,500</p><p className="text-sm text-muted-foreground">Difference</p></CardContent></Card>
      </div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Ref</TableHead><TableHead>Description</TableHead><TableHead className="text-right">Book (KES)</TableHead><TableHead className="text-right">Statement (KES)</TableHead><TableHead>Matched</TableHead></TableRow></TableHeader>
          <TableBody>{transactions.map((t, i) => (
            <TableRow key={i}><TableCell>{t.date}</TableCell><TableCell className="font-mono">{t.ref || "—"}</TableCell><TableCell>{t.description}</TableCell><TableCell className="text-right">{t.bank !== 0 ? t.bank.toLocaleString() : "—"}</TableCell><TableCell className="text-right">{t.statement.toLocaleString()}</TableCell><TableCell><Badge variant={t.matched ? "default" : "destructive"}>{t.matched ? "✓" : "✗"}</Badge></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
