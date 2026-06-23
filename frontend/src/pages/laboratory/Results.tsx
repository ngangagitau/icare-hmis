import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function LabResults() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-heading font-bold text-foreground">Results Entry</h1><p className="text-muted-foreground text-sm">Enter and validate lab test results</p></div>
      <Card>
        <CardHeader><CardTitle className="text-base">Test Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Sample ID</Label><Select><SelectTrigger><SelectValue placeholder="Select sample" /></SelectTrigger><SelectContent><SelectItem value="SAM-001">SAM-001 — John Mwangi (CBC)</SelectItem><SelectItem value="SAM-003">SAM-003 — Peter Odhiambo (LFT)</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Technician</Label><Input value="Tech Otieno" readOnly className="bg-muted" /></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">CBC Results</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[["WBC (×10³/µL)", "4.5-11.0"], ["RBC (×10⁶/µL)", "4.5-5.5"], ["Hemoglobin (g/dL)", "13.5-17.5"], ["Hematocrit (%)", "40-54"], ["Platelets (×10³/µL)", "150-400"], ["MCV (fL)", "80-100"], ["MCH (pg)", "27-33"], ["MCHC (g/dL)", "32-36"], ["Neutrophils (%)", "40-70"], ["Lymphocytes (%)", "20-40"]].map(([label, ref]) => (
              <div key={label} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Input placeholder={`Ref: ${ref}`} />
              </div>
            ))}
          </div>
          <div className="space-y-2 mt-4"><Label>Comments</Label><Textarea placeholder="Additional notes or observations..." /></div>
        </CardContent>
      </Card>
      <div className="flex gap-3 justify-end"><Button variant="outline">Save Draft</Button><Button onClick={() => toast.success("Results published!")}>Publish Results</Button></div>
    </div>
  );
}
