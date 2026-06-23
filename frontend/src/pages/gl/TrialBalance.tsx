import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const accounts = [
  { code: "1000", name: "Cash & Bank", debit: 2500000, credit: 0 },
  { code: "1100", name: "Accounts Receivable", debit: 560000, credit: 0 },
  { code: "1200", name: "Inventory", debit: 1800000, credit: 0 },
  { code: "1300", name: "Prepaid Expenses", debit: 120000, credit: 0 },
  { code: "2000", name: "Accounts Payable", debit: 0, credit: 698000 },
  { code: "2100", name: "Salaries Payable", debit: 0, credit: 850000 },
  { code: "3000", name: "Capital", debit: 0, credit: 2000000 },
  { code: "3100", name: "Retained Earnings", debit: 0, credit: 1432000 },
  { code: "4000", name: "Revenue", debit: 0, credit: 3200000 },
  { code: "5000", name: "Operating Expenses", debit: 2800000, credit: 0 },
  { code: "5100", name: "Depreciation Expense", debit: 400000, credit: 0 },
];

export default function TrialBalance() {
  const totalDebit = accounts.reduce((s, a) => s + a.debit, 0);
  const totalCredit = accounts.reduce((s, a) => s + a.credit, 0);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Trial Balance</h1><p className="text-muted-foreground text-sm">As at March 10, 2024</p></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Account Name</TableHead><TableHead className="text-right">Debit (KES)</TableHead><TableHead className="text-right">Credit (KES)</TableHead></TableRow></TableHeader>
          <TableBody>
            {accounts.map(a => <TableRow key={a.code}><TableCell className="font-mono">{a.code}</TableCell><TableCell className="font-medium">{a.name}</TableCell><TableCell className="text-right">{a.debit > 0 ? a.debit.toLocaleString() : "—"}</TableCell><TableCell className="text-right">{a.credit > 0 ? a.credit.toLocaleString() : "—"}</TableCell></TableRow>)}
            <TableRow className="bg-muted/50 font-bold"><TableCell colSpan={2}>Total</TableCell><TableCell className="text-right">{totalDebit.toLocaleString()}</TableCell><TableCell className="text-right">{totalCredit.toLocaleString()}</TableCell></TableRow>
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
