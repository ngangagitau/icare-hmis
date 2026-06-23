import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const entries = [
  { id: "JE-001", date: "2024-03-10", description: "Monthly depreciation", debit: "Depreciation Expense", credit: "Accumulated Depreciation", amount: 45000 },
  { id: "JE-002", date: "2024-03-09", description: "Salary accrual", debit: "Salary Expense", credit: "Salaries Payable", amount: 850000 },
  { id: "JE-003", date: "2024-03-08", description: "Insurance premium", debit: "Prepaid Insurance", credit: "Bank Account", amount: 120000 },
];

export default function GLJournals() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">Journal Entries</h1><p className="text-muted-foreground text-sm">Create and manage general ledger journal entries</p></div><Button>New Entry</Button></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Debit Account</TableHead><TableHead>Credit Account</TableHead><TableHead>Amount (KES)</TableHead></TableRow></TableHeader>
          <TableBody>{entries.map(e => (
            <TableRow key={e.id}><TableCell className="font-mono">{e.id}</TableCell><TableCell>{e.date}</TableCell><TableCell className="font-medium">{e.description}</TableCell><TableCell>{e.debit}</TableCell><TableCell>{e.credit}</TableCell><TableCell>{e.amount.toLocaleString()}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
