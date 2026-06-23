import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const DietaryAssessment = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dietary Assessment</h1>
      <p className="text-muted-foreground text-sm">Nutritional screening and assessment</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Patient Nutritional Assessment</CardTitle></CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("Assessment saved"); }}>
          <div className="space-y-2"><Label>Patient</Label><Input placeholder="Search patient..." /></div>
          <div className="space-y-2"><Label>Height (cm)</Label><Input type="number" placeholder="170" /></div>
          <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" placeholder="70" /></div>
          <div className="space-y-2"><Label>BMI (auto-calculated)</Label><Input placeholder="—" disabled /></div>
          <div className="space-y-2"><Label>MUAC (cm)</Label><Input type="number" step="0.1" placeholder="25" /></div>
          <div className="space-y-2"><Label>Nutritional Risk Score (NRS)</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["0 - No risk", "1 - Low risk", "2 - Moderate risk", "3+ - High risk"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Albumin (g/L)</Label><Input type="number" step="0.1" placeholder="35" /></div>
          <div className="space-y-2"><Label>Pre-Albumin (mg/dL)</Label><Input type="number" step="0.1" placeholder="20" /></div>
          <div className="md:col-span-2 space-y-2"><Label>Dietary History</Label><Textarea placeholder="Usual diet, meal frequency, preferences..." /></div>
          <div className="md:col-span-2 space-y-2"><Label>Allergies & Intolerances</Label><Input placeholder="e.g., Lactose, Gluten, Peanuts..." /></div>
          <div className="md:col-span-2 space-y-2"><Label>Nutritional Plan</Label><Textarea placeholder="Recommended diet, supplements, monitoring..." /></div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">Save Assessment</Button>
            <Button type="button" variant="outline">Generate Diet Plan</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default DietaryAssessment;
