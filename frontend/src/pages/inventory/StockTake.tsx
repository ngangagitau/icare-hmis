import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const items = [
  { code: "INV-001", item: "Surgical Gloves (Box)", system: 150, physical: 148, variance: -2, status: "Minor" },
  { code: "INV-002", item: "Gauze Pads (Pack)", system: 200, physical: 200, variance: 0, status: "OK" },
  { code: "INV-003", item: "IV Giving Sets", system: 85, physical: 80, variance: -5, status: "Significant" },
  { code: "INV-004", item: "Syringes 5ml (Box)", system: 300, physical: 302, variance: 2, status: "Minor" },
];

const statusColor: Record<string, string> = { OK: "bg-success/10 text-success", Minor: "bg-warning/10 text-warning", Significant: "bg-destructive/10 text-destructive" };

export default function StockTake() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">Stock Take</h1><p className="text-muted-foreground text-sm">Conduct physical stock count and reconcile</p></div><Button>Start New Count</Button></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Item</TableHead><TableHead>System Qty</TableHead><TableHead>Physical Qty</TableHead><TableHead>Variance</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{items.map(i => (
            <TableRow key={i.code}><TableCell className="font-mono">{i.code}</TableCell><TableCell className="font-medium">{i.item}</TableCell><TableCell>{i.system}</TableCell><TableCell><Input type="number" defaultValue={i.physical} className="w-20 h-8" /></TableCell><TableCell className={i.variance !== 0 ? "font-medium text-destructive" : ""}>{i.variance}</TableCell><TableCell><Badge className={statusColor[i.status]}>{i.status}</Badge></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
