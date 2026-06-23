import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const items = [
  { service: "Consultation Fee", qty: 1, rate: 1500, total: 1500 },
  { service: "CBC Test", qty: 1, rate: 800, total: 800 },
  { service: "Amoxicillin 500mg x21", qty: 1, rate: 420, total: 420 },
];

export default function NewInvoice() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">New Invoice</h1><p className="text-muted-foreground text-sm">Generate invoice for patient services</p></div>
      <Card>
        <CardHeader><CardTitle className="text-base">Invoice Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Patient</Label><Select><SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger><SelectContent><SelectItem value="P-10001">John Mwangi</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Payment Mode</Label><Select><SelectTrigger><SelectValue placeholder="Mode" /></SelectTrigger><SelectContent><SelectItem value="cash">Cash</SelectItem><SelectItem value="insurance">Insurance</SelectItem><SelectItem value="mpesa">M-Pesa</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Invoice Date</Label><Input type="date" defaultValue="2024-03-10" /></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Line Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Qty</TableHead><TableHead>Rate (KES)</TableHead><TableHead>Total (KES)</TableHead></TableRow></TableHeader>
            <TableBody>
              {items.map((it, i) => <TableRow key={i}><TableCell>{it.service}</TableCell><TableCell>{it.qty}</TableCell><TableCell>{it.rate.toLocaleString()}</TableCell><TableCell className="font-medium">{it.total.toLocaleString()}</TableCell></TableRow>)}
              <TableRow className="bg-muted/50"><TableCell colSpan={3} className="font-semibold text-right">Total</TableCell><TableCell className="font-bold">KES {items.reduce((s, i) => s + i.total, 0).toLocaleString()}</TableCell></TableRow>
            </TableBody>
          </Table>
          <div className="flex gap-3 justify-end mt-4"><Button variant="outline">Add Item</Button><Button onClick={() => toast.success("Invoice generated!")}>Generate Invoice</Button></div>
        </CardContent>
      </Card>
    </div>
  );
}
