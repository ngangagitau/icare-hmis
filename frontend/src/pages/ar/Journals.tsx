import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ARJournals() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Journal Vouchers</h1><p className="text-muted-foreground text-sm">Create journal vouchers for AR adjustments</p></div>
      <Card><CardHeader><CardTitle className="text-base">New Journal Voucher</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Voucher Date</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>Reference</Label><Input placeholder="Ref number" /></div>
          <div className="space-y-2"><Label>Type</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="credit">Credit Memo</SelectItem><SelectItem value="debit">Debit Memo</SelectItem><SelectItem value="write-off">Write-off</SelectItem></SelectContent></Select></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Debit Account</Label><Input placeholder="Account code" /></div>
          <div className="space-y-2"><Label>Credit Account</Label><Input placeholder="Account code" /></div>
          <div className="space-y-2"><Label>Amount (KES)</Label><Input type="number" placeholder="0" /></div>
        </div>
        <div className="space-y-2"><Label>Narration</Label><Textarea placeholder="Journal description..." /></div>
        <Button onClick={() => toast.success("Journal voucher created!")}>Create Voucher</Button>
      </CardContent></Card>
    </div>
  );
}
