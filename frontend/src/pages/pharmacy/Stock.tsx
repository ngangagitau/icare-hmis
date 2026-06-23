import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const stock = [
  { code: "PH-001", drug: "Amoxicillin 500mg Caps", category: "Antibiotics", qty: 2500, reorder: 500, unit: "Caps", status: "OK" },
  { code: "PH-002", drug: "Paracetamol 500mg Tabs", category: "Analgesics", qty: 5000, reorder: 1000, unit: "Tabs", status: "OK" },
  { code: "PH-003", drug: "Metformin 500mg Tabs", category: "Antidiabetics", qty: 180, reorder: 500, unit: "Tabs", status: "Low" },
  { code: "PH-004", drug: "Amlodipine 5mg Tabs", category: "Antihypertensives", qty: 45, reorder: 200, unit: "Tabs", status: "Critical" },
  { code: "PH-005", drug: "Omeprazole 20mg Caps", category: "GI Drugs", qty: 800, reorder: 300, unit: "Caps", status: "OK" },
];

const statusColor: Record<string, string> = { OK: "bg-success/10 text-success", Low: "bg-warning/10 text-warning", Critical: "bg-destructive/10 text-destructive" };

export default function PharmacyStock() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-heading font-bold text-foreground">Stock Control</h1><p className="text-muted-foreground text-sm">Pharmacy inventory management and reorder alerts</p></div><Button>Stock Adjustment</Button></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Drug</TableHead><TableHead>Category</TableHead><TableHead>In Stock</TableHead><TableHead>Reorder Level</TableHead><TableHead>Unit</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>{stock.map(s => (
            <TableRow key={s.code}><TableCell className="font-mono">{s.code}</TableCell><TableCell className="font-medium">{s.drug}</TableCell><TableCell>{s.category}</TableCell><TableCell>{s.qty.toLocaleString()}</TableCell><TableCell>{s.reorder}</TableCell><TableCell>{s.unit}</TableCell><TableCell><Badge className={statusColor[s.status]}>{s.status}</Badge></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
