import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function GoodsReceipt() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Goods Receipt</h1><p className="text-muted-foreground text-sm">Receive and record incoming stock deliveries</p></div>
      <Card><CardHeader><CardTitle className="text-base">Receipt Details</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2"><Label>LPO Reference</Label><Select><SelectTrigger><SelectValue placeholder="Select LPO" /></SelectTrigger><SelectContent><SelectItem value="LPO-001">LPO-001 — MediSupply Ltd</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Delivery Note No.</Label><Input placeholder="DN number" /></div>
          <div className="space-y-2"><Label>Receipt Date</Label><Input type="date" /></div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2"><Label>Item</Label><Input placeholder="Item name" /></div>
          <div className="space-y-2"><Label>Qty Ordered</Label><Input type="number" placeholder="0" /></div>
          <div className="space-y-2"><Label>Qty Received</Label><Input type="number" placeholder="0" /></div>
          <div className="space-y-2"><Label>Batch No.</Label><Input placeholder="Batch" /></div>
        </div>
        <div className="flex gap-3"><Button variant="outline">Add Line</Button><Button onClick={() => toast.success("Goods receipt recorded!")}>Save Receipt</Button></div>
      </CardContent></Card>
    </div>
  );
}
