import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AssetDisposal() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Asset Disposal</h1><p className="text-muted-foreground text-sm">Record asset disposals and write-offs</p></div>
      <Card><CardHeader><CardTitle className="text-base">Dispose Asset</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Asset</Label><Select><SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger><SelectContent><SelectItem value="FA-003">FA-003 — Server Equipment</SelectItem><SelectItem value="FA-005">FA-005 — Office Furniture</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Disposal Method</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="sale">Sale</SelectItem><SelectItem value="writeoff">Write-Off</SelectItem><SelectItem value="donation">Donation</SelectItem></SelectContent></Select></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Disposal Date</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>Sale Price (KES)</Label><Input type="number" placeholder="0" /></div>
          <div className="space-y-2"><Label>Buyer / Recipient</Label><Input placeholder="Name" /></div>
        </div>
        <div className="space-y-2"><Label>Reason</Label><Textarea placeholder="Reason for disposal..." /></div>
        <Button onClick={() => toast.success("Asset disposal recorded!")}>Process Disposal</Button>
      </CardContent></Card>
    </div>
  );
}
