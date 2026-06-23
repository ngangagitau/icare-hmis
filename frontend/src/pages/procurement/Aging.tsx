import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const aging = [
  { supplier: "MediSupply Ltd", current: 0, days30: 125000, days60: 0, days90: 0, over90: 0, total: 125000 },
  { supplier: "PharmaCo East", current: 85000, days30: 0, days60: 0, days90: 0, over90: 0, total: 85000 },
  { supplier: "SurgicalTools Ltd", current: 0, days30: 0, days60: 38000, days90: 0, over90: 0, total: 38000 },
  { supplier: "LabEquip Kenya", current: 450000, days30: 0, days60: 0, days90: 0, over90: 0, total: 450000 },
];

export default function AgingAnalysis() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Aging Analysis</h1><p className="text-muted-foreground text-sm">Accounts payable aging report</p></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Supplier</TableHead><TableHead>Current</TableHead><TableHead>1-30 Days</TableHead><TableHead>31-60 Days</TableHead><TableHead>61-90 Days</TableHead><TableHead>Over 90</TableHead><TableHead>Total (KES)</TableHead></TableRow></TableHeader>
          <TableBody>
            {aging.map(a => (
              <TableRow key={a.supplier}><TableCell className="font-medium">{a.supplier}</TableCell>{[a.current, a.days30, a.days60, a.days90, a.over90].map((v, i) => <TableCell key={i} className={v > 0 && i >= 2 ? "text-destructive font-medium" : ""}>{v > 0 ? v.toLocaleString() : "—"}</TableCell>)}<TableCell className="font-bold">{a.total.toLocaleString()}</TableCell></TableRow>
            ))}
            <TableRow className="bg-muted/50 font-bold"><TableCell>Total</TableCell>{[535000, 125000, 38000, 0, 0].map((v, i) => <TableCell key={i}>{v > 0 ? v.toLocaleString() : "—"}</TableCell>)}<TableCell>698,000</TableCell></TableRow>
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
