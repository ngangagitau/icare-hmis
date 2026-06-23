import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Insurance = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Pre-Authorization</h1>
      <p className="text-muted-foreground text-sm">Submit insurance pre-authorization requests</p>
    </div>
    <Card>
      <CardHeader><CardTitle>New Pre-Auth Request</CardTitle></CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("Pre-auth request submitted"); }}>
          <div className="space-y-2"><Label>Patient Name / ID</Label><Input placeholder="Search patient..." /></div>
          <div className="space-y-2"><Label>Member Number</Label><Input placeholder="Insurance member no." /></div>
          <div className="space-y-2"><Label>Insurance Company</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select insurer" /></SelectTrigger>
              <SelectContent>{["SHA (Social Health Authority)", "AAR", "Jubilee", "Britam", "UAP", "CIC", "Madison", "NHIF Legacy"].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Scheme / Plan</Label><Input placeholder="e.g., Gold, Silver, Corporate" /></div>
          <div className="space-y-2"><Label>Diagnosis (ICD-10)</Label><Input placeholder="e.g., J06.9 - Upper respiratory infection" /></div>
          <div className="space-y-2"><Label>Admission Type</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["Outpatient", "Inpatient", "Day Case", "Maternity", "Dental", "Optical"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Estimated Cost (KES)</Label><Input type="number" placeholder="50000" /></div>
          <div className="space-y-2"><Label>Expected Length of Stay</Label><Input placeholder="e.g., 3 days" /></div>
          <div className="md:col-span-2 space-y-2"><Label>Clinical Justification</Label><Textarea placeholder="Reason for admission and services required..." /></div>
          <div className="md:col-span-2 space-y-2"><Label>Services Requested</Label><Textarea placeholder="List of procedures, investigations, medications..." /></div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">Submit Pre-Auth</Button>
            <Button type="button" variant="outline">Save Draft</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default Insurance;
