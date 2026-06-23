import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CrossMatch = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Cross Matching</h1>
      <p className="text-muted-foreground text-sm">Compatibility testing before transfusion</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Cross-Match Request</CardTitle></CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("Cross-match completed - Compatible"); }}>
          <div className="space-y-2"><Label>Patient Name / ID</Label><Input placeholder="Search patient..." /></div>
          <div className="space-y-2"><Label>Patient Blood Group</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Unit Number</Label><Input placeholder="Blood unit ID" /></div>
          <div className="space-y-2"><Label>Component</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["Whole Blood", "Packed RBC", "Platelets", "FFP", "Cryoprecipitate"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Units Required</Label><Input type="number" placeholder="2" /></div>
          <div className="space-y-2"><Label>Requesting Doctor</Label><Input placeholder="Doctor name" /></div>
          <div className="space-y-2"><Label>Indication</Label><Input placeholder="e.g., Surgery, Anemia" /></div>
          <div className="space-y-2"><Label>Urgency</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{["Routine", "Urgent", "Emergency (uncrossmatched)"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">Run Cross-Match</Button>
            <Button type="button" variant="outline">Reserve Units</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default CrossMatch;
