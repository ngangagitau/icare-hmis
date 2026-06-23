import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const MortuaryAdmission = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Mortuary Admission</h1>
      <p className="text-muted-foreground text-sm">Register a body admission to the mortuary</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Admission Details</CardTitle></CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("Body admitted to mortuary"); }}>
          <div className="space-y-2"><Label>Deceased Name</Label><Input placeholder="Full name (or Unidentified)" /></div>
          <div className="space-y-2"><Label>ID / Passport Number</Label><Input placeholder="If available" /></div>
          <div className="space-y-2"><Label>Age</Label><Input type="number" placeholder="Age at death" /></div>
          <div className="space-y-2"><Label>Gender</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Date & Time of Death</Label><Input type="datetime-local" /></div>
          <div className="space-y-2"><Label>Place of Death</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["Hospital Ward", "Emergency", "ICU", "OT", "Brought in Dead (BID)", "Other"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Cause of Death (Preliminary)</Label><Input placeholder="e.g., Cardiac arrest, RTA" /></div>
          <div className="space-y-2"><Label>Attending Doctor</Label><Input placeholder="Doctor who certified death" /></div>
          <div className="space-y-2"><Label>Compartment Number</Label>
            <Select><SelectTrigger><SelectValue placeholder="Assign compartment" /></SelectTrigger>
              <SelectContent>{Array.from({ length: 12 }, (_, i) => `C-${String(i + 1).padStart(2, "0")}`).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Next of Kin Name</Label><Input placeholder="Name" /></div>
          <div className="space-y-2"><Label>Next of Kin Phone</Label><Input placeholder="+254 7XX XXX XXX" /></div>
          <div className="space-y-2"><Label>Relationship</Label><Input placeholder="e.g., Son, Wife" /></div>
          <div className="md:col-span-2 space-y-2"><Label>Remarks</Label><Textarea placeholder="Any additional information, personal effects..." /></div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">Admit Body</Button>
            <Button type="button" variant="outline">Print Tag</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default MortuaryAdmission;
