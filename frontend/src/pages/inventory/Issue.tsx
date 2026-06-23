import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const recent = [
  { id: "ISS-001", item: "Surgical Gloves (Box)", to: "Theater", qty: 10, date: "2024-03-10", by: "Store Keeper Njeri" },
  { id: "ISS-002", item: "Gauze Pads (Pack)", to: "Triage", qty: 20, date: "2024-03-10", by: "Store Keeper Njeri" },
  { id: "ISS-003", item: "IV Giving Sets", to: "Ward A", qty: 15, date: "2024-03-09", by: "Store Keeper Otieno" },
];

export default function Issuance() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Stock Issuance</h1><p className="text-muted-foreground text-sm">Issue stock to departments</p></div>
      <Card><CardHeader><CardTitle className="text-base">Issue Stock</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Item</Label><Input placeholder="Search item..." /></div>
          <div className="space-y-2"><Label>Department</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="triage">Triage</SelectItem><SelectItem value="theater">Theater</SelectItem><SelectItem value="wardA">Ward A</SelectItem><SelectItem value="pharmacy">Pharmacy</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Quantity</Label><Input type="number" placeholder="0" /></div>
        </div>
        <Button onClick={() => toast.success("Stock issued!")}>Issue</Button>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Recent Issuances</CardTitle></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Item</TableHead><TableHead>To</TableHead><TableHead>Qty</TableHead><TableHead>Date</TableHead><TableHead>By</TableHead></TableRow></TableHeader>
          <TableBody>{recent.map(r => <TableRow key={r.id}><TableCell className="font-mono">{r.id}</TableCell><TableCell>{r.item}</TableCell><TableCell>{r.to}</TableCell><TableCell>{r.qty}</TableCell><TableCell>{r.date}</TableCell><TableCell>{r.by}</TableCell></TableRow>)}</TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
