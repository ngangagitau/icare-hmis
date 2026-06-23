import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const receipts = [
  { id: "RCP-001", patient: "John Mwangi", invoice: "INV-0891", amount: 2720, method: "M-Pesa", date: "2024-03-10 10:30" },
  { id: "RCP-002", patient: "Peter Odhiambo", invoice: "INV-0893", amount: 5200, method: "Cash", date: "2024-03-10 11:15" },
  { id: "RCP-003", patient: "Grace Njeri", invoice: "INV-0894", amount: 3500, method: "Visa", date: "2024-03-09 14:20" },
  { id: "RCP-004", patient: "David Mutua", invoice: "INV-0888", amount: 1800, method: "Cash", date: "2024-03-09 09:45" },
];

export default function Receipts() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Receipts</h1><p className="text-muted-foreground text-sm">View and print payment receipts</p></div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader><TableRow><TableHead>Receipt No</TableHead><TableHead>Patient</TableHead><TableHead>Invoice</TableHead><TableHead>Amount (KES)</TableHead><TableHead>Method</TableHead><TableHead>Date/Time</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
            <TableBody>{receipts.map(r => (
              <TableRow key={r.id}><TableCell className="font-mono">{r.id}</TableCell><TableCell className="font-medium">{r.patient}</TableCell><TableCell>{r.invoice}</TableCell><TableCell>{r.amount.toLocaleString()}</TableCell><TableCell>{r.method}</TableCell><TableCell className="text-sm">{r.date}</TableCell><TableCell><Button size="sm" variant="outline"><Printer className="h-3 w-3 mr-1" />Print</Button></TableCell></TableRow>
            ))}</TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
