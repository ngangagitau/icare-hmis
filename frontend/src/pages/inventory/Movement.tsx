import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const movements = [
  { date: "2024-03-10 10:30", item: "Surgical Gloves (Box)", type: "Issue", from: "Main Store", to: "Theater", qty: 10, by: "Njeri" },
  { date: "2024-03-10 09:15", item: "Amoxicillin 500mg", type: "Receipt", from: "MediSupply Ltd", to: "Pharmacy", qty: 500, by: "Otieno" },
  { date: "2024-03-09 16:00", item: "IV Giving Sets", type: "Issue", from: "Main Store", to: "Ward A", qty: 15, by: "Njeri" },
  { date: "2024-03-09 14:30", item: "Paracetamol 500mg", type: "Sale", from: "Pharmacy", to: "Patient", qty: 20, by: "Pharmacist" },
  { date: "2024-03-09 11:00", item: "Gauze Pads", type: "Transfer", from: "Main Store", to: "Triage", qty: 20, by: "Otieno" },
];

const typeColor: Record<string, string> = { Issue: "bg-warning/10 text-warning", Receipt: "bg-success/10 text-success", Sale: "bg-primary/10 text-primary", Transfer: "bg-accent text-accent-foreground" };

export default function MovementReport() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Movement Report</h1><p className="text-muted-foreground text-sm">Track all inventory movements and transactions</p></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Date/Time</TableHead><TableHead>Item</TableHead><TableHead>Type</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Qty</TableHead><TableHead>By</TableHead></TableRow></TableHeader>
          <TableBody>{movements.map((m, i) => (
            <TableRow key={i}><TableCell className="text-sm">{m.date}</TableCell><TableCell className="font-medium">{m.item}</TableCell><TableCell><Badge className={typeColor[m.type]}>{m.type}</Badge></TableCell><TableCell>{m.from}</TableCell><TableCell>{m.to}</TableCell><TableCell>{m.qty}</TableCell><TableCell>{m.by}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
