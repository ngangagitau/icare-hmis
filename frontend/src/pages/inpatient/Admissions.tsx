import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Admissions() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Admissions</h1><p className="text-muted-foreground text-sm">Admit patients to wards</p></div>
      <Card><CardHeader><CardTitle className="text-base">Admission Form</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Patient</Label><Select><SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger><SelectContent><SelectItem value="P-10001">John Mwangi</SelectItem><SelectItem value="P-10005">Samuel Kipchoge</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Admitting Doctor</Label><Select><SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger><SelectContent><SelectItem value="dr1">Dr. Kamau</SelectItem><SelectItem value="dr2">Dr. Ouma</SelectItem></SelectContent></Select></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2"><Label>Ward</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="a">Ward A (General)</SelectItem><SelectItem value="b">Ward B (Surgical)</SelectItem><SelectItem value="c">Ward C (Maternity)</SelectItem><SelectItem value="icu">ICU</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Bed</Label><Select><SelectTrigger><SelectValue placeholder="Select bed" /></SelectTrigger><SelectContent><SelectItem value="b1">Bed A-01</SelectItem><SelectItem value="b2">Bed A-02</SelectItem><SelectItem value="b3">Bed A-05</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Admission Date</Label><Input type="date" /></div>
        </div>
        <div className="space-y-2"><Label>Reason for Admission</Label><Textarea placeholder="Clinical reason..." /></div>
        <Button onClick={() => toast.success("Patient admitted successfully!")}>Admit Patient</Button>
      </CardContent></Card>
    </div>
  );
}
