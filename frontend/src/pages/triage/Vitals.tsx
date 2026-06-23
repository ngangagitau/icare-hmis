import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Vitals() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Vitals Entry</h1>
        <p className="text-muted-foreground text-sm">Record patient vital signs</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Select Patient</CardTitle></CardHeader>
        <CardContent>
          <Select><SelectTrigger><SelectValue placeholder="Search or select patient..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="P-10001">P-10001 — John Mwangi</SelectItem>
              <SelectItem value="P-10002">P-10002 — Mary Achieng</SelectItem>
              <SelectItem value="P-10003">P-10003 — Peter Odhiambo</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Vital Signs</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Blood Pressure (mmHg)</Label><div className="flex gap-2"><Input placeholder="Systolic" /><Input placeholder="Diastolic" /></div></div>
            <div className="space-y-2"><Label>Heart Rate (bpm)</Label><Input placeholder="e.g., 72" /></div>
            <div className="space-y-2"><Label>Temperature (°C)</Label><Input placeholder="e.g., 36.5" /></div>
            <div className="space-y-2"><Label>Respiratory Rate (/min)</Label><Input placeholder="e.g., 18" /></div>
            <div className="space-y-2"><Label>SpO2 (%)</Label><Input placeholder="e.g., 98" /></div>
            <div className="space-y-2"><Label>Weight (kg)</Label><Input placeholder="e.g., 70" /></div>
            <div className="space-y-2"><Label>Height (cm)</Label><Input placeholder="e.g., 170" /></div>
            <div className="space-y-2"><Label>BMI</Label><Input placeholder="Auto-calculated" disabled /></div>
            <div className="space-y-2"><Label>Pain Score (0-10)</Label><Input type="number" min={0} max={10} placeholder="0-10" /></div>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-3 justify-end">
        <Button variant="outline">Clear</Button>
        <Button onClick={() => toast.success("Vitals recorded successfully!")}>Save Vitals</Button>
      </div>
    </div>
  );
}
