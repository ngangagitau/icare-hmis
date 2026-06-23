import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const EmergencyTriage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Emergency Triage Assessment</h1>
      <p className="text-muted-foreground text-sm">Rapid patient assessment using South African Triage Scale (SATS)</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Patient Assessment</CardTitle></CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("Triage assessment saved"); }}>
          <div className="space-y-2"><Label>Patient Name / ID</Label><Input placeholder="Search or enter patient..." /></div>
          <div className="space-y-2"><Label>Age</Label><Input type="number" placeholder="Age" /></div>
          <div className="space-y-2"><Label>Arrival Mode</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["Walk-in", "Ambulance", "Police", "Referral", "Self-referral"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Triage Category</Label>
            <Select><SelectTrigger><SelectValue placeholder="Assign priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="red">🔴 Red - Immediate (Resuscitation)</SelectItem>
                <SelectItem value="orange">🟠 Orange - Very Urgent (&lt;10 min)</SelectItem>
                <SelectItem value="yellow">🟡 Yellow - Urgent (&lt;60 min)</SelectItem>
                <SelectItem value="green">🟢 Green - Standard (&lt;240 min)</SelectItem>
                <SelectItem value="blue">🔵 Blue - Dead on Arrival</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Blood Pressure (mmHg)</Label><Input placeholder="120/80" /></div>
          <div className="space-y-2"><Label>Heart Rate (bpm)</Label><Input type="number" placeholder="72" /></div>
          <div className="space-y-2"><Label>Respiratory Rate</Label><Input type="number" placeholder="16" /></div>
          <div className="space-y-2"><Label>SpO2 (%)</Label><Input type="number" placeholder="98" /></div>
          <div className="space-y-2"><Label>Temperature (°C)</Label><Input type="number" step="0.1" placeholder="36.5" /></div>
          <div className="space-y-2"><Label>GCS Score (3-15)</Label><Input type="number" placeholder="15" /></div>
          <div className="space-y-2"><Label>Pain Scale (0-10)</Label><Input type="number" placeholder="5" /></div>
          <div className="space-y-2"><Label>Blood Sugar (mmol/L)</Label><Input type="number" step="0.1" placeholder="5.5" /></div>
          <div className="md:col-span-2 space-y-2"><Label>Chief Complaint</Label><Textarea placeholder="Describe presenting complaint..." /></div>
          <div className="md:col-span-2 space-y-2"><Label>Mechanism of Injury (if trauma)</Label><Textarea placeholder="Describe mechanism..." /></div>
          <div className="md:col-span-2 space-y-2"><Label>Allergies</Label><Input placeholder="Known allergies..." /></div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">Save Assessment</Button>
            <Button type="button" variant="outline">Assign to Doctor</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default EmergencyTriage;
