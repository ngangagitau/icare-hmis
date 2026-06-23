import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const assets = [
  { code: "FA-001", name: "X-Ray Machine", cost: 5000000, accDep: 1500000, nbv: 3500000, rate: "10%", method: "Straight Line" },
  { code: "FA-002", name: "Ultrasound Scanner", cost: 3000000, accDep: 600000, nbv: 2400000, rate: "10%", method: "Straight Line" },
  { code: "FA-003", name: "Server Equipment", cost: 800000, accDep: 480000, nbv: 320000, rate: "20%", method: "Reducing Balance" },
  { code: "FA-004", name: "Hospital Van", cost: 4500000, accDep: 2250000, nbv: 2250000, rate: "25%", method: "Reducing Balance" },
  { code: "FA-005", name: "Office Furniture", cost: 500000, accDep: 200000, nbv: 300000, rate: "12.5%", method: "Straight Line" },
];

export default function Depreciation() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Depreciation Schedule</h1><p className="text-muted-foreground text-sm">Asset depreciation and net book values</p></div>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Asset</TableHead><TableHead className="text-right">Cost (KES)</TableHead><TableHead className="text-right">Acc. Depreciation</TableHead><TableHead className="text-right">NBV (KES)</TableHead><TableHead>Rate</TableHead><TableHead>Method</TableHead></TableRow></TableHeader>
          <TableBody>
            {assets.map(a => <TableRow key={a.code}><TableCell className="font-mono">{a.code}</TableCell><TableCell className="font-medium">{a.name}</TableCell><TableCell className="text-right">{a.cost.toLocaleString()}</TableCell><TableCell className="text-right">{a.accDep.toLocaleString()}</TableCell><TableCell className="text-right font-bold">{a.nbv.toLocaleString()}</TableCell><TableCell>{a.rate}</TableCell><TableCell>{a.method}</TableCell></TableRow>)}
            <TableRow className="bg-muted/50 font-bold"><TableCell colSpan={2}>Total</TableCell><TableCell className="text-right">{assets.reduce((s, a) => s + a.cost, 0).toLocaleString()}</TableCell><TableCell className="text-right">{assets.reduce((s, a) => s + a.accDep, 0).toLocaleString()}</TableCell><TableCell className="text-right">{assets.reduce((s, a) => s + a.nbv, 0).toLocaleString()}</TableCell><TableCell colSpan={2}></TableCell></TableRow>
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
