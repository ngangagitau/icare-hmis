import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const MortuaryRelease = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Body Release</h1>
      <p className="text-muted-foreground text-sm">Process body release to next of kin</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Release Form</CardTitle></CardHeader>
      <CardContent>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); toast.success("Body released successfully"); }}>
          <div className="space-y-2"><Label>Mortuary ID</Label><Input placeholder="e.g., M-002" /></div>
          <div className="space-y-2"><Label>Deceased Name</Label><Input placeholder="Name" disabled /></div>
          <div className="space-y-2"><Label>Collected By</Label><Input placeholder="Full name" /></div>
          <div className="space-y-2"><Label>Collector ID Number</Label><Input placeholder="National ID" /></div>
          <div className="space-y-2"><Label>Relationship</Label><Input placeholder="Relationship to deceased" /></div>
          <div className="space-y-2"><Label>Burial Permit Number</Label><Input placeholder="Permit number" /></div>
          <div className="space-y-2"><Label>Death Certificate Number</Label><Input placeholder="Certificate number" /></div>
          <div className="space-y-2"><Label>Outstanding Balance (KES)</Label><Input placeholder="0" /></div>
          <div className="space-y-2"><Label>Funeral Home</Label><Input placeholder="e.g., Montezuma Funeral Home" /></div>
          <div className="space-y-2"><Label>Release Date & Time</Label><Input type="datetime-local" /></div>
          <div className="md:col-span-2 space-y-2"><Label>Remarks</Label><Textarea placeholder="Any notes..." /></div>
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">Release Body</Button>
            <Button type="button" variant="outline">Print Release Form</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
);

export default MortuaryRelease;
