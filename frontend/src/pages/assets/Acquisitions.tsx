import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AssetAcquisitions() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Asset Acquisitions</h1><p className="text-muted-foreground text-sm">Record new asset purchases</p></div>
      <Card><CardHeader><CardTitle className="text-base">New Asset</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Asset Name</Label><Input placeholder="e.g., X-Ray Machine" /></div>
          <div className="space-y-2"><Label>Category</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="med">Medical Equipment</SelectItem><SelectItem value="it">IT Equipment</SelectItem><SelectItem value="furniture">Furniture</SelectItem><SelectItem value="vehicle">Vehicles</SelectItem></SelectContent></Select></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Purchase Price (KES)</Label><Input type="number" placeholder="0" /></div>
          <div className="space-y-2"><Label>Purchase Date</Label><Input type="date" /></div>
          <div className="space-y-2"><Label>Useful Life (Years)</Label><Input type="number" placeholder="e.g., 10" /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Serial Number</Label><Input placeholder="Serial no." /></div>
          <div className="space-y-2"><Label>Location</Label><Input placeholder="e.g., Radiology Dept" /></div>
        </div>
        <Button onClick={() => toast.success("Asset recorded!")}>Record Asset</Button>
      </CardContent></Card>
    </div>
  );
}
