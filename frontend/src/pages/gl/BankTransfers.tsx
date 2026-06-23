import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function BankTransfers() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Inter-Bank Transfers</h1><p className="text-muted-foreground text-sm">Transfer funds between bank accounts</p></div>
      <Card><CardHeader><CardTitle className="text-base">New Transfer</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>From Account</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="kcb">KCB Main Account</SelectItem><SelectItem value="equity">Equity Operations</SelectItem><SelectItem value="coop">Co-op Payroll</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>To Account</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="kcb">KCB Main Account</SelectItem><SelectItem value="equity">Equity Operations</SelectItem><SelectItem value="coop">Co-op Payroll</SelectItem></SelectContent></Select></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Amount (KES)</Label><Input type="number" placeholder="0" /></div>
          <div className="space-y-2"><Label>Transfer Date</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>Reference</Label><Input placeholder="Transfer ref" /></div>
        </div>
        <Button onClick={() => toast.success("Transfer recorded!")}>Process Transfer</Button>
      </CardContent></Card>
    </div>
  );
}
