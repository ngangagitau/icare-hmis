import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const PreOp = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Pre-Op Assessment</h1>
      <p className="text-muted-foreground text-sm">Pre-operative evaluation checklist</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Assessment Checklist</CardTitle></CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); toast.success("Pre-op assessment completed"); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Patient</Label><Input placeholder="Search patient..." /></div>
            <div className="space-y-2"><Label>ASA Classification</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select ASA class" /></SelectTrigger>
                <SelectContent>{["ASA I - Healthy", "ASA II - Mild systemic disease", "ASA III - Severe systemic disease", "ASA IV - Life-threatening", "ASA V - Moribund"].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>NPO Status (Fasting hours)</Label><Input type="number" placeholder="6" /></div>
            <div className="space-y-2"><Label>Blood Group</Label>
              <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-base font-semibold">Pre-Op Checklist</Label>
            {["Consent form signed", "Site marking done", "Blood cross-matched", "IV access secured", "Pre-op labs reviewed (CBC, Renal, Coag)", "ECG reviewed", "Chest X-ray reviewed", "Allergies documented", "Current medications reviewed", "Dentures/jewelry removed", "Patient identity verified (wristband)"].map(item => (
              <div key={item} className="flex items-center gap-2">
                <Checkbox id={item} /><label htmlFor={item} className="text-sm">{item}</label>
              </div>
            ))}
          </div>
          <div className="space-y-2"><Label>Anaesthetic Plan Notes</Label><Textarea placeholder="Notes on airway, anticipated difficulties..." /></div>
          <div className="flex gap-3">
            <Button type="submit">Complete Assessment</Button>
            <Button type="button" variant="outline">Flag Issue</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default PreOp;
